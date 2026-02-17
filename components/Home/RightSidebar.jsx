"use client";

import { BarChart3, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthorLink from "../common/AuthorLink";

export default function RightSidebar() {
  const [trendingTags, setTrendingTags] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const normalizeSlug = (slug) =>
    (slug || "").replace(/^\/?(articles|article)\//, "");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [tagsRes, articlesRes, statsRes] = await Promise.all([
        fetch("/api/tags/trending"),
        fetch("/api/articles/most-viewed?limit=5&days=7"),
        fetch("/api/stats/platform"),
      ]);

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTrendingTags(tagsData.tags || []);
      }

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setTopArticles(articlesData.articles || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error("Failed to fetch sidebar data:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  return (
    <aside className="hidden lg:block w-80 sticky top-20 h-fit">
      <div className="space-y-4">
        {/* Platform Stats */}
        {stats && (
          <div className="bg-linear-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-cyan-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-cyan-500" />
              Platform Stats
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white dark:bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Articles
                </p>
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  {formatNumber(stats.total_articles)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Views
                </p>
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  {formatNumber(stats.total_views)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  {formatNumber(stats.total_users)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Views Today
                </p>
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  {formatNumber(stats.views_today)}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Trending Tags */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-500" />
              Trending Tags
            </h3>
            <Link
              href="/tags"
              className="text-xs text-cyan-500 hover:text-cyan-600 font-medium"
            >
              Browse all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trendingTags.slice(0, 10).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-medium rounded-full hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors flex items-center gap-1"
                >
                  #{tag.name}
                  {tag.article_count && (
                    <span className="text-xs opacity-70">
                      ({formatNumber(tag.article_count)})
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top Articles This Week */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            Top This Week
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                </div>
              ))}
            </div>
          ) : topArticles.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No articles yet
            </p>
          ) : (
            <div className="space-y-3">
              {topArticles.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/${article.author_username || article.author_slug || article.author_id}/${normalizeSlug(article.slug)}`}
                  className="group block pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:opacity-75 transition-opacity"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-bold text-cyan-500 shrink-0">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-cyan-500 transition-colors">
                        {article.title}
                      </h4>
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <AuthorLink
                          user={{
                            name: article.author_name || "Admin",
                            slug: article.author_slug,
                            id: article.author_id,
                          }}
                          className="text-gray-500! dark:text-gray-400!"
                        />
                        <span className="flex items-center gap-1">
                          👁️ {formatNumber(article.views)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Community Highlight */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-cyan-200 dark:border-gray-700 p-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
            💡 Did you know?
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            You can personalize your feed by following topics and authors that
            interest you.
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <Link
            href="/terms"
            className="block hover:text-cyan-500 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy-policy"
            className="block hover:text-cyan-500 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact-us"
            className="block hover:text-cyan-500 transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </aside>
  );
}
