"use client";

import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({ name: "", email: "", password: "" });
    setShowPassword(false);
    setErrors({});
  }, [mode]);

  function validateForm() {
    const newErrors = {};

    if (!form.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.password?.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "signup") {
      if (!form.name?.trim()) {
        newErrors.name = "Full name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleGoogleAuth() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      toast.error("Google sign-in failed");
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === "login") {
        // Use NextAuth credentials provider for login
        const result = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error || "Login failed");
        } else if (result?.ok) {
          toast.success("Logged in successfully");
          onSuccess?.();
          onClose?.();
        }
      } else {
        // Signup still uses custom API endpoint
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const json = await res.json();
        if (!res.ok) {
          toast.error(json.message || "Signup failed");
        } else {
          // After successful signup, auto-login with NextAuth
          const loginResult = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
          });

          if (loginResult?.ok) {
            toast.success("Account created successfully!");
            onSuccess?.();
            onClose?.();
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {mode === "login" ? "Welcome Back" : "Get Started"}
                </h1>
                <p className="text-slate-300 text-xs mt-1">
                  {mode === "login"
                    ? "Access your test series"
                    : "Create account to start"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white flex-shrink-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-700/50 rounded-lg p-0.5 border border-slate-600/50 mt-4">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-3 rounded-md font-medium text-xs transition-all duration-200 ${
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 px-3 rounded-md font-medium text-xs transition-all duration-200 ${
                  mode === "signup"
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={submit} className="px-6 py-6 space-y-4">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-slate-900 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg border-2 border-slate-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-500">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Name Field - Signup Only */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <label className="text-xs font-semibold text-slate-800">
                    Full Name
                  </label>
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="John Doe"
                  className={`w-full px-3 py-2 bg-slate-50 border-2 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:bg-red-50/50"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <label className="text-xs font-semibold text-slate-800">
                  Email
                </label>
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="name@example.com"
                className={`w-full px-3 py-2 bg-slate-50 border-2 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:bg-red-50/50"
                    : "border-slate-200 focus:border-slate-900"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <label className="text-xs font-semibold text-slate-800">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder={
                    mode === "login" ? "Enter password" : "Min. 6 chars"
                  }
                  className={`w-full px-3 py-2 bg-slate-50 border-2 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors pr-10 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:bg-red-50/50"
                      : "border-slate-200 focus:border-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password}
                </p>
              )}
              {mode === "signup" && !errors.password && form.password && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <p className="text-xs text-green-600 font-medium">
                    Strong password
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-5 py-2.5 px-4 bg-linear-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-md"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Login" : "Create Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Toggle Mode */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                {mode === "login" ? "New here? " : "Have account? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-slate-900 hover:text-slate-700 font-bold transition-colors underline"
                >
                  {mode === "login" ? "Sign up" : "Login"}
                </button>
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">🔒 Secure & encrypted</p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-xs text-slate-400 text-center mt-3">
          By continuing, you agree to Terms of Service
        </p>
      </div>
    </div>
  );
}
