# Email System Setup & Configuration Guide

Complete guide for setting up and using the newsletter email system in ArticleGrip Next.

## 📧 Features

✅ **Automated Welcome Emails** - Sent automatically when users subscribe
✅ **Unsubscribe Confirmation** - Email confirmation when users unsubscribe  
✅ **Newsletter Broadcasting** - Send custom newsletters to all active subscribers
✅ **Batch Processing** - Sends emails in batches to avoid SMTP limits
✅ **Beautiful HTML Templates** - Responsive email templates with fallback text
✅ **Email Testing** - Admin interface to test email configuration
✅ **Error Handling** - Graceful failure handling with detailed logging

---

## 🚀 Quick Setup

### 1. Install Dependencies

Already installed:

```bash
npm install nodemailer  ✓
npm install dotenv      ✓
```

### 2. Configure Email Settings

Add these variables to your `.env.local` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Sender Information
SMTP_FROM_NAME=EduTechPlus
SMTP_FROM_EMAIL=noreply@edutechplus.com

# Site URL (required for unsubscribe links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Test Your Configuration

1. Navigate to `/admin/email-test`
2. Check configuration status
3. Send a test email to verify setup

---

## 🔐 Email Provider Setup

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other" (name it "EduTechPlus")
   - Copy the 16-character password

3. **Configure .env.local**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App password
   ```

### SendGrid Setup (Recommended for Production)

1. **Create SendGrid Account** - [sendgrid.com](https://sendgrid.com)
2. **Create API Key** - Settings → API Keys → Create API Key
3. **Configure .env.local**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey  # Literally the word "apikey"
   SMTP_PASSWORD=your-sendgrid-api-key
   ```

### Mailgun Setup

1. **Create Mailgun Account** - [mailgun.com](https://mailgun.com)
2. **Get SMTP Credentials** - Sending → Domain Settings → SMTP
3. **Configure .env.local**
   ```env
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=postmaster@your-domain.mailgun.org
   SMTP_PASSWORD=your-mailgun-password
   ```

### AWS SES Setup

1. **Verify Domain/Email** - SES Console → Verified Identities
2. **Create SMTP Credentials** - SMTP Settings → Create SMTP Credentials
3. **Configure .env.local**
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com  # Or your region
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-ses-username
   SMTP_PASSWORD=your-ses-password
   ```

---

## 📨 Email Types & Templates

### 1. Welcome Email

**Trigger:** User subscribes to newsletter
**Sent by:** `/api/subscribe`
**Template:** Professional gradient header, features list, CTA button

**Customization:**
Edit `lib/emailService.js` → `sendWelcomeEmail()` function

### 2. Unsubscribe Confirmation

**Trigger:** User unsubscribes
**Sent by:** `/api/unsubscribe`  
**Template:** Simple confirmation with re-subscribe link

### 3. Custom Newsletter

**Trigger:** Admin sends via `/admin/newsletter`
**Template:** Flexible HTML + plain text content
**Features:**

- Custom subject line
- Rich HTML content
- Plain text fallback
- Batch sending (50 emails per batch)

---

## 🎯 How to Use

### For Users

**Subscribe:**

1. Enter email in newsletter form on homepage
2. Click "Subscribe"
3. Check inbox for welcome email

**Unsubscribe:**

1. Visit `/unsubscribe` or click link in any email
2. Enter email address
3. Confirm unsubscription

### For Admins

**View Subscribers:**

1. Login to admin panel
2. Go to "Subscribers" in sidebar
3. Filter by status (All/Active/Unsubscribed)
4. Export to CSV if needed

**Send Newsletter:**

1. Go to "Newsletter" in admin sidebar
2. Enter subject line
3. Write HTML content (with inline styles)
4. Write plain text version
5. Preview to check formatting
6. Click "Send Newsletter"
7. Confirm to send to all active subscribers

**Test Email Configuration:**

1. Go to "Email Test" in admin sidebar
2. View configuration status
3. Send test email to yourself
4. Verify reception

---

## 🛠️ API Endpoints

### Subscribe

```http
POST /api/subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Responses:**

- `201` - New subscription created (welcome email sent)
- `200` - Reactivated previous subscription (welcome email sent)
- `409` - Already subscribed
- `400` - Invalid email

### Unsubscribe

```http
POST /api/unsubscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Responses:**

- `200` - Unsubscribed successfully (confirmation email sent)
- `404` - Email not found
- `400` - Already unsubscribed

### Send Newsletter (Admin)

```http
POST /api/admin/newsletter/send
Content-Type: application/json

{
  "subject": "Newsletter Title",
  "htmlContent": "<h2>Content...</h2>",
  "textContent": "Plain text version..."
}
```

**Response:**

```json
{
  "message": "Newsletter sent successfully",
  "total": 100,
  "sent": 98,
  "failed": 2,
  "results": [...]
}
```

---

## 📊 Email Service Features

### Batch Processing

- Sends 50 emails per batch
- 1-second delay between batches
- Prevents SMTP rate limiting

### Error Handling

- Individual email failures don't stop the batch
- Detailed error reporting
- Subscription/unsubscription succeeds even if email fails

### Email Formatting

- Responsive HTML templates
- Inline CSS for compatibility
- Plain text fallback
- Unsubscribe link in footer
- Professional branding

---

## 🎨 Customizing Email Templates

### Welcome Email Template

Location: `lib/emailService.js` → `sendWelcomeEmail()`

**Key sections to customize:**

- Header gradient colors
- Welcome message text
- Feature list items
- CTA button text and link
- Footer text

**Example modification:**

```javascript
// Change gradient colors
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);

// Update feature list
<li>Your custom feature description</li>

// Modify CTA
<a href="${YOUR_LINK}" style="...">Your CTA Text</a>
```

### Newsletter Template

Location: `lib/emailService.js` → `sendNewsletterEmail()`

The newsletter uses your custom HTML content wrapped in a branded template with:

- Header with logo
- Your content in the body
- Footer with unsubscribe link

**HTML Content Best Practices:**

```html
<!-- Use inline styles -->
<h2 style="color: #1f2937; margin-bottom: 15px;">Heading</h2>

<!-- Responsive images -->
<img src="URL" alt="Description" style="max-width: 100%; height: auto;" />

<!-- Call-to-action buttons -->
<a
  href="URL"
  style="display: inline-block; background: #06b6d4; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px;"
>
  Click Here
</a>

<!-- Content boxes -->
<div
  style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;"
>
  Box content
</div>
```

---

## 🔍 Troubleshooting

### Email Not Sending

**Check Configuration:**

1. Visit `/admin/email-test`
2. Verify all environment variables are set
3. Check SMTP credentials are correct

**Common Issues:**

- **"Authentication failed"** → Wrong username/password
- **"Connection timeout"** → Wrong host/port or firewall blocking
- **"Self-signed certificate"** → Set `SMTP_SECURE=false` for port 587

### Emails Going to Spam

**Solutions:**

1. **Use a verified domain** - Set up SPF, DKIM, DMARC records
2. **Use professional email service** - SendGrid, Mailgun, SES
3. **Include unsubscribe link** - Already included in templates
4. **Don't use spam trigger words** - FREE, $$, URGENT, etc.
5. **Test with Mail Tester** - [mail-tester.com](https://www.mail-tester.com)

### Gmail App Password Not Working

1. Ensure 2FA is enabled
2. Wait 15 minutes after generating App Password
3. Remove spaces from the password in `.env.local`
4. Try generating a new App Password

### Rate Limiting

**Symptoms:** Some emails fail after several succeed

**Solutions:**

- **Gmail:** Max 500 emails/day (free), 2000/day (Workspace)
- **SendGrid:** 100 emails/day (free), more with paid plans
- Increase delay between batches in `emailService.js`
- Use dedicated email service for production

---

## 📈 Best Practices

### Development

- ✅ Use Gmail App Password for testing
- ✅ Test with your own email first
- ✅ Check both HTML and text versions
- ✅ Preview emails before sending

### Production

- ✅ Use professional email service (SendGrid, SES, Mailgun)
- ✅ Set up SPF, DKIM, and DMARC records
- ✅ Use a verified domain
- ✅ Monitor bounce rates and complaints
- ✅ Implement double opt-in (optional)
- ✅ Regular list cleaning
- ✅ Respect unsubscribe requests immediately

### Email Content

- ✅ Clear, concise subject lines (< 50 characters)
- ✅ Personalization when possible
- ✅ Mobile-responsive design
- ✅ Single clear call-to-action
- ✅ Balance text and images
- ✅ Include plain text version
- ✅ Test across email clients

---

## 🔐 Security Considerations

### Environment Variables

- ❌ Never commit `.env.local` to Git
- ✅ Use `.gitignore` to exclude it
- ✅ Use different credentials for dev/prod
- ✅ Rotate passwords regularly

### Email Validation

- ✅ Regex validation on both client and server
- ✅ Email normalization (lowercase, trim)
- ✅ Rate limiting on subscribe/unsubscribe endpoints
- ✅ CAPTCHA for high-traffic sites (optional)

### Data Protection

- ✅ Store only necessary data (email, status, dates)
- ✅ Encrypt email credentials
- ✅ Comply with GDPR/CAN-SPAM
- ✅ Allow users to request data deletion

---

## 📝 Files Created/Modified

### New Files

- `lib/emailService.js` - Core email functions
- `app/api/subscribe/route.js` - Updated with email sending
- `app/api/unsubscribe/route.js` - Updated with email sending
- `app/api/admin/newsletter/send/route.js` - Newsletter API
- `app/api/admin/test-email/route.js` - Email testing API
- `app/admin/newsletter/page.jsx` - Newsletter UI
- `app/admin/email-test/page.jsx` - Email test UI
- `.env.email.example` - Environment variables example

### Modified Files

- `components/admin/Sidebar.jsx` - Added Newsletter & Email Test links
- `package.json` - Added nodemailer dependency

---

## 🚀 Next Steps

1. **Set up email credentials** in `.env.local`
2. **Test configuration** at `/admin/email-test`
3. **Send test newsletter** to yourself
4. **Verify welcome emails** work when subscribing
5. **Monitor email delivery** and adjust as needed

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid Email Best Practices](https://sendgrid.com/blog/email-best-practices/)
- [CAN-SPAM Compliance](https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/guides/email-design/)

---

## 💡 Tips for Success

1. **Start Simple** - Test with Gmail first
2. **Monitor Metrics** - Track open/click rates
3. **Segment Your List** - Different content for different audiences
4. **A/B Testing** - Test subject lines and content
5. **Consistent Schedule** - Weekly or bi-weekly newsletters
6. **Valuable Content** - Provide real value to subscribers
7. **Respect Privacy** - Make unsubscribing easy

---

**Need Help?** Open an issue or check the troubleshooting section above!
