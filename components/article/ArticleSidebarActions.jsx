"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import { Check, Heart, MessageCircle, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ArticleSidebarActions({ article }) {
  const { data: session } = useSession();
  const [likesCount, setLikesCount] = useState(Number(article?.likes_count || 0));
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

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
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Failed to share article:", err);
      }
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Actions
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors border ${
              isLiked
                ? "border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            <span className="inline-flex items-center gap-2">
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              Like
            </span>
            <span className="font-medium">{likesCount}</span>
          </button>

          <button
            onClick={handleCommentJump}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <MessageCircle className="w-4 h-4" />
            Comment
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Link copied" : "Share"}
          </button>
        </div>
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
