"use client";

import { Award, BarChart3, Clock, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function TestSeriesProfile({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  async function fetchStats() {
    try {
      const res = await fetch(`/api/test-results?userId=${userId}&limit=1000`);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const tests = data.results;

        let totalTests = tests.length;
        let totalQuestions = 0;
        let totalCorrect = 0;
        let totalWrong = 0;
        let avgScore = 0;
        let maxScore = 0;
        let minScore = 100;
        let examsMap = {};

        tests.forEach((test) => {
          totalQuestions += test.question_count;
          totalCorrect += test.correct_answers;
          totalWrong += test.wrong_answers;
          avgScore += test.score;
          maxScore = Math.max(maxScore, test.score);
          minScore = Math.min(minScore, test.score);

          if (!examsMap[test.exam_name]) {
            examsMap[test.exam_name] = 0;
          }
          examsMap[test.exam_name]++;
        });

        avgScore = (avgScore / totalTests).toFixed(1);

        setStats({
          totalTests,
          totalQuestions,
          totalCorrect,
          totalWrong,
          avgScore,
          maxScore,
          minScore,
          accuracy: ((totalCorrect / totalQuestions) * 100).toFixed(1),
          exams: Object.entries(examsMap),
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">
          No test data available yet. Take your first test!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Your Performance</h2>
        <p className="text-gray-400">
          Overall statistics and progress tracking
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Total Tests */}
        <div className="p-6 bg-linear-to-br from-blue-600/20 to-blue-500/10 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-xs font-medium mb-1">
                Total Tests
              </p>
              <p className="text-4xl font-bold text-blue-300">
                {stats.totalTests}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-6 bg-linear-to-br from-green-600/20 to-green-500/10 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-xs font-medium mb-1">
                Overall Accuracy
              </p>
              <p className="text-4xl font-bold text-green-300">
                {stats.accuracy}%
              </p>
            </div>
            <Target className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </div>

        {/* Avg Score */}
        <div className="p-6 bg-linear-to-br from-purple-600/20 to-purple-500/10 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-xs font-medium mb-1">
                Average Score
              </p>
              <p className="text-4xl font-bold text-purple-300">
                {stats.avgScore}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </div>

        {/* Best Score */}
        <div className="p-6 bg-linear-to-br from-yellow-600/20 to-yellow-500/10 rounded-xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-xs font-medium mb-1">
                Best Score
              </p>
              <p className="text-4xl font-bold text-yellow-300">
                {stats.maxScore.toFixed(1)}%
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </div>

        {/* Questions */}
        <div className="p-6 bg-linear-to-br from-orange-600/20 to-orange-500/10 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-xs font-medium mb-1">
                Questions Attempted
              </p>
              <p className="text-4xl font-bold text-orange-300">
                {stats.totalQuestions}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <div className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/30">
          <h3 className="text-lg font-semibold text-white mb-6">Score Range</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 text-sm">Highest Score</span>
                <span className="text-green-400 font-bold">
                  {stats.maxScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-2 border border-gray-700/50">
                <div
                  className="bg-linear-to-r from-green-500 to-green-400 h-2 rounded-full"
                  style={{ width: `${stats.maxScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 text-sm">Average Score</span>
                <span className="text-blue-400 font-bold">
                  {stats.avgScore}%
                </span>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-2 border border-gray-700/50">
                <div
                  className="bg-linear-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                  style={{ width: `${stats.avgScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 text-sm">Lowest Score</span>
                <span className="text-red-400 font-bold">
                  {stats.minScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-2 border border-gray-700/50">
                <div
                  className="bg-linear-to-r from-red-500 to-red-400 h-2 rounded-full"
                  style={{ width: `${stats.minScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Stats */}
        <div className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/30">
          <h3 className="text-lg font-semibold text-white mb-6">
            Question Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <span className="text-green-400 font-bold text-lg">✓</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Correct Answers</p>
                  <p className="text-white font-semibold">
                    {stats.totalCorrect}
                  </p>
                </div>
              </div>
              <span className="text-green-400 text-lg font-bold">
                {stats.totalCorrect}/{stats.totalQuestions}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <span className="text-red-400 font-bold text-lg">✕</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Incorrect Answers</p>
                  <p className="text-white font-semibold">{stats.totalWrong}</p>
                </div>
              </div>
              <span className="text-red-400 text-lg font-bold">
                {stats.totalWrong}/{stats.totalQuestions}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exams Breakdown */}
      <div className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          Exams Breakdown
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.exams.map(([exam, count]) => (
            <div
              key={exam}
              className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition"
            >
              <p className="text-gray-300 text-sm font-medium mb-2">{exam}</p>
              <p className="text-2xl font-bold text-blue-400">{count}</p>
              <p className="text-xs text-gray-500 mt-1">tests taken</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
