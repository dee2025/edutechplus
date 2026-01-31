"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({ name: "", email: "", password: "" });
  }, [mode]);

  async function submit(e) {
    e.preventDefault();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-[#0b0f19] rounded p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {mode === "login" ? "Login" : "Sign up"}
          </h3>
          <button onClick={onClose} className="text-gray-400">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="text-xs text-gray-400">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-[#111827] border border-gray-700 rounded"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[#111827] border border-gray-700 rounded"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[#111827] border border-gray-700 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              disabled={loading}
              className="px-4 py-2 bg-cyan-400 text-black rounded font-semibold"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Login"
                  : "Sign up"}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-xs text-gray-400"
            >
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
