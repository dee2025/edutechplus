"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import { UserMinus, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  isCurrentUser: propIsCurrentUser = false,
  onFollowChange = null,
}) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(session?.user?.id ?? null);

  // Keep internal state aligned when parent follow-status resolves asynchronously.
  useEffect(() => {
    setIsFollowing(Boolean(initialIsFollowing));
  }, [initialIsFollowing]);

  // Resolve current user id reliably (session user id is not always present).
  useEffect(() => {
    let active = true;

    async function resolveCurrentUserId() {
      if (!session) {
        if (active) setCurrentUserId(null);
        return;
      }

      if (session?.user?.id != null) {
        if (active) setCurrentUserId(session.user.id);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (active) {
          setCurrentUserId(data?.id ?? null);
        }
      } catch {
        if (active) setCurrentUserId(null);
      }
    }

    resolveCurrentUserId();

    return () => {
      active = false;
    };
  }, [session]);

  // Fetch follow status from API so UI is always correct (including article sidebar).
  useEffect(() => {
    let active = true;

    async function refreshFollowStatus() {
      if (!session || !userId || currentUserId == null) return;
      if (String(currentUserId) === String(userId)) return;

      try {
        const res = await fetch(
          `/api/users/${userId}/is-following?follower_id=${currentUserId}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active && typeof data?.isFollowing === "boolean") {
          setIsFollowing(data.isFollowing);
        }
      } catch {
        // Ignore transient follow status errors.
      }
    }

    refreshFollowStatus();

    return () => {
      active = false;
    };
  }, [session, userId, currentUserId]);

  // Check if viewing own profile
  const isCurrentUser =
    propIsCurrentUser ||
    (currentUserId != null && String(currentUserId) === String(userId));

  // Don't show button if viewing own profile
  if (isCurrentUser) {
    return null;
  }

  // Show Follow button for unauthenticated users, will prompt login
  if (!session) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-cyan-500 text-white hover:bg-cyan-600"
        >
          <UserPlus size={18} />
          <span>Follow</span>
        </button>

        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => {
              setShowAuth(false);
              window.location.reload(); // Reload to update session state
            }}
          />
        )}
      </>
    );
  }

  async function handleFollowToggle() {
    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const newFollowingState = !isFollowing;
        setIsFollowing(newFollowingState);

        // Call callback if provided
        if (onFollowChange) {
          onFollowChange(newFollowingState);
        }
      } else {
        const error = await res.json();
        console.error("Error toggling follow:", error.message);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
        isFollowing
          ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
          : "bg-cyan-500 text-white hover:bg-cyan-600"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isFollowing ? (
        <>
          <UserMinus size={18} />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus size={18} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
