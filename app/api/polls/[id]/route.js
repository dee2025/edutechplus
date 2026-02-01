import pool from "@/lib/db";
import { NextResponse } from "next/server";

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(val);
  });
  return cookies;
}

export async function GET(req, { params }) {
    const param = await params;
  const idOrSlug = param?.id;
  if (!idOrSlug) {
    return NextResponse.json({ message: "Missing poll id" }, { status: 400 });
  }
  try {
    // allow fetching by numeric id or slug
    let pollQuery =
      "SELECT id, slug, question, is_active, start_at, end_at, created_at FROM polls WHERE id = ? LIMIT 1";
    let args = [idOrSlug];
    if (!/^\d+$/.test(String(idOrSlug))) {
      pollQuery =
        "SELECT id, slug, question, is_active, start_at, end_at, created_at FROM polls WHERE slug = ? LIMIT 1";
      args = [idOrSlug];
    }
    const [polls] = await pool.execute(pollQuery, args);

    if (!polls || polls.length === 0) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    const poll = polls[0];

    // do not return inactive or out-of-range polls
    if (
      !poll.is_active ||
      (poll.start_at && new Date(poll.start_at) > new Date()) ||
      (poll.end_at && new Date(poll.end_at) < new Date())
    ) {
      return NextResponse.json(
        { message: "Poll not available" },
        { status: 404 },
      );
    }

    const [options] = await pool.execute(
      "SELECT id, label, votes_count FROM poll_options WHERE poll_id = ? ORDER BY sort_order, id",
      [poll.id],
    );

    const totalVotes = (options || []).reduce(
      (s, o) => s + (o.votes_count || 0),
      0,
    );

    // respond and set a secure HttpOnly voter_token cookie if the visitor does not have one yet
    const response = NextResponse.json({ poll, options, totalVotes });
    try {
      const existing = req.cookies?.get?.("voter_token")?.value;
      if (!existing) {
        let newToken;
        if (globalThis.crypto && globalThis.crypto.randomUUID)
          newToken = globalThis.crypto.randomUUID();
        else {
          const { randomBytes } = await import("crypto");
          newToken = randomBytes(16).toString("hex");
        }
        response.cookies.set("voter_token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
    } catch (cookieErr) {
      console.error("Failed to set voter_token cookie:", cookieErr);
    }

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const idOrSlug = params.id;
  try {
    const body = await req.json();
    const { option_id } = body;

    if (!option_id) {
      return NextResponse.json(
        { message: "Missing option_id" },
        { status: 400 },
      );
    }

    const cookieVal = req.cookies?.get?.("voter_token")?.value;
    const cookieHeader = req.headers.get("cookie");
    const cookies = parseCookies(cookieHeader);

    // allow both server-parsed cookie and header fallback
    let voter_token = cookieVal || cookies.voter_token;
    let tokenToSet = null;
    if (!voter_token) {
      // generate a secure token on server and set it for the visitor (HttpOnly)
      if (globalThis.crypto && globalThis.crypto.randomUUID)
        voter_token = globalThis.crypto.randomUUID();
      else {
        const { randomBytes } = await import("crypto");
        voter_token = randomBytes(16).toString("hex");
      }
      tokenToSet = voter_token;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Validate option exists and get its poll_id
      const [optRows] = await conn.execute(
        "SELECT id, poll_id FROM poll_options WHERE id = ? LIMIT 1",
        [option_id],
      );
      if (!optRows || optRows.length === 0) {
        await conn.rollback();
        const respInvalidOption = NextResponse.json(
          { message: "Invalid option" },
          { status: 400 },
        );
        if (tokenToSet) {
          respInvalidOption.cookies.set("voter_token", tokenToSet, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
        return respInvalidOption;
      }

      const pollId = optRows[0].poll_id;

      // fetch poll to validate active/state
      const [pollRows] = await conn.execute(
        "SELECT id, is_active, start_at, end_at FROM polls WHERE id = ? LIMIT 1",
        [pollId],
      );
      if (!pollRows || pollRows.length === 0) {
        await conn.rollback();
        const respPollNotFound = NextResponse.json(
          { message: "Poll not found" },
          { status: 404 },
        );
        if (tokenToSet) {
          respPollNotFound.cookies.set("voter_token", tokenToSet, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
        return respPollNotFound;
      }

      const poll = pollRows[0];
      if (
        !poll.is_active ||
        (poll.start_at && new Date(poll.start_at) > new Date()) ||
        (poll.end_at && new Date(poll.end_at) < new Date())
      ) {
        await conn.rollback();
        const respUnavailable = NextResponse.json(
          { message: "Poll not available" },
          { status: 400 },
        );
        if (tokenToSet) {
          respUnavailable.cookies.set("voter_token", tokenToSet, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
        return respUnavailable;
      }

      // try to parse auth token to get user id (optional)
      let user_id = null;
      try {
        const authHeader = req.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.slice(7);
          const { verifyToken } = await import("@/lib/auth");
          const payload = await verifyToken(token);
          user_id = payload?.id || null;
        }
      } catch (e) {
        // ignore token errors; voting still allowed for anonymous
      }

      const ip =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        null;
      const user_agent = req.headers.get("user-agent") || null;

      try {
        await conn.execute(
          "INSERT INTO poll_votes (poll_id, option_id, user_id, voter_token, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)",
          [pollId, option_id, user_id, voter_token, ip, user_agent],
        );
      } catch (err) {
        // unique constraint violation -> already voted
        if (
          err &&
          (err.code === "ER_DUP_ENTRY" || (err.errno && err.errno === 1062))
        ) {
          await conn.rollback();
          const respAlreadyVoted = NextResponse.json(
            { message: "Already voted" },
            { status: 409 },
          );
          if (tokenToSet) {
            respAlreadyVoted.cookies.set("voter_token", tokenToSet, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
            });
          }
          return respAlreadyVoted;
        }
        throw err;
      }

      await conn.execute(
        "UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = ?",
        [option_id],
      );

      await conn.commit();

      // Return the fresh snapshot
      const [options] = await pool.execute(
        "SELECT id, label, votes_count FROM poll_options WHERE poll_id = ? ORDER BY id",
        [pollId],
      );
      const totalVotes = (options || []).reduce(
        (s, o) => s + (o.votes_count || 0),
        0,
      );

      const respSuccess = NextResponse.json({
        message: "Voted",
        options,
        totalVotes,
      });
      if (tokenToSet) {
        respSuccess.cookies.set("voter_token", tokenToSet, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
      return respSuccess;
    } catch (err) {
      await conn.rollback();
      console.error(err);
      const respServerErr = NextResponse.json(
        { message: "Server error" },
        { status: 500 },
      );
      if (tokenToSet) {
        respServerErr.cookies.set("voter_token", tokenToSet, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
      return respServerErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    const respBad = NextResponse.json(
      { message: "Bad request" },
      { status: 400 },
    );
    // If we generated a token earlier, make sure client receives it even on error
    if (typeof tokenToSet === "string" && tokenToSet) {
      respBad.cookies.set("voter_token", tokenToSet, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return respBad;
  }
}
