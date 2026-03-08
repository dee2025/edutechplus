"use client";

import { useEffect, useState } from "react";

// Track recently read articles in localStorage under key 'recent_articles'
// Stores up to 25 items: { slug, title, featured_image, ts }
export default function TrackViewClient({ article }) {
  useEffect(() => {
    const dev = process.env.NODE_ENV !== "production";

    if (!article || typeof window === "undefined") {
      if (dev)
        console.debug("TrackViewClient: no article or not in browser", {
          article,
        });
      return;
    }

    if (dev) console.debug("TrackViewClient mounted", { slug: article.slug });

    try {
      const key = "recent_articles";
      const raw = localStorage.getItem(key);
      let list = raw ? JSON.parse(raw) : [];

      const item = {
        slug: article.slug,
        title: article.title,
        featured_image: article.featured_image || null,
        category_slug: article.category_slug || null,
        ts: Date.now(),
      };

      // remove any existing item with same slug
      list = list.filter((i) => i.slug !== item.slug);
      list.unshift(item);

      // cap length
      const max = 25;
      if (list.length > max) list = list.slice(0, max);

      localStorage.setItem(key, JSON.stringify(list));

      // Also record view server-side (public counter) and per-user read (if logged in)
      try {
        const viewedKey = `viewed_article_${article.slug}`;
        const pendingKey = `${viewedKey}_pending`;
        const ttl = 1000 * 60 * 60 * 24; // 24 hours
        const viewed = localStorage.getItem(viewedKey);
        const pending = localStorage.getItem(pendingKey);
        const now = Date.now();
        if (dev)
          console.debug("TrackViewClient: viewedKey", {
            viewedKey,
            viewed,
            pending,
          });

        // treat invalid stored values as expired/missing
        const parsed = parseInt(viewed, 10);
        const hasValidTs = Number.isFinite(parsed) && parsed > 0;
        const elapsed = hasValidTs ? now - parsed : Infinity;

        // If another instance recently started recording (pending within 60s), skip
        const parsedPending = parseInt(pending, 10);
        const pendingRecent =
          Number.isFinite(parsedPending) && now - parsedPending < 60 * 1000;

        if (!hasValidTs) {
          if (dev && !pendingRecent)
            console.debug(
              "TrackViewClient: viewedKey invalid or missing, will send requests",
              { viewed },
            );
        }

        if ((!hasValidTs || elapsed >= ttl) && !pendingRecent) {
          if (dev)
            console.debug("TrackViewClient: sending view/read requests", {
              slug: article.slug,
            });

          // mark pending so other mounts won't send concurrently
          try {
            localStorage.setItem(pendingKey, String(now));
          } catch (e) {
            if (dev) console.warn("TrackViewClient: failed to set pending", e);
          }

          let attempts = 0;
          const maxAttempts = 2;

          async function doAttempt() {
            attempts += 1;

            const publicReq = fetch(
              `/api/public/articles/${article.slug}/view`,
              { method: "POST" },
            ).catch((err) => ({ ok: false, err }));

            const authReq = fetch(`/api/auth/reads`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              body: JSON.stringify({
                slug: article.slug,
                title: article.title,
              }),
            }).catch((err) => ({ ok: false, err }));

            try {
              const results = await Promise.all([publicReq, authReq]);
              if (dev)
                console.debug("TrackViewClient: view results", {
                  attempt: attempts,
                  results,
                });

              const ok = results.some((r) => r && r.ok);
              if (ok) {
                const publicRes = results[0];
                if (publicRes?.ok && publicRes?.json) {
                  try {
                    const payload = await publicRes.json();
                    if (typeof payload?.views === "number") {
                      window.dispatchEvent(
                        new CustomEvent("article-view-updated", {
                          detail: {
                            slug: article.slug,
                            views: payload.views,
                          },
                        }),
                      );
                    }
                  } catch {
                    // Ignore response parsing failures.
                  }
                }

                try {
                  localStorage.setItem(viewedKey, String(now));
                  localStorage.removeItem(pendingKey);
                  if (dev)
                    console.debug("TrackViewClient: set viewedKey", viewedKey);
                } catch (e) {
                  if (dev)
                    console.warn("TrackViewClient: failed to set viewedKey", e);
                }
                return;
              }

              if (attempts <= maxAttempts) {
                const delay = 2000 * attempts;
                if (dev)
                  console.debug(`TrackViewClient: retrying in ${delay}ms`, {
                    attempts,
                  });
                setTimeout(doAttempt, delay);
              } else {
                console.warn(
                  "Both view endpoints failed after retries",
                  results,
                );
                // clear pending so future loads can retry
                try {
                  localStorage.removeItem(pendingKey);
                } catch (e) {}
              }
            } catch (e) {
              console.warn("Error recording view/read", e);
              if (attempts <= maxAttempts)
                setTimeout(doAttempt, 2000 * attempts);
              else {
                try {
                  localStorage.removeItem(pendingKey);
                } catch (e) {}
              }
            }
          }

          // start attempt
          doAttempt();
        } else {
          if (dev)
            console.debug(
              "TrackViewClient: skipping requests due to TTL or pending",
              {
                slug: article.slug,
                viewed,
                parsed,
                elapsed,
                pending,
              },
            );
        }
      } catch (e) {
        if (dev) console.warn("TrackViewClient: error in recording flow", e);
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production")
        console.warn("TrackViewClient: localStorage error", e);
    }
  }, [article]);

  const [lastResult, setLastResult] = useState(null);
  const [debugMessage, setDebugMessage] = useState(null);

  function clearViewedKey() {
    try {
      const k = `viewed_article_${article.slug}`;
      localStorage.removeItem(k);
      console.debug("TrackViewClient: cleared viewed key", k);
      setDebugMessage("Cleared viewed TTL for this article");
      setTimeout(() => setDebugMessage(null), 3000);
    } catch (e) {
      console.warn(e);
      setDebugMessage("Failed to clear viewed TTL");
      setTimeout(() => setDebugMessage(null), 3000);
    }
  }

  async function forceRecord() {
    try {
      const viewedKey = `viewed_article_${article.slug}`;
      const pendingKey = `${viewedKey}_pending`;
      const now = Date.now();

      // if another instance is pending recently, skip
      const pending = localStorage.getItem(pendingKey);
      const parsedPending = parseInt(pending, 10);
      const pendingRecent =
        Number.isFinite(parsedPending) && now - parsedPending < 60 * 1000;
      if (pendingRecent) {
        setDebugMessage("Force record skipped (already pending)");
        setTimeout(() => setDebugMessage(null), 2000);
        return;
      }

      // mark pending
      try {
        localStorage.setItem(pendingKey, String(now));
      } catch (e) {}

      const q =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();
      const debug = q.get("track_debug") === "1" ? "?debug=1" : "";

      const [pubRes, authRes] = await Promise.all([
        fetch(`/api/public/articles/${article.slug}/view${debug}`, {
          method: "POST",
        }).catch((err) => ({ ok: false, err })),
        fetch(`/api/auth/reads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ slug: article.slug, title: article.title }),
        }).catch((err) => ({ ok: false, err })),
      ]);

      let pubJson = null;
      let authJson = null;
      try {
        pubJson =
          pubRes && pubRes.json ? await pubRes.json() : { message: "no-json" };
      } catch (e) {
        pubJson = { message: "no-json" };
      }
      try {
        authJson =
          authRes && authRes.json
            ? await authRes.json()
            : { message: "no-json" };
      } catch (e) {
        authJson = { message: "no-json" };
      }

      console.debug("forceRecord", {
        pub: pubRes && pubRes.status,
        pubJson,
        auth: authRes && authRes.status,
        authJson,
      });
      setLastResult({
        pubStatus: pubRes && pubRes.status,
        pubJson,
        authStatus: authRes && authRes.status,
        authJson,
      });

      if ((pubRes && pubRes.ok) || (authRes && authRes.ok)) {
        if (typeof pubJson?.views === "number") {
          window.dispatchEvent(
            new CustomEvent("article-view-updated", {
              detail: {
                slug: article.slug,
                views: pubJson.views,
              },
            }),
          );
        }

        try {
          localStorage.setItem(viewedKey, String(Date.now()));
          localStorage.removeItem(pendingKey);
        } catch (e) {}
        setDebugMessage("Force record succeeded");
        setTimeout(() => setDebugMessage(null), 3000);
      } else {
        // failed: clear pending so future attempts can try again
        try {
          localStorage.removeItem(pendingKey);
        } catch (e) {}
      }
    } catch (e) {
      console.warn("forceRecord error", e);
      setLastResult({ error: String(e) });
      try {
        const pendingKey = `viewed_article_${article.slug}_pending`;
        localStorage.removeItem(pendingKey);
      } catch (e) {}
    }
  }

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const isDebugParam = params.get("track_debug") === "1";
        if (isDebugParam) {
          console.debug(
            "TrackViewClient: auto clearing TTL and forcing record (track_debug=1)",
          );
          // Auto-clear viewed TTL and force a record only in explicit debug mode.
          clearViewedKey();
          forceRecord();
        }
      }
    } catch (e) {
      // ignore
    }
  }, [article.slug]);

  const showDebug =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("track_debug") === "1";

  return (
    // dev helper panel for testing
    showDebug ? (
      <div style={{ position: "fixed", bottom: 12, right: 12, zIndex: 9999 }}>
        <div className="flex flex-col gap-2 items-end">
          {/* Debug/info only — actions run automatically on page load in dev or with ?track_debug=1 */}

          {debugMessage && (
            <div className="mt-2 px-3 py-2 bg-green-600 text-white rounded text-sm">
              {debugMessage}
            </div>
          )}

          <div className="mt-2 px-3 py-2 bg-yellow-600 text-black rounded text-sm">
            Debug mode: views auto-record on page load
          </div>

          {lastResult && (
            <pre className="mt-2 p-2 bg-[#0b0f19] border border-gray-700 text-xs text-gray-200 rounded max-w-xs overflow-auto">
              {JSON.stringify(lastResult)}
            </pre>
          )}
        </div>
      </div>
    ) : null
  );
}
