"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PersonalizedFeed({ limit = 10 }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [limit]);

  async function fetchRecommendations() {
    try {
      const res = await fetch(`/api/articles/recommendations?limit=${limit}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  }

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
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">No articles available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/${article.categories[0]?.slug || "articles"}/${article.slug}`}
          className="group h-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:border-cyan-400 dark:hover:border-cyan-500 transition-all"
        >
          {/* Image */}
          {article.featured_image && (
            <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4 flex flex-col h-full">
            {/* Categories */}
            {article.categories && article.categories.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {article.categories.slice(0, 2).map((cat) => (
                  <span
                    key={cat.id}
                    className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-2 flex-grow">
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {article.excerpt}
              </p>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3 mt-auto">
              <div className="flex items-center gap-2">
                {article.author_name && (
                  <span>By {article.author_name}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span>👁️</span>
                <span>{article.views || 0}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
