"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";

export default function FollowButton({ userId, isFollowing: initialIsFollowing }) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const isCurrentUser = session?.user?.id === userId;

  if (isCurrentUser) {
    return null; // Don't show button for own profile
  }

  async function handleFollowToggle() {
    if (!session) {
      // Redirect to login
      window.location.href = "/auth/signin";
      return;
    }

    setLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${userId}/follow`, { method });

      if (res.ok) {
        setIsFollowing(!isFollowing);
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
