import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default async function AITutorIntro() {
  return (
    <section className="bg-gradient-to-r from-[#0B0F1A] to-[#111827] py-14 border-y border-gray-800/60">
      <div className="w-full md:max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Image/Illustration */}
        <div className="relative order-2 md:order-1">
          <div className="relative z-10 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-2 backdrop-blur-sm border border-gray-800/60">
            <div className="bg-gray-900/90 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/80 border-b border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-gray-400 font-mono">AI Tutor • Ready to help</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-800/70 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-gray-300">
                      Hello! I'm your AI learning assistant. What would you like to learn today?
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-blue-500/10 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] border border-blue-500/20">
                    <p className="text-sm text-gray-300">
                      Explain React hooks with examples
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-300">You</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span>Typing response...</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -z-10 -top-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
          <div className="absolute -z-10 -bottom-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="order-1 md:order-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI TUTOR
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-100 leading-tight">
            Learn Anything with{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Powered Guidance
            </span>
          </h2>

          <p className="mt-4 text-lg text-gray-400">
            Get instant answers, step-by-step explanations, and personalized quizzes. 
            Available 24/7 in English and Hindi.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/ai-tutor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Try AI Tutor Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              href="/features"
              className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg border border-gray-700 transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "24/7 Availability",
              "Code Examples",
              "MCQ Quizzes",
              "Hindi Support",
              "Step-by-Step"
            ].map((feature) => (
              <span
                key={feature}
                className="text-xs px-3 py-1.5 bg-gray-800/50 text-gray-400 rounded-full border border-gray-700"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}