"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState("");
  const [subscribeErr, setSubscribeErr] = useState("");

  async function handleSubscribe(e) {
    e.preventDefault();

    if (!email.trim()) {
      setSubscribeErr("Please enter your email address");
      setSubscribeMsg("");
      return;
    }

    try {
      setSubmitting(true);
      setSubscribeErr("");
      setSubscribeMsg("");

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubscribeErr(data.error || "Failed to subscribe");
        return;
      }

      setSubscribeMsg(data.message || "Subscribed successfully");
      setEmail("");
    } catch (error) {
      console.error("Subscription error:", error);
      setSubscribeErr("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="bg-gray-50 dark:bg-[#0b0f19] border-t border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-14">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-200">
                EduTech
              </span>
              <span className="text-2xl font-bold text-cyan-500 dark:text-cyan-400">
                +
              </span>
            </Link>

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              EduTechPlus is a global tech and education news platform covering
              AI, programming, startups, gadgets, and the technologies shaping
              how the world learns and builds.
            </p>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Subscribe to Newsletter
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Get the latest articles, updates, and learning resources in your
              inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-3 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white font-medium transition-colors"
              >
                {submitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {subscribeMsg && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                {subscribeMsg}
              </p>
            )}
            {subscribeErr && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                {subscribeErr}
              </p>
            )}
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/about-us"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/unsubscribe"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400"
                >
                  Unsubscribe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 my-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-500">
          <span>
            © {new Date().getFullYear()} EduTechPlus. All rights reserved.
          </span>

          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              Twitter
            </a>
            <a
              href="#"
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="hover:text-cyan-600 dark:hover:text-cyan-400"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
