import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    // Check if email credentials are configured
    const requiredVars = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASSWORD",
      "SMTP_FROM_NAME",
      "SMTP_FROM_EMAIL",
    ];

    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing email configuration",
          missing,
          help: "Add these variables to your .env.local file",
        },
        { status: 400 },
      );
    }

    // Try to create a connection
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();

    return NextResponse.json({
      status: "success",
      message: "Email configuration is valid and SMTP connection successful!",
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Email configuration test failed",
        error: error.message,
        help: "Check your SMTP credentials and make sure the server is accessible",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email address is required",
        },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send test email
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Test Email from EduTechPlus",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #06b6d4;">Email Test Successful! ✅</h2>
          <p>This is a test email from your EduTechPlus newsletter system.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: `Email Test Successful!\n\nThis is a test email from your EduTechPlus newsletter system.\nIf you received this email, your email configuration is working correctly!\n\nSent at: ${new Date().toLocaleString()}`,
    });

    return NextResponse.json({
      status: "success",
      message: `Test email sent successfully to ${email}!`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to send test email",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
