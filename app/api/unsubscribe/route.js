import { query } from "@/lib/db";
import { sendUnsubscribeEmail } from "@/lib/emailService";
import { NextResponse } from "next/server";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 },
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email exists
    const existingSubscriber = await query({
      query: "SELECT id, status FROM subscribers WHERE email = ?",
      values: [normalizedEmail],
    });

    if (existingSubscriber.length === 0) {
      return NextResponse.json(
        { error: "Email address not found in our subscriber list" },
        { status: 404 },
      );
    }

    const subscriber = existingSubscriber[0];

    if (subscriber.status === "unsubscribed") {
      return NextResponse.json(
        { error: "This email is already unsubscribed" },
        { status: 400 },
      );
    }

    // Update subscriber status to unsubscribed
    await query({
      query:
        "UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = NOW() WHERE id = ?",
      values: [subscriber.id],
    });

    // Send unsubscribe confirmation email
    try {
      const result = await sendUnsubscribeEmail(normalizedEmail);
      if (result.skipped) {
        console.warn("Unsubscribe email skipped - email not configured");
      }
    } catch (emailError) {
      console.error("Error sending unsubscribe email:", emailError);
      // Don't fail the unsubscription if email fails
    }

    return NextResponse.json(
      { message: "Successfully unsubscribed. Sorry to see you go!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe. Please try again later." },
      { status: 500 },
    );
  }
}
