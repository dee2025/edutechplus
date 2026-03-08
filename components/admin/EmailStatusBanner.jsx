"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EmailStatusBanner() {
  const [isConfigured, setIsConfigured] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if email is configured
    fetch("/api/admin/test-email")
      .then((res) => res.json())
      .then((data) => {
        setIsConfigured(data.status === "success");
      })
      .catch(() => {
        setIsConfigured(false);
      });

    // Check if user dismissed the banner
    const isDismissed = localStorage.getItem("emailBannerDismissed");
    setDismissed(isDismissed === "true");
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("emailBannerDismissed", "true");
  };

  if (isConfigured === null || isConfigured || dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Email Service Not Configured
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                Subscribers won&apos;t receive welcome emails. Configure SMTP in
                .env.local or{" "}
                <Link
                  href="/admin/email-test"
                  className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-200"
                >
                  test your setup here
                </Link>
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
