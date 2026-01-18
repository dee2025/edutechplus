"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
      <form
        onSubmit={handleLogin}
        className="bg-[#111827] p-8 rounded-xl w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Admin Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded bg-[#0b0f19] border border-gray-700 text-gray-200"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded bg-[#0b0f19] border border-gray-700 text-gray-200"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full py-2 rounded bg-cyan-400 text-black font-semibold">
          Login
        </button>
      </form>
    </div>
  );
}
