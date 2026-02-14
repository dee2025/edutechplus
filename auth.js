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
            query: "SELECT id FROM users WHERE email = ?",
            values: [user.email],
          });

          if (existingUsers.length === 0) {
            // Create new user from Google profile
            await query({
              query:
                "INSERT INTO users (name, email, avatar_url, is_active) VALUES (?, ?, ?, 1)",
              values: [
                user.name || profile?.name || "User",
                user.email,
                user.image || null,
              ],
            });
          } else {
            // Update existing user with Google info if needed
            await query({
              query:
                "UPDATE users SET name = ?, avatar_url = ? WHERE email = ?",
              values: [
                user.name || existingUsers[0].name,
                user.image || null,
                user.email,
              ],
            });
          }

          return true;
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }

      // Handle credentials sign in
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
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
