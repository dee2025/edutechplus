"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LatestArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = 10;

  const fetchArticles = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      page,
      limit,
    });

    if (category) {
      params.append("category", category);
    }

    const res = await fetch(`/api/public/latest-articles?${params}`);
    const data = await res.json();

    setArticles(data.articles);
    setTotalPages(data.pagination.totalPages);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/public/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [page, category]);

  return (
    <div className="min-h-screen bg-[#020617] py-10">
      <div className="max-w-7xl px-4 mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Latest Articles</h1>
          <p className="text-gray-400 mt-2">
            Explore our most recent articles across all categories.
          </p>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
            className={`px-4 py-1 rounded text-sm ${
              !category
                ? "bg-cyan-400 text-black"
                : "bg-[#111827] text-gray-300"
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.slug);
                setPage(1);
              }}
              className={`px-4 py-1 rounded text-sm ${
                category === cat.slug
                  ? "bg-cyan-400 text-black"
                  : "bg-[#111827] text-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ARTICLES */}
        <div className="space-y-6">
          {loading && <p className="text-gray-400">Loading articles...</p>}

          {!loading &&
            articles.map((a) => (
              <Link
                key={a.id}
                href={`/article/${a.slug}`}
                className="block bg-[#111827] rounded-xl p-5 hover:bg-[#0b0f19]"
              >
                <div className="flex gap-4">
                  {a.featured_image && (
                    <Image
                      src={a.featured_image}
                      alt={a.title}
                      width={100}
                      height={10}
                      className="rounded-lg w-[200px] h-auto object-cover"
                    />
                  )}

                  <div>
                    <h2 className="text-xl font-semibold text-gray-100">
                      {a.title}
                    </h2>

                    <p className="text-gray-400 mt-2 line-clamp-2 text-sm">
                      {a.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                      <span>{a.author_name}</span>
                      <span>{a.category_name}</span>
                      <span>
                        {new Date(a.published_at).toLocaleDateString()}
                      </span>
                      {a.read_time && <span>{a.read_time} min read</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          {!loading && !articles.length && (
            <p className="text-gray-500">No articles found.</p>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-[#111827] rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="px-4 py-2 text-gray-400">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-[#111827] rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
