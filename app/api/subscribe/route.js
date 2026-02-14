import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/emailService";

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

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingSubscriber = await query({
      query: "SELECT id, status FROM subscribers WHERE email = ?",
      values: [normalizedEmail],
    });

    if (existingSubscriber.length > 0) {
      const subscriber = existingSubscriber[0];

      // If previously unsubscribed, reactivate
      if (subscriber.status === "unsubscribed") {
        await query({
          query:
            "UPDATE subscribers SET status = 'active', subscribed_at = NOW(), unsubscribed_at = NULL WHERE id = ?",
          values: [subscriber.id],
        });
        
        // Send welcome back email
        try {
          const result = await sendWelcomeEmail(normalizedEmail);
          if (result.skipped) {
            console.warn('Welcome email skipped - email not configured');
          }
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
          // Don't fail the subscription if email fails
        }
        
        return NextResponse.json(
          { message: "Welcome back! Your subscription has been reactivated." },
          { status: 200 },
        );
      }

      return NextResponse.json(
        { error: "This email is already subscribed to our newsletter" },
        { status: 409 },
      );
    }

    // Insert new subscriber
    await query({
      query: "INSERT INTO subscribers (email) VALUES (?)",
      values: [normalizedEmail],
    });

    // Send welcome email
    try {
      const result = await sendWelcomeEmail(normalizedEmail);
      if (result.skipped) {
        console.warn('Welcome email skipped - email not configured');
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json(
      {
        message: "Successfully subscribed! Check your inbox for confirmation.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 },
    );
  }
}
