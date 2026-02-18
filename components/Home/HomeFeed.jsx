"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import { Check, Heart, MessageCircle, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AuthorLink from "../Common/AuthorLink";

export default function HomeFeed({ filter = "latest", initialArticles = [] }) {
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(
    !(filter === "latest" && initialArticles.length > 0),
  );
  const [activeFilter, setActiveFilter] = useState(filter);
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [shareStates, setShareStates] = useState({});
  const [showAuth, setShowAuth] = useState(false);

  const normalizeSlug = (slug) =>
    (slug || "").replace(/^\/?(articles|article)\//, "");
  const normalizeAuthor = (author) =>
    (author || "").replace(/^\/?profile\//, "").replace(/^\/+/, "");
  const getArticleUrl = (article) => {
    const author = normalizeAuthor(
      article.author_username || article.author_slug || article.author_id,
    );
    return `/${author}/${normalizeSlug(article.slug)}`;
  };
  // Removed getCategoryUrl

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint;
      if (activeFilter === "following") {
        endpoint = `/api/articles/following?limit=20`;
      } else if (activeFilter === "top") {
        endpoint = `/api/articles/trending?limit=20`;
      } else {
        endpoint = `/api/articles/latest?limit=20`;
      }

      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();

      if (res.ok) {
        const articlesData = data.articles || [];
        setArticles(articlesData);

        const counts = Object.fromEntries(
          articlesData.map((article) => [article.id, article.likes_count || 0]),
        );
        setLikeCounts(counts);
      } else {
        console.error("Failed to fetch articles:", data.error);
        setArticles([]);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (activeFilter === "latest" && initialArticles.length > 0) {
      setArticles(initialArticles);
      const counts = Object.fromEntries(
        initialArticles.map((article) => [
          article.id,
          article.likes_count || 0,
        ]),
      );
      setLikeCounts(counts);
      setLoading(false);
      return;
    }

    fetchArticles();
  }, [fetchArticles, activeFilter, initialArticles]);

  useEffect(() => {
    async function fetchLikedArticles() {
      try {
        const res = await fetch("/api/articles/likes", { cache: "no-store" });
        if (!res.ok) {
          setLikedArticles(new Set());
          return;
        }
        const data = await res.json();
        setLikedArticles(new Set(data.likedArticles || []));
      } catch (err) {
        console.error("Failed to fetch liked articles:", err);
      }
    }

    if (status === "authenticated") {
      fetchLikedArticles();
    } else if (status === "unauthenticated") {
      setLikedArticles(new Set());
    }
  }, [status]);

  const handleLike = async (articleId) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    const isLiked = likedArticles.has(articleId);
    const method = isLiked ? "DELETE" : "POST";

    try {
      const res = await fetch(`/api/articles/${articleId}/like`, { method });
      const data = await res.json();

      if (res.ok) {
        // Update liked articles set
        setLikedArticles((prev) => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(articleId);
          } else {
            newSet.add(articleId);
          }
          return newSet;
        });

        // Update like count
        setLikeCounts((prev) => ({
          ...prev,
          [articleId]: data.likesCount,
        }));
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleShare = async (article) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    const url = `${window.location.origin}${getArticleUrl(article)}`;

    try {
      if (navigator.share) {
        // Use native share if available
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.description,
          url: url,
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(url);
        setShareStates((prev) => ({ ...prev, [article.id]: true }));
        setTimeout(() => {
          setShareStates((prev) => ({ ...prev, [article.id]: false }));
        }, 2000);
      }
    } catch (err) {
      // User cancelled share or clipboard failed
      if (err.name !== "AbortError") {
        console.error("Error sharing:", err);
      }
    }
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = (content || "").split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes < 1 ? 1 : minutes;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <main className="flex-1 max-w-2xl top-24">
      {/* Filter Tabs */}
      <div className="bg-white mt-4 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveFilter("latest")}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeFilter === "latest"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Latest
          </button>
          {session && (
            <button
              onClick={() => setActiveFilter("following")}
              className={`flex-1 px-4 py-3 font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
                activeFilter === "following"
                  ? "text-cyan-500 border-b-2 border-cyan-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Following
            </button>
          )}
          <button
            onClick={() => setActiveFilter("top")}
            className={`flex-1 px-4 py-3 font-medium transition-colors border-l border-gray-200 dark:border-gray-700 ${
              activeFilter === "top"
                ? "text-cyan-500 border-b-2 border-cyan-500"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Top
          </button>
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-6">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
            >
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))
        ) : articles.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {activeFilter === "following"
                ? "No articles from people you follow yet"
                : "No articles available yet"}
            </p>
            {activeFilter === "following" && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Start following writers to see their articles here
              </p>
            )}
          </div>
        ) : (
          articles.map((article) => (
            <article
              key={article.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow hover:border-gray-300 dark:hover:border-gray-600"
            >
              {/* Header - Author Info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <Link
                    href={`/${article.author_username || article.author_slug || article.author_id}`}
                    className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center shrink-0 text-white text-sm font-bold overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    {article.author_name?.charAt(0)?.toUpperCase() || "A"}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <AuthorLink
                      user={{
                        name: article.author_name || "Anonymous",
                        username: article.author_username,
                        slug: article.author_slug,
                        id: article.author_id,
                      }}
                      className="text-gray-900! dark:text-gray-100! block text-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(article.published_at || article.created_at)} •{" "}
                      {calculateReadTime(article.content)} min read
                    </p>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {article.featured_image && (
                <Link href={getArticleUrl(article)}>
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer group">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
              )}

              {/* Content */}
              <Link href={getArticleUrl(article)} className="block group">
                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 group-hover:text-cyan-500 transition-colors line-clamp-2">
                  {article.title}
                </h2>
              </Link>

              <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3 text-sm">
                {article.excerpt || article.description}
              </p>

              {/* Tags logic can be added here if needed */}

              {/* Footer - Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4 text-xs font-medium">
                  <button
                    onClick={() => handleLike(article.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      likedArticles.has(article.id)
                        ? "text-red-500 hover:text-red-600"
                        : "hover:text-cyan-500"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={
                        likedArticles.has(article.id) ? "currentColor" : "none"
                      }
                    />
                    <span>{likeCounts[article.id] || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-cyan-500 transition-colors">
                    <MessageCircle size={16} />
                    <span>{article.comments_count || 0}</span>
                  </button>
                  <button
                    onClick={() => handleShare(article)}
                    className="flex items-center gap-1 hover:text-cyan-500 transition-colors"
                    title="Share article"
                  >
                    {shareStates[article.id] ? (
                      <>
                        <Check size={16} />
                        <span className="text-xs">Copied!</span>
                      </>
                    ) : (
                      <Share2 size={16} />
                    )}
                  </button>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {article.views || 0} views
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            fetchArticles();
          }}
        />
      )}
    </main>
  );
}
