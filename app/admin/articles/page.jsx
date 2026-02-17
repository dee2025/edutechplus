"use client";

import { useEffect, useState } from "react";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);

  const fetchArticles = async () => {
    const res = await fetch("/api/admin/articles");
    const data = await res.json();
    setArticles(data);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Articles</h1>
          <p className="text-gray-400 mt-1 text-sm">
            View all articles created by users
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#111827] border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0b0f19] border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Image
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Title
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Slug
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Tags
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Author
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-[#1a1f2e] transition">
                  {/* IMAGE */}
                  <td className="px-6 py-4">
                    {a.featured_image ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0b0f19]">
                        <img
                          src={a.featured_image}
                          alt={a.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-[#0b0f19] flex items-center justify-center border border-gray-700">
                        <svg
                          className="w-8 h-8 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </td>

                  {/* TITLE */}
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate">
                      <p className="font-medium text-white">{a.title}</p>
                    </div>
                  </td>

                  {/* SLUG */}
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    <span className="bg-[#0b0f19] px-2 py-1 rounded">
                      {a.slug}
                    </span>
                  </td>

                  {/* TAGS */}
                  <td className="px-6 py-4">
                    {a.tags && a.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {a.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-block px-2.5 py-1 text-xs font-medium rounded"
                            style={{
                              backgroundColor: `${tag.color || "#06B6D4"}20`,
                              color: tag.color || "#06B6D4",
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {a.tags.length > 3 && (
                          <span className="inline-block px-2.5 py-1 text-xs font-medium bg-gray-700 text-gray-400 rounded">
                            +{a.tags.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                        a.status === "published"
                          ? "bg-green-900/40 text-green-400"
                          : a.status === "draft"
                            ? "bg-yellow-900/40 text-yellow-400"
                            : "bg-gray-900/40 text-gray-400"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>

                  {/* AUTHOR */}
                  <td className="px-6 py-4 text-gray-300">
                    {a.author_name || "-"}
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(a.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}

              {!articles.length && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <p>No articles found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
