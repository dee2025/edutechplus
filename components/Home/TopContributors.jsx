"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopContributors({ initialStats = null }) {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(!initialStats);

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
      setLoading(false);
      return;
    }

    fetchContributors();
  }, [initialStats]);

  async function fetchContributors() {
    try {
      const res = await fetch("/api/stats/platform", { cache: "no-store" });
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch contributors:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats?.top_authors || stats.top_authors.length === 0) {
    return null;
  }

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  return (
    <section className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-cyan-200 dark:border-gray-700 p-6 mb-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <Trophy size={24} className="text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Top Contributors
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">This week</p>
        </div>
      </div>

      <div className="space-y-3">
        {stats.top_authors.map((author, index) => (
          <Link
            key={author.id}
            href={`/${author.username || author.user_slug || author.id}`}
            className="group flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-cyan-300 dark:hover:border-cyan-600 shadow-sm hover:shadow-md"
          >
            {/* Medal Badge */}
            <div className="text-3xl flex-shrink-0 w-12 text-center">
              {medals[index] || `${index + 1}️⃣`}
            </div>

            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md overflow-hidden border-2 border-white dark:border-gray-700">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                author.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate text-lg">
                {author.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-cyan-500 rounded-full"></span>
                {author.article_count} article
                {author.article_count !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Badge */}
            <div className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-bold whitespace-nowrap shadow-sm">
              +{author.article_count}
            </div>

            {/* Arrow */}
            <div className="text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              →
            </div>
          </Link>
        ))}
      </div>

      {/* See More Link */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/contributors"
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
        >
          View all contributors
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
