"use client";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
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
      setMessage("Failed to subscribe. Please check your connection.");
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-[#111827] py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Stay Ahead of the Tech Curve
        </h3>
        <p className="mt-3 text-gray-700 dark:text-gray-400">
          Weekly insights on AI, tech, and education — no spam.
        </p>

        <form
          onSubmit={handleSubscribe}
          className="mt-6 flex justify-center gap-3 flex-wrap"
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="px-4 py-2 rounded-md bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2 rounded-md bg-cyan-400 text-black font-semibold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md max-w-md mx-auto ${
              status === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          Already subscribed?{" "}
          <a href="/unsubscribe" className="text-cyan-400 hover:underline">
            Unsubscribe here
          </a>
        </p>
      </div>
    </section>
  );
}
