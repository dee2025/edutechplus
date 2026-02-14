"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification:
      "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0d14] via-[#0b0f19] to-[#0f131b] p-4">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -right-1/2 w-full h-full bg-gradient-to-bl from-cyan-950/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 left-1/4 w-full h-full bg-gradient-to-tr from-blue-950/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Error Card */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="text-red-400" size={32} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Authentication Error
          </h1>

          {/* Error Message */}
          <p className="text-gray-300 text-center mb-6">{errorMessage}</p>

          {/* Error Code */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <p className="text-xs text-gray-400 text-center font-mono">
                Error Code: {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-medium transition-all"
            >
              Try Again
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium transition-all"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-400">
          If this problem persists, please{" "}
          <Link
            href="/contact-us"
            className="text-cyan-400 hover:text-cyan-300"
          >
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
