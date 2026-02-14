"use client";
import { useState, useEffect } from "react";

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState("");
  const [configStatus, setConfigStatus] = useState(null);
  const [testStatus, setTestStatus] = useState("idle");
  const [testMessage, setTestMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEmailConfig();
  }, []);

  const checkEmailConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/test-email");
      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      setConfigStatus({
        status: "error",
        message: "Failed to check email configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();

    if (!testEmail) {
      setTestStatus("error");
      setTestMessage("Please enter an email address");
      return;
    }

    setTestStatus("loading");
    setTestMessage("");

    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestStatus("success");
        setTestMessage(data.message);
        setTestEmail("");
      } else {
        setTestStatus("error");
        setTestMessage(data.message || "Failed to send test email");
      }
    } catch (error) {
      setTestStatus("error");
      setTestMessage("Failed to send test email. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Email Configuration Test
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Verify your email settings and send test emails
        </p>
      </div>

      {/* Configuration Status */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Configuration Status
        </h2>

        {loading ? (
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Checking configuration...</p>
          </div>
        ) : (
          <div
            className={`p-6 rounded-lg ${
              configStatus?.status === "success"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {configStatus?.status === "success" ? "✅" : "❌"}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-2 ${
                    configStatus?.status === "success"
                      ? "text-green-800 dark:text-green-300"
                      : "text-red-800 dark:text-red-300"
                  }`}
                >
                  {configStatus?.message}
                </h3>

                {configStatus?.config && (
                  <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Host:</strong> {configStatus.config.host}
                    </p>
                    <p>
                      <strong>Port:</strong> {configStatus.config.port}
                    </p>
                    <p>
                      <strong>From:</strong> {configStatus.config.from}
                    </p>
                  </div>
                )}

                {configStatus?.missing && configStatus.missing.length > 0 && (
                  <div className="mt-3 text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium mb-1">Missing environment variables:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {configStatus.missing.map((varName) => (
                        <li key={varName} className="font-mono">
                          {varName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {configStatus?.error && (
                  <div className="mt-3 text-sm text-red-700 dark:text-red-300">
                    <p className="font-medium">Error Details:</p>
                    <p className="font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded mt-1">
                      {configStatus.error}
                    </p>
                  </div>
                )}

                {configStatus?.help && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    💡 {configStatus.help}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={checkEmailConfig}
              className="mt-4 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Recheck Configuration
            </button>
          </div>
        )}
      </div>

      {/* Test Email */}
      {configStatus?.status === "success" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Send Test Email
          </h2>

          <form onSubmit={handleTestEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                disabled={testStatus === "loading"}
              />
            </div>

            <button
              type="submit"
              disabled={testStatus === "loading"}
              className="px-6 py-2 bg-cyan-400 text-black rounded-lg font-medium hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {testStatus === "loading" ? "Sending..." : "Send Test Email"}
            </button>
          </form>

          {testMessage && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                testStatus === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : testStatus === "error"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  : ""
              }`}
            >
              {testMessage}
            </div>
          )}
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Email Setup Instructions
        </h3>

        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <h4 className="font-medium mb-2">1. Add to .env.local:</h4>
            <pre className="bg-white dark:bg-gray-900 p-3 rounded overflow-x-auto text-xs">
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=EduTechPlus
SMTP_FROM_EMAIL=noreply@edutechplus.com`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Gmail Setup:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Enable 2-Factor Authentication in your Google Account</li>
              <li>Generate an App Password: Security → App Passwords</li>
              <li>Use the generated password in SMTP_PASSWORD</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Alternative Email Services:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>SendGrid: smtp.sendgrid.net (port 587)</li>
              <li>Mailgun: smtp.mailgun.org (port 587)</li>
              <li>AWS SES: email-smtp.region.amazonaws.com (port 587)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
