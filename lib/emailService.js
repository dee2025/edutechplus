import nodemailer from "nodemailer";

// Check if email is configured
export function isEmailConfigured() {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM_NAME &&
    process.env.SMTP_FROM_EMAIL
  );
}

// Create reusable transporter
const createTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error(
      "Email service not configured. Please add SMTP credentials to .env.local",
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send welcome email to new subscriber
export async function sendWelcomeEmail(email) {
  if (!isEmailConfigured()) {
    console.warn("⚠️  Email not configured. Skipping welcome email to:", email);
    return {
      success: false,
      error: "Email service not configured",
      skipped: true,
    };
  }

  try {
    const transporter = createTransporter();
    const unsubscribeLink = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe`;

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to EduTechPlus Newsletter! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to EduTechPlus</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                          EduTech<span style="color: #fbbf24;">+</span>
                        </h1>
                        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Tech & Education News</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Welcome Aboard! 🚀</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                          Thank you for subscribing to the EduTechPlus newsletter! We're thrilled to have you join our community of tech enthusiasts and lifelong learners.
                        </p>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                          Here's what you can expect from us:
                        </p>
                        
                        <ul style="color: #4b5563; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
                          <li>Weekly updates on AI, machine learning, and emerging technologies</li>
                          <li>Programming tutorials and coding best practices</li>
                          <li>Latest gadget reviews and tech news</li>
                          <li>Startup insights and EdTech innovations</li>
                          <li>Exclusive content curated just for our subscribers</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" 
                             style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            Explore Our Latest Articles
                          </a>
                        </div>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0; font-size: 16px;">
                          Stay curious and keep learning! 💡
                        </p>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 5px 0 0 0; font-size: 16px;">
                          <strong>The EduTechPlus Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                          You're receiving this email because you subscribed to our newsletter.
                        </p>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                          <a href="${unsubscribeLink}" style="color: #06b6d4; text-decoration: none;">Unsubscribe</a> | 
                          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy-policy" style="color: #06b6d4; text-decoration: none;">Privacy Policy</a>
                        </p>
                        <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
                          © ${new Date().getFullYear()} EduTechPlus. All rights reserved.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `Welcome to EduTechPlus Newsletter!
      
Thank you for subscribing! We're thrilled to have you join our community of tech enthusiasts and lifelong learners.

Here's what you can expect from us:
- Weekly updates on AI, machine learning, and emerging technologies
- Programming tutorials and coding best practices
- Latest gadget reviews and tech news
- Startup insights and EdTech innovations
- Exclusive content curated just for our subscribers

Visit us at: ${process.env.NEXT_PUBLIC_SITE_URL}

Stay curious and keep learning!
The EduTechPlus Team

---
You're receiving this email because you subscribed to our newsletter.
Unsubscribe: ${unsubscribeLink}
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
}

// Send newsletter to all active subscribers
export async function sendNewsletterEmail({
  subject,
  htmlContent,
  textContent,
  subscribers,
}) {
  if (!isEmailConfigured()) {
    console.error("❌ Email not configured. Cannot send newsletter.");
    return {
      success: false,
      error:
        "Email service not configured. Please add SMTP credentials to .env.local",
    };
  }

  try {
    const transporter = createTransporter();
    const unsubscribeLink = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe`;

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const promises = batch.map(async (email) => {
        try {
          await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
            to: email,
            subject: subject,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                          
                          <!-- Header -->
                          <tr>
                            <td style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; text-align: center;">
                              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                EduTech<span style="color: #fbbf24;">+</span>
                              </h1>
                            </td>
                          </tr>
                          
                          <!-- Content -->
                          <tr>
                            <td style="padding: 40px 30px;">
                              ${htmlContent}
                            </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                                You're receiving this email because you subscribed to our newsletter.
                              </p>
                              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                                <a href="${unsubscribeLink}" style="color: #06b6d4; text-decoration: none;">Unsubscribe</a> | 
                                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy-policy" style="color: #06b6d4; text-decoration: none;">Privacy Policy</a>
                              </p>
                              <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
                                © ${new Date().getFullYear()} EduTechPlus. All rights reserved.
                              </p>
                            </td>
                          </tr>
                          
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `,
            text: `${textContent}\n\n---\nYou're receiving this email because you subscribed to our newsletter.\nUnsubscribe: ${unsubscribeLink}`,
          });
          return { email, success: true };
        } catch (error) {
          console.error(`Error sending to ${email}:`, error);
          return { email, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return {
      success: true,
      results,
      total: subscribers.length,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return { success: false, error: error.message };
  }
}

// Send unsubscribe confirmation email
export async function sendUnsubscribeEmail(email) {
  if (!isEmailConfigured()) {
    console.warn(
      "⚠️  Email not configured. Skipping unsubscribe confirmation to:",
      email,
    );
    return {
      success: false,
      error: "Email service not configured",
      skipped: true,
    };
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "You have been unsubscribed",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                          EduTech<span style="color: #fbbf24;">+</span>
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px; text-align: center;">
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">You've Been Unsubscribed</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">
                          We're sorry to see you go! You've been successfully unsubscribed from the EduTechPlus newsletter.
                        </p>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                          You will no longer receive email updates from us.
                        </p>
                        
                        <p style="color: #6b7280; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                          Changed your mind? You can always subscribe again at 
                          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #06b6d4; text-decoration: none;">EduTechPlus</a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                          © ${new Date().getFullYear()} EduTechPlus. All rights reserved.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `You've Been Unsubscribed

We're sorry to see you go! You've been successfully unsubscribed from the EduTechPlus newsletter.

You will no longer receive email updates from us.

Changed your mind? You can always subscribe again at ${process.env.NEXT_PUBLIC_SITE_URL}

© ${new Date().getFullYear()} EduTechPlus. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending unsubscribe email:", error);
    return { success: false, error: error.message };
  }
}
