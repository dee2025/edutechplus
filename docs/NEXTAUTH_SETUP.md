# NextAuth Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for ArticleGrip using NextAuth.

## Features

- ✅ User registration and login with email/password
- ✅ Google OAuth 2.0 authentication
- ✅ Session management with JWT
- ✅ User profile page
- ✅ Protected routes

## Prerequisites

- Node.js 16+ installed
- MySQL database set up
- Google Cloud project (for OAuth credentials)

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Select "Web Application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy your **Client ID** and **Client Secret**

## Step 2: Set Environment Variables

Create or update your `.env.local` file:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Generate NEXTAUTH_SECRET with:
# openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=dbevinfo
```

### Generate NEXTAUTH_SECRET (Required!)

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (with OpenSSL installed):
openssl rand -base64 32

# Or use an online generator:
# https://generate-secret.vercel.app/32
```

## Step 3: Database Setup

The authentication system uses the existing `users` table. Ensure your database has this table with the required fields:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  avatar_url VARCHAR(512) DEFAULT NULL,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

## Step 4: Install Dependencies

The required packages are already installed:

```bash
npm install next-auth @next-auth/prisma-adapter prisma bcryptjs --legacy-peer-deps
```

## Step 5: Usage

### Authentication Pages

**Sign Up:**

```
http://localhost:3000/auth/signup
```

**Sign In:**

```
http://localhost:3000/auth/login
```

**With Google:**
Click "Continue with Google" button on either page.

### Protecting Pages

Use `useSession` hook to protect client-side pages:

```jsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.name}</h1>
      <p>Email: {session?.user?.email}</p>
    </div>
  );
}
```

### Protecting API Routes

```javascript
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your protected API logic here
  return NextResponse.json({ message: "Success" });
}
```

### Getting Session on Server

```javascript
import { auth } from "@/auth";

export default async function ServerComponent() {
  const session = await auth();

  if (!session) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

## Features By Page

### `/auth/signup`

- Email/password registration
- Google OAuth sign up
- Password validation (min 6 characters)
- Email uniqueness check
- Auto-login after signup

### `/auth/login`

- Email/password login
- Google OAuth login
- Remember me support
- Error handling

### `/profile`

- View user information
- Logout functionality
- User session management

## File Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── [...nextauth]/
│   │   │   └── route.js          # NextAuth API routes
│   │   ├── signup/
│   │   │   └── route.js          # Signup endpoint
│   │   └── other-auth-routes/
│   │
│   └── other-api-routes/
│
├── (website)/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.jsx          # Login page
│   │   └── signup/
│   │       └── page.jsx          # Signup page
│   │
│   └── profile/
│       └── page.jsx              # User profile (protected)
│
└── layout.js                      # Includes AuthProvider

components/
├── AuthProvider.jsx               # NextAuth session provider

auth.js                            # NextAuth configuration
```

## Troubleshooting

### "NEXTAUTH_SECRET is not set"

- Generate a secret using `openssl rand -base64 32`
- Add it to `.env.local` as `NEXTAUTH_SECRET=<generated-secret>`

### "Google OAuth not working"

- Verify Client ID and Client Secret are correct
- Check that redirect URI is registered in Google Cloud Console
- Ensure `NEXTAUTH_URL` matches your application URL

### "User already exists with this email"

- The email is registered with another provider or already exists in database
- Allow users to sign in with existing account

### "Password must be at least 6 characters"

- Password validation requires minimum 6 characters
- Consider using a password manager for secure passwords

### Database Connection Error

- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env.local`
- Ensure MySQL server is running
- Verify database and users table exist

## Production Setup

### Deploy to Vercel

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXTAUTH_URL=https://yourdomain.com`
   - `NEXTAUTH_SECRET=<your-generated-secret>`
   - `GOOGLE_CLIENT_ID=<your-google-client-id>`
   - `GOOGLE_CLIENT_SECRET=<your-google-client-secret>`
   - Database credentials

4. Add production redirect URI to Google Cloud:
   - `https://yourdomain.com/api/auth/callback/google`

### HTTPS Required

- Google OAuth requires HTTPS in production
- Vercel provides free HTTPS for all deployments
- Self-hosted: obtain SSL certificate using Let's Encrypt

## Security Notes

- Always keep `NEXTAUTH_SECRET` private
- Never commit `.env.local` to version control
- Use strong, unique passwords
- Regenerate OAuth credentials if compromised
- Use HTTPS in production
- Enable CSRF protection (default in NextAuth)

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth GitHub Issues](https://github.com/nextauthjs/next-auth/issues)

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review NextAuth.js documentation
3. Check your environment variables
4. Review console/terminal for error messages
5. Create an issue on GitHub with details
