"use client";
import { useEffect, useState } from "react";

export default function NewsletterPage() {
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [textContent, setTextContent] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const [results, setResults] = useState(null);
  const [emailConfigured, setEmailConfigured] = useState(null);

  useEffect(() => {
    // Check if email is configured
    fetch("/api/admin/test-email")
      .then((res) => res.json())
      .then((data) => {
        setEmailConfigured(data.status === "success");
      })
      .catch(() => {
        setEmailConfigured(false);
      });
  }, []);

  const handleSend = async () => {
    if (!subject || !htmlContent || !textContent) {
      setStatus("error");
      setMessage("Please fill in all fields");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to send this newsletter to all active subscribers? This action cannot be undone.",
      )
    ) {
      return;
    }

    setStatus("loading");
    setMessage("");
    setResults(null);

    try {
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          htmlContent,
          textContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
        setResults(data);

        // Clear form on success
        setSubject("");
        setHtmlContent("");
        setTextContent("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to send newsletter");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to send newsletter. Please check your connection.");
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
            <h1 style="color: #1f2937; margin-bottom: 20px;">${subject}</h1>
            ${htmlContent}
          </div>
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Send Newsletter
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create and send newsletters to all active subscribers
        </p>
      </div>

      {/* Email Configuration Warning */}
      {emailConfigured === false && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                Email Service Not Configured
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                You need to configure SMTP settings before you can send
                newsletters.
              </p>
              <a
                href="/admin/email-test"
                className="inline-block text-sm font-medium text-yellow-800 dark:text-yellow-300 underline hover:text-yellow-900 dark:hover:text-yellow-200"
              >
                Configure Email Settings →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., EduTechPlus Weekly: Top AI News & Tutorials"
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            disabled={status === "loading"}
          />
        </div>

        {/* HTML Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            HTML Content
          </label>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Enter HTML content for the email..."
            rows={12}
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono text-sm"
            disabled={status === "loading"}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You can include inline styles. Avoid external CSS or large images.
          </p>
        </div>

        {/* Text Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plain Text Content (Fallback)
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter plain text version for email clients that don't support HTML..."
            rows={8}
            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            disabled={status === "loading"}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            disabled={status === "loading" || !subject || !htmlContent}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Preview
          </button>
          <button
            onClick={handleSend}
            disabled={status === "loading" || emailConfigured === false}
            className="px-6 py-2 bg-cyan-400 text-black rounded-lg font-medium hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {status === "loading" ? "Sending..." : "Send Newsletter"}
          </button>
          {emailConfigured === false && (
            <span className="text-sm text-yellow-600 dark:text-yellow-400 self-center">
              Configure email to enable sending
            </span>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              status === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}
          >
            <p className="font-medium">{message}</p>
            {results && (
              <div className="mt-2 text-sm">
                <p>
                  Total: {results.total} | Sent: {results.sent} | Failed:{" "}
                  {results.failed}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Template Examples */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Quick HTML Template Example
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-900 p-4 rounded overflow-x-auto text-gray-800 dark:text-gray-200">
            {`<h2 style="color: #1f2937; margin-bottom: 15px;">This Week in Tech</h2>

<p style="color: #4b5563; line-height: 1.6; margin-bottom: 15px;">
  Here are the top stories from this week...
</p>

<div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #06b6d4; margin: 0 0 10px 0;">Featured Article</h3>
  <p style="color: #4b5563; margin: 0;">Article description...</p>
  <a href="YOUR_ARTICLE_URL" style="color: #06b6d4; text-decoration: none;">Read More →</a>
</div>

<p style="color: #4b5563; line-height: 1.6;">
  Happy learning!<br>
  <strong>The EduTechPlus Team</strong>
</p>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
