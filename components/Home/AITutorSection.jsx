import Link from "next/link";

export default async function AITutorIntro() {
  return (
    <section className="bg-white dark:bg-[#0d0d0d] min-h-screen flex items-center py-8 md:py-0 overflow-hidden">
      <div className="w-full md:max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Chat Preview */}
        <div className="relative order-2 md:order-1 h-auto md:h-full flex items-center">
          <div className="w-full rounded-xl overflow-hidden shadow-2xl bg-[#ececf1] dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700">
            {/* Header */}
            <div className="px-4 py-3 bg-white dark:bg-[#212121] border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                AI Tutor
              </span>
              <svg
                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z" />
              </svg>
            </div>

            {/* Chat Area */}
            <div className="p-4 space-y-4 min-h-64 bg-white dark:bg-[#1a1a1a]">
              {/* AI Message */}
              <div className="flex justify-start">
                <div className="max-w-xs bg-gray-200 dark:bg-[#374151] rounded-xl rounded-tl-none px-4 py-2">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    Hi! What would you like to learn today?
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-xs bg-[#10a37f] text-white rounded-xl rounded-tr-none px-4 py-2">
                  <p className="text-sm">React hooks</p>
                </div>
              </div>

              {/* AI Message */}
              <div className="flex justify-start">
                <div className="max-w-xs bg-gray-200 dark:bg-[#374151] rounded-xl rounded-tl-none px-4 py-2">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    Great! Let me explain React hooks with examples...
                  </p>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-[#374151] rounded-xl rounded-tl-none px-4 py-2 flex gap-1">
                  <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="order-1 md:order-2 md:h-full flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#10a37f] bg-[#10a37f]/10 px-3 py-1 rounded-lg w-fit mb-4">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
            AI-POWERED
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-snug">
            Learn Smarter with AI
          </h2>

          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Get instant answers, step-by-step explanations, personalized
            quizzes, and more. Available 24/7.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#10a37f] hover:bg-[#0d9467] text-white font-medium text-sm rounded-lg transition-all shadow-md"
            >
              Start Learning
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            <Link
              href="/features"
              className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-sm rounded-lg transition-colors border border-gray-300 dark:border-gray-700"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700 grid grid-cols-3 gap-4">
            {[
              { label: "24/7 Available", value: "Always" },
              { label: "Multiple Topics", value: "99+" },
              { label: "Languages", value: "10+" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
