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
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const limit = 10;

  const fetchArticles = async (
    pageParam = 1,
    append = false,
    q = debouncedSearch,
  ) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({ page: pageParam, limit });
      if (category) params.append("category", category);
      if (q) params.append("q", q);

      const res = await fetch(`/api/public/latest-articles?${params}`);
      const data = await res.json();

      if (append) setArticles((prev) => [...prev, ...(data.articles || [])]);
      else setArticles(data.articles || []);

      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      console.error("Failed to fetch articles", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/public/categories");
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      console.error("Failed to fetch categories", e);
    }
  };

  // Debounce search input to avoid excessive requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // initial load
  useEffect(() => {
    fetchCategories();
    fetchArticles(1, false, debouncedSearch);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when category or search changes, reset to first page and fetch
  useEffect(() => {
    setPage(1);
    fetchArticles(1, false, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, debouncedSearch]);

  // fetch when page changes
  useEffect(() => {
    fetchArticles(page, false, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleLoadMore = async () => {
    if (page >= totalPages) return;
    const next = page + 1;
    await fetchArticles(next, true, debouncedSearch);
    setPage(next);
  };

  const handlePrev = () => {
    if (page <= 1) return;
    setPage((p) => p - 1);
  };
  const handleNext = () => {
    if (page >= totalPages) return;
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen bg-[#020617] py-10">
      <div className="max-w-7xl px-4 mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
              Latest Articles
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              Explore our most recent articles and insights across categories.
              Use search or filters to narrow down.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full md:w-64 px-4 py-2 rounded-full bg-[#111827] text-gray-200 placeholder-gray-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Search articles"
            />
            <button
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
              className="hidden md:inline-block px-3 py-2 bg-[#111827] rounded text-gray-300 hover:opacity-90"
              aria-label="Clear search"
            >
              Clear
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex items-center gap-3 overflow-x-auto py-2">
          <button
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm ${!category ? "bg-cyan-400 text-black" : "bg-[#111827] text-gray-300"}`}
            aria-pressed={!category}
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
              className={`px-4 py-2 rounded-full text-sm ${category === cat.slug ? "bg-cyan-400 text-black" : "bg-[#111827] text-gray-300"}`}
              aria-pressed={category === cat.slug}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-[#111827] rounded-xl p-4 h-44"
              />
            ))}

          {!loading &&
            articles.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="group block bg-[#111827] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col h-full">
                  {a.featured_image && (
                    <div className="w-full h-44 relative">
                      <Image
                        src={a.featured_image}
                        alt={a.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-100 line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-gray-400 mt-2 text-sm line-clamp-3">
                      {a.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-[#0b0f19] rounded text-gray-300">
                          {a.category_name}
                        </span>
                        <span>{a.author_name}</span>
                      </div>
                      <div className="text-right">
                        <div>
                          {new Date(a.published_at).toLocaleDateString()}
                        </div>
                        {a.read_time && <div>{a.read_time} min read</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          {!loading && !articles.length && (
            <p className="text-gray-500">No articles found.</p>
          )}
        </div>

        {/* ACTIONS / PAGINATION */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-4 py-2 bg-[#111827] rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-[#111827] rounded disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={handleLoadMore}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-cyan-400 text-black rounded disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      </div>
    </div>
  );
}
