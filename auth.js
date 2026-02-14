import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const config = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const users = await query({
            query:
              "SELECT id, email, name, password FROM users WHERE email = ?",
            values: [credentials.email],
          });

          if (users.length === 0) {
            throw new Error("User not found");
          }

          const user = users[0];
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign in
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUsers = await query({
            query: "SELECT id, name, avatar_url FROM users WHERE email = ?",
            values: [user.email],
          });

          if (existingUsers.length === 0) {
            // Create new user from Google profile (NULL password for OAuth users)
            const result = await query({
              query:
                "INSERT INTO users (name, email, password, avatar_url, provider, provider_id, email_verified, is_active) VALUES (?, ?, NULL, ?, ?, ?, NOW(), 1)",
              values: [
                user.name || profile?.name || "User",
                user.email,
                user.image || null,
                "google",
                profile?.sub || account?.providerAccountId,
              ],
            });
            // Attach the new user ID to the user object
            user.id = result.insertId.toString();
          } else {
            // Update existing user with Google info and track provider
            await query({
              query:
                "UPDATE users SET name = ?, avatar_url = ?, provider = ?, provider_id = ?, email_verified = NOW() WHERE email = ?",
              values: [
                user.name || existingUsers[0].name,
                user.image || existingUsers[0].avatar_url,
                "google",
                profile?.sub || account?.providerAccountId,
                user.email,
              ],
            });
            // Attach existing user ID to the user object
            user.id = existingUsers[0].id.toString();
          }

          return true;
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }

      // Handle credentials sign in - fetch user ID from database
      if (!account?.provider || account?.provider === "credentials") {
        try {
          const users = await query({
            query: "SELECT id FROM users WHERE email = ?",
            values: [user.email],
          });
          if (users.length > 0) {
            user.id = users[0].id.toString();
          }
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // If this is the first sign in, use the user ID
      if (user?.id) {
        token.id = user.id;
      }

      // For subsequent requests, ensure we have the user ID
      if (!token.id && token.email) {
        const users = await query({
          query: "SELECT id FROM users WHERE email = ?",
          values: [token.email],
        });
        if (users.length > 0) {
          token.id = users[0].id.toString();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};

export const { auth } = NextAuth(config);
