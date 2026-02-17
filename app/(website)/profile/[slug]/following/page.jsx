"use client";

import FollowButton from "@/components/profile/FollowButton";
import { ArrowLeft, UserCheck } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function FollowingPage({ params }) {
  const { slug } = use(params);
  const [profileData, setProfileData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [followStatuses, setFollowStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchProfile();
  }, [slug]);

  useEffect(() => {
    if (profileData?.id) {
      fetchFollowing();
    }
  }, [offset, profileData?.id]);

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data?.id) {
        setCurrentUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  }

  async function fetchProfile() {
    try {
      const res = await fetch(`/api/users/${slug}/profile`);
      const data = await res.json();
      if (res.ok) {
        setProfileData(data.user);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }

  async function fetchFollowing() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/users/${profileData.id}/following?offset=${offset}&limit=20`,
      );
      const data = await res.json();

      const newFollowing = data.following || [];
      if (offset === 0) {
        setFollowing(newFollowing);
      } else {
        setFollowing((prev) => [...prev, ...newFollowing]);
      }

      // Check follow status for each user if currentUser exists
      if (currentUser?.id) {
        const statuses = {};
        for (const user of newFollowing) {
          // Don't check follow status for the current user themselves
          if (user.id !== currentUser.id) {
            try {
              const statusRes = await fetch(
                `/api/users/${user.id}/is-following?follower_id=${currentUser.id}`,
              );
              const statusData = await statusRes.json();
              statuses[user.id] = statusData.isFollowing || false;
            } catch (err) {
              console.error("Failed to check follow status:", err);
              statuses[user.id] = false;
            }
          }
        }
        setFollowStatuses((prev) => ({ ...prev, ...statuses }));
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (err) {
      console.error("Failed to fetch following:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/profile/${slug}`}>
            <button className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft
                size={20}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <UserCheck size={32} className="text-blue-500" />
            Following
          </h1>
        </div>

        {/* Following List */}
        {loading && following.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : following.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <UserCheck
              size={48}
              className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Not following anyone yet
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {following.map((user) => (
                <div
                  key={user.id}
                  className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={`/profile/${user.username || user.user_slug || user.id}`}
                      className="flex items-center gap-4 flex-1 min-w-0 group"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name?.charAt(0)?.toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                          {user.name}
                        </h3>
                        {user.bio && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {user.followers_count || 0} followers •{" "}
                          {user.following_count || 0} following
                        </p>
                      </div>
                    </Link>

                    <FollowButton
                      userId={user.id}
                      isFollowing={followStatuses[user.id] || false}
                      isCurrentUser={currentUser?.id === user.id}
                      onFollowChange={(isFollowing) => {
                        setFollowStatuses((prev) => ({
                          ...prev,
                          [user.id]: isFollowing,
                        }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setOffset(offset + 20)}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
