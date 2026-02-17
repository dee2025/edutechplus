"use client";

import { AlertCircle, ArrowRight, Chrome, Lock, Mail } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function redirectToUserPage() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/");
        return;
      }
      const user = await res.json();
      const username = user?.username || user?.user_slug || user?.id;
      router.push(username ? `/${username}` : "/");
    } catch {
      router.push("/");
    }
  }

  if (session) {
    redirectToUserPage();
    return null;
  }

  async function handleCredentialsLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        await redirectToUserPage();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    try {
      // NextAuth will handle the redirect to Google OAuth
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      setError("Google sign in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0d14] via-[#0b0f19] to-[#0f131b] p-4">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -right-1/2 w-full h-full bg-gradient-to-bl from-cyan-950/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 left-1/4 w-full h-full bg-gradient-to-tr from-blue-950/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-white shadow-lg mb-4">
            E+
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">
            Sign in to your account to continue reading
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle
              className="text-red-400 flex-shrink-0 mt-0.5"
              size={20}
            />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm p-8 space-y-6">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-gray-50 text-gray-900 font-medium transition-all disabled:opacity-50 border-0"
          >
            <Chrome size={20} />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900/50 text-gray-400">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-medium transition-all disabled:opacity-50 mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Protected by reCAPTCHA and subject to the</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy-policy" className="hover:text-gray-400">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-400">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
