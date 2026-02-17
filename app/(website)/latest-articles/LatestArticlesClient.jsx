"use client";

import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthorLink from \"../../../components/Common/AuthorLink\";

export default function LatestArticlesClient() {
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
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] py-8">
      <div className="max-w-7xl px-4 mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Latest Articles
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
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
              className="w-full md:w-64 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
              aria-label="Search articles"
            />
            <button
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
              className="hidden md:inline-block px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
              aria-label="Clear search"
            >
              Clear
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${!category ? "bg-cyan-600 dark:bg-cyan-600 text-white" : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"}`}
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
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? "bg-cyan-600 dark:bg-cyan-600 text-white" : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800"}`}
              aria-pressed={category === cat.slug}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <div className="w-full aspect-[16/9] bg-gray-200 dark:bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mt-4" />
                </div>
              </div>
            ))}

          {!loading &&
            articles.map((a) => (
              <Link
                key={a.id}
                href={`/${a.author_username || a.author_slug}/${a.slug}`}
                className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all hover:-translate-y-1"
              >
                <div className="flex flex-col h-full">
                  {a.featured_image && (
                    <div className="w-full aspect-[16/9] relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={a.featured_image}
                        alt={a.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                          {a.category_name}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug">
                      {a.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {a.excerpt}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between text-xs">
                        <AuthorLink
                          user={{
                            name: a.author_name,
                            username: a.author_username,
                            slug: a.author_slug,
                            id: a.author_id,
                          }}
                          className="!text-gray-700 !dark:text-gray-300 font-medium"
                        />
                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(a.published_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          {a.read_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{a.read_time} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          {!loading && !articles.length && (
            <p className="text-gray-500 dark:text-gray-500">
              No articles found.
            </p>
          )}
        </div>

        {/* ACTIONS / PAGINATION */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
          >
            Prev
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
          >
            Next
          </button>
          <button
            onClick={handleLoadMore}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-cyan-600 dark:bg-cyan-600 text-white rounded-lg disabled:opacity-50 hover:bg-cyan-700 dark:hover:bg-cyan-700 transition-colors"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      </div>
    </div>
  );
}
