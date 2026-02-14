"use client";

import { BookOpen, Calendar, ChevronRight, Layers } from "lucide-react";
import { useEffect, useState } from "react";

export default function TestHistoryPage({ userId, onTestSelect = () => {} }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTests, setTotalTests] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTests();
  }, [userId, currentPage]);

  async function fetchTests() {
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const res = await fetch(
        `/api/test-results?userId=${userId}&limit=${itemsPerPage}&offset=${offset}`,
      );
      const data = await res.json();

      if (data.results) {
        setTests(data.results);
        setTotalTests(data.total);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tests:", err);
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(totalTests / itemsPerPage);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-[#10a37f] bg-[#10a37f]/10 border-[#10a37f]/30 dark:bg-[#10a37f]/20 dark:border-[#10a37f]/40";
      case "medium":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
      case "hard":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
      default:
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-[#10a37f]";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceEmoji = (score) => {
    if (score >= 90) return "🌟";
    if (score >= 80) return "✨";
    if (score >= 70) return "👍";
    if (score >= 60) return "📈";
    return "💪";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#10a37f]/30 border-t-[#10a37f] rounded-full" />
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
          No tests taken yet
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Start your first test to see results here
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#0d0d0d] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Test History
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            All your test attempts and performance tracking
          </p>
        </div>

        {/* Tests List */}
        <div className="space-y-3 sm:space-y-4 mb-8">
          {tests.map((test, idx) => (
            <div
              key={test.id}
              className="group p-4 sm:p-5 lg:p-6 bg-gray-50 dark:bg-gray-900/40 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700 transition-all hover:shadow-sm dark:hover:shadow-lg dark:hover:shadow-black/20 cursor-pointer active:scale-98"
              onClick={() => onTestSelect(test)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-xl sm:text-2xl flex-shrink-0">
                      {getPerformanceEmoji(test.score)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                        {test.exam_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                        {test.topic || "General Knowledge"}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3 sm:mb-0">
                    <span
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(test.difficulty)}`}
                    >
                      {test.difficulty}
                    </span>
                    <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium text-[#10a37f] bg-[#10a37f]/10 dark:bg-[#10a37f]/20 border border-[#10a37f]/30 dark:border-[#10a37f]/40 flex items-center gap-1 flex-shrink-0">
                      <Layers className="w-3 h-3" />
                      {test.question_count}
                    </span>
                    <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(test.completed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Right Section - Score */}
                <div className="flex items-start justify-between sm:flex-col sm:items-end gap-3 sm:gap-2 pt-2 sm:pt-0 border-t border-gray-300 dark:border-gray-700 sm:border-t-0 sm:border-l sm:pl-4">
                  <div>
                    <p
                      className={`text-2xl sm:text-3xl font-bold ${getScoreColor(test.score)}`}
                    >
                      {test.score.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {test.correct_answers}/{test.question_count} correct
                    </p>
                  </div>

                  <div className="text-right sm:text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(test.completed_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition transform group-hover:translate-x-1 hidden sm:block mt-2" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 sm:mt-4 space-y-2">
                <div className="flex-1 bg-gray-300 dark:bg-gray-700 rounded-full h-2 border border-gray-400 dark:border-gray-600 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      test.score >= 80
                        ? "bg-[#10a37f]"
                        : test.score >= 60
                          ? "bg-amber-600 dark:bg-amber-500"
                          : "bg-red-600 dark:bg-red-500"
                    }`}
                    style={{ width: `${test.score}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex gap-2">
                    <span>✓ {test.correct_answers}</span>
                    <span>✕ {test.wrong_answers}</span>
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {test.question_count -
                      test.correct_answers -
                      test.wrong_answers}{" "}
                    skipped
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 my-8 py-6 border-t border-gray-300 dark:border-gray-800">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              ← Previous
            </button>

            <div className="flex gap-1 sm:gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const startPage = Math.max(1, currentPage - 2);
                return startPage + i <= totalPages ? startPage + i : null;
              }).map((page) =>
                page ? (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg transition text-sm font-medium ${
                      currentPage === page
                        ? "bg-[#10a37f] text-white shadow-md"
                        : "border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ) : null,
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              Next →
            </button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 p-5 sm:p-6 lg:p-8 bg-[#10a37f]/5 dark:bg-[#10a37f]/10 rounded-lg sm:rounded-xl border border-[#10a37f]/30 dark:border-[#10a37f]/40 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-2">
              Total Tests
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {totalTests}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-2">
              Average Score
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[#10a37f]">
              {(
                tests.reduce((sum, t) => sum + t.score, 0) / tests.length
              ).toFixed(1)}
              %
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-2">
              Best Score
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[#10a37f]">
              {Math.max(...tests.map((t) => t.score)).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
