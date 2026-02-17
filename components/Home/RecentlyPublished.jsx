"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthorLink from "../Common/AuthorLink";

export default function RecentlyPublished() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeSlug = (slug) =>
    (slug || "").replace(/^\/?(articles|article)\//, "");
  const getArticleUrl = (article) =>
    `/${article.author_username || article.author_slug || article.author_id}/${normalizeSlug(article.slug)}`;

  useEffect(() => {
    fetchRecent();
  }, []);

  async function fetchRecent() {
    try {
      const res = await fetch("/api/articles/latest?limit=6");
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to fetch recent articles:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={20} className="text-cyan-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Recently Published
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={getArticleUrl(article)}
            className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-500 bg-gray-50 dark:bg-gray-800 transition-all hover:shadow-md"
          >
            {/* Image */}
            {article.featured_image && (
              <div className="relative h-32 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-3">
              {article.categories && article.categories.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {article.categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat.id}
                      className="text-xs px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {article.title}
              </h3>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <AuthorLink
                  user={{
                    name: article.author_name || "Admin",
                    username: article.author_username,
                    slug: article.author_slug,
                    id: article.author_id,
                  }}
                  className="text-gray-500! dark:text-gray-400! truncate"
                />
                <span className="shrink-0">
                  {formatDate(article.published_at || article.created_at)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
