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

  async function submit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.message || "Error");
      } else {
        toast.success(
          json.message || (mode === "login" ? "Logged in" : "Signed up"),
        );
        onSuccess?.();
        onClose?.();
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
