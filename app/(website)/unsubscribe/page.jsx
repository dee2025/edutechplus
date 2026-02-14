"use client";
import { useState } from "react";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to unsubscribe. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Unsubscribe from Newsletter
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            We're sorry to see you go. Enter your email address to unsubscribe
            from our newsletter.
          </p>
        </div>

        <form onSubmit={handleUnsubscribe} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-lg bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-6 py-3 rounded-lg bg-cyan-400 text-black font-semibold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              status === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {status === "success" && (
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
