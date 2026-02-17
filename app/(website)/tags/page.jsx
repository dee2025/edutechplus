"use client";

import { Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllTags();
  }, []);

  async function fetchAllTags() {
    try {
      setLoading(true);
      const res = await fetch("/api/tags/all");
      const data = await res.json();
      setTags(data.tags || []);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const topTags = [...tags]
    .sort((a, b) => (b.article_count || 0) - (a.article_count || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Hero */}
      <div className="bg-linear-to-r from-cyan-500 to-blue-500 dark:from-gray-900 dark:to-gray-800 py-12 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium">
            <TrendingUp size={18} className="text-cyan-500" />
            <span className="text-gray-900 dark:text-gray-100">
              Popular Tags
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Explore Topics</h1>
          <p className="text-cyan-100 text-lg">
            Discover articles by tag and follow your interests
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Top Tags */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Top Tags
              </h2>
              <div className="space-y-2">
                {topTags.map((tag, index) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-500">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-cyan-500 transition-colors truncate">
                          {tag.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {tag.article_count || 0} articles
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right - All Tags */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Tags Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery
                    ? "No tags found matching your search"
                    : "No tags available yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="group relative p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-cyan-400 dark:hover:border-cyan-500 transition-all"
                  >
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-cyan-500 transition-colors">
                        #{tag.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tag.article_count || 0}{" "}
                        {tag.article_count === 1 ? "article" : "articles"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Results Counter */}
            {!loading && filteredTags.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center">
                Showing {filteredTags.length} of {tags.length} tags
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
