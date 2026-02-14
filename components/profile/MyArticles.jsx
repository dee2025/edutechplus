"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function MyArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const res = await fetch("/api/articles/my");
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      toast.error("Failed to load your articles");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="py-6">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You haven't published any articles yet
        </p>
        <Link
          href="/publish"
          className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
        >
          Publish Your First Article
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Your Articles ({articles.length})
        </h3>
        <Link
          href="/publish"
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-semibold transition-colors"
        >
          New Article
        </Link>
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="block p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-cyan-600 dark:hover:text-cyan-400">
                  {article.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {article.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {article.categories?.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {article.views || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">views</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
              Published {new Date(article.published_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
