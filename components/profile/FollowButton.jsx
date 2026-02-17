"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import { UserMinus, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

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

  // Check if viewing own profile
  const isCurrentUser = propIsCurrentUser || session?.user?.id === userId;

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
