"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import { Check, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ArticleTitleActions({ article }) {
  const { data: session } = useSession();
  const [likesCount, setLikesCount] = useState(
    Number(article?.likes_count || 0),
  );
  const [viewsCount, setViewsCount] = useState(Number(article?.views || 0));
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    setViewsCount(Number(article?.views || 0));
  }, [article?.views]);

  useEffect(() => {
    if (!article?.slug) return;

    let mounted = true;

    async function loadViews() {
      try {
        const res = await fetch(
          `/api/public/articles/${article.slug}/view?ts=${Date.now()}`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;

        if (typeof data?.views === "number") {
          setViewsCount(data.views);
        }
      } catch {
        // Ignore transient view fetch errors.
      }
    }

    function onViewUpdate(event) {
      const detail = event?.detail;
      if (!detail || detail.slug !== article.slug) return;
      if (typeof detail.views === "number") {
        setViewsCount(detail.views);
      }
    }

    loadViews();
    window.addEventListener("article-view-updated", onViewUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("article-view-updated", onViewUpdate);
    };
  }, [article?.slug]);

  useEffect(() => {
    let mounted = true;

    async function loadLikeState() {
      if (!article?.id) return;

      try {
        const res = await fetch(`/api/articles/${article.id}/like`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setIsLiked(Boolean(data.isLiked));
        setLikesCount(Number(data.likesCount || 0));
      } catch (err) {
        console.error("Failed to load like state:", err);
      }
    }

    loadLikeState();

    return () => {
      mounted = false;
    };
  }, [article?.id]);

  async function handleLike() {
    if (!session) {
      setShowAuth(true);
      return;
    }

    if (!article?.id || isLoading) return;

    setIsLoading(true);
    try {
      const method = isLiked ? "DELETE" : "POST";
      const res = await fetch(`/api/articles/${article.id}/like`, { method });
      const data = await res.json();

      if (!res.ok) return;

      setIsLiked(Boolean(data.liked));
      setLikesCount(Number(data.likesCount || 0));
    } catch (err) {
      console.error("Failed to toggle like:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCommentJump() {
    const commentsEl = document.getElementById("comments-section");
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", "#comments-section");
    }
  }

  async function handleShare() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title || "Article",
          text: article?.excerpt || "Check out this article",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Failed to share article:", err);
      }
    }
  }

  return (
    <>
      <div className="mb-5 sm:mb-7 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5">
          <Eye size={14} />
          {viewsCount.toLocaleString()}
        </span>

        <button
          onClick={handleLike}
          disabled={isLoading}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
            isLiked
              ? "border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <Heart size={14} className={isLiked ? "fill-current" : ""} />
          {likesCount}
        </button>

        <button
          onClick={handleCommentJump}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <MessageCircle size={14} />
          {article.comments_count || 0}
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? "Link copied" : "Share"}
        </button>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
