import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendNewsletterEmail, isEmailConfigured } from "@/lib/emailService";

export async function POST(request) {
  try {
    // Check if email is configured first
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { 
          error: "Email service not configured. Please add SMTP credentials to .env.local and visit /admin/email-test to verify setup." 
        },
        { status: 400 }
      );
    }

    const { subject, htmlContent, textContent } = await request.json();

    // Validate inputs
    if (!subject || !htmlContent || !textContent) {
      return NextResponse.json(
        { error: "Subject, HTML content, and text content are required" },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const subscribers = await query({
      query: "SELECT email FROM subscribers WHERE status = 'active'",
      values: [],
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers found" },
        { status: 404 }
      );
    }

    const subscriberEmails = subscribers.map(sub => sub.email);

    // Send newsletter
    const result = await sendNewsletterEmail({
      subject,
      htmlContent,
      textContent,
      subscribers: subscriberEmails,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send newsletter", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Newsletter sent successfully",
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      results: result.results,
    });
  } catch (error) {
    console.error("Newsletter sending error:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter. Please try again later." },
      { status: 500 }
    );
  }
}
