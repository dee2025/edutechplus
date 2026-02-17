"use client";

import AuthorLink from \"@/components/Common/AuthorLink\";
import AuthModal from "@/components/UserAuth/AuthModal";
import {
  ArrowLeft,
  Check,
  Clock,
  Hash,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

export default function TagPage({ params }) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const [tag, setTag] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [shareStates, setShareStates] = useState({});
  const [showAuth, setShowAuth] = useState(false);

  const fetchTagArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/articles/by-tag?slug=${slug}&limit=50`);

      if (res.status === 404) {
        setError("Tag not found");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch tag articles");

      const data = await res.json();
      setTag(data.tag);
      let articlesData = data.articles || [];

      // Sort articles based on sortBy
      if (sortBy === "popular") {
        articlesData = articlesData.sort(
          (a, b) => (b.views || 0) - (a.views || 0),
        );
      } else if (sortBy === "trending") {
        articlesData = articlesData.sort((a, b) => {
          const scoreA =
            (a.views || 0) * 0.5 +
            (a.likes_count || 0) * 2 +
            (a.comments_count || 0) * 3;
          const scoreB =
            (b.views || 0) * 0.5 +
            (b.likes_count || 0) * 2 +
            (b.comments_count || 0) * 3;
          return scoreB - scoreA;
        });
      } else {
        // Latest (default)
        articlesData = articlesData.sort(
          (a, b) =>
            new Date(b.published_at || b.created_at) -
            new Date(a.published_at || a.created_at),
        );
      }

      setArticles(articlesData);

      // Fetch likes count for each article
      const counts = {};
      for (const article of articlesData) {
        try {
          const likeRes = await fetch(`/api/articles/${article.id}/like`);
          const likeData = await likeRes.json();
          if (likeRes.ok) {
            counts[article.id] = likeData.likesCount;
            if (likeData.isLiked) {
              setLikedArticles((prev) => new Set([...prev, article.id]));
            }
          }
        } catch (err) {
          console.error(
            `Failed to fetch likes for article ${article.id}:`,
            err,
          );
        }
      }
      setLikeCounts(counts);
    } catch (err) {
      console.error("Failed to fetch tag articles:", err);
      setError(err.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [slug, sortBy]);

  useEffect(() => {
    fetchTagArticles();
  }, [fetchTagArticles]);

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
        if (isLiked) {
          setLikedArticles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(articleId);
            return newSet;
          });
        } else {
          setLikedArticles((prev) => new Set([...prev, articleId]));
        }
        setLikeCounts((prev) => ({ ...prev, [articleId]: data.likesCount }));
      }
    } catch (err) {
      console.error("Failed to like/unlike article:", err);
    }
  };

  const handleShare = async (article) => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    const url = `${window.location.origin}/${article.author_username || article.author_slug || article.author_id}/${article.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.description,
          url: url,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareStates((prev) => ({ ...prev, [article.id]: true }));
        setTimeout(() => {
          setShareStates((prev) => ({ ...prev, [article.id]: false }));
        }, 2000);
      } catch (err) {
        console.error("Copy failed:", err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-6 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Articles Skeleton */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-800" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tag Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The tag you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Browse All Tags
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 mb-6 transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            All Tags
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Hash className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                #{tag?.name}
              </h1>
              {tag?.description && (
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                  {tag.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {articles.length}{" "}
                {articles.length === 1 ? "Article" : "Articles"}
              </span>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy("latest")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "latest"
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-cyan-500 dark:hover:border-cyan-500"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1.5" />
                Latest
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "popular"
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-cyan-500 dark:hover:border-cyan-500"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1.5" />
                Popular
              </button>
              <button
                onClick={() => setSortBy("trending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "trending"
                    ? "bg-cyan-500 text-white shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-cyan-500 dark:hover:border-cyan-500"
                }`}
              >
                <Heart className="w-4 h-4 inline mr-1.5" />
                Trending
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {articles.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Articles Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to write an article with this tag!
            </p>
            <Link
              href="/publish"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-500/25"
            >
              Start Writing →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50"
              >
                {/* Featured Image */}
                {article.featured_image && (
                  <Link
                    href={`/${article.author_username || article.author_slug || article.author_id}/${article.slug}`}
                    className="block relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                  >
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )}

                <div className="p-5 sm:p-6">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Link
                      href={`/profile/${article.author_slug || article.author_id}`}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform shadow-md"
                    >
                      {article.author_name?.charAt(0)?.toUpperCase() || "A"}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <AuthorLink
                        user={{
                          name: article.author_name || "Anonymous",
                          slug: article.author_slug,
                          id: article.author_id,
                        }}
                        className="text-gray-900 dark:text-gray-100 block text-sm font-semibold hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span>
                          {formatDate(
                            article.published_at || article.created_at,
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          {calculateReadTime(article.content)} min read
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Title & Excerpt */}
                  <Link
                    href={`/${article.author_username || article.author_slug || article.author_id}/${article.slug}`}
                    className="block group/title"
                  >
                    <h2 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2 group-hover/title:text-cyan-500 dark:group-hover/title:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {article.excerpt ||
                      article.description ||
                      "No description available"}
                  </p>

                  {/* Categories */}
                  {article.categories && article.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.categories.slice(0, 2).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors font-medium"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Footer - Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => handleLike(article.id)}
                        className={`flex items-center gap-1.5 font-medium transition-colors ${
                          likedArticles.has(article.id)
                            ? "text-red-500"
                            : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                        }`}
                      >
                        <Heart
                          size={18}
                          className={
                            likedArticles.has(article.id) ? "fill-current" : ""
                          }
                        />
                        <span>{likeCounts[article.id] || 0}</span>
                      </button>

                      <Link
                        href={`/${article.author_username || article.author_slug || article.author_id}/${article.slug}#comments`}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-cyan-500 transition-colors font-medium"
                      >
                        <MessageCircle size={18} />
                        <span>{article.comments_count || 0}</span>
                      </Link>

                      <button
                        onClick={() => handleShare(article)}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-cyan-500 transition-colors font-medium"
                      >
                        {shareStates[article.id] ? (
                          <>
                            <Check size={18} className="text-green-500" />
                            <span className="text-green-500 text-xs">
                              Copied!
                            </span>
                          </>
                        ) : (
                          <Share2 size={18} />
                        )}
                      </button>
                    </div>

                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {article.views || 0} views
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            fetchTagArticles();
          }}
        />
      )}
    </div>
  );
}
