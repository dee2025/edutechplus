"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function FollowersPage({ params }) {
  const { id } = params;
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchFollowers();
  }, [id, offset]);

  async function fetchFollowers() {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${id}/followers?offset=${offset}&limit=20`);
      const data = await res.json();
      setFollowers(data.followers || []);
      setHasMore(data.pagination?.hasMore || false);
    } catch (err) {
      console.error("Failed to fetch followers:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/profile/${id}`}>
            <button className="w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users size={32} className="text-cyan-500" />
            Followers
          </h1>
        </div>

        {/* Followers List */}
        {loading ? (
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
        ) : followers.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No followers yet
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {followers.map((follower) => (
                <Link
                  key={follower.id}
                  href={`/profile/${follower.id}`}
                  className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
                        {follower.avatar_url ? (
                          <img
                            src={follower.avatar_url}
                            alt={follower.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          follower.name?.charAt(0)?.toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                          {follower.name}
                        </h3>
                        {follower.bio && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {follower.bio}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {follower.following_count || 0} following
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-cyan-500">
                        View →
                      </div>
                    </div>
                  </div>
                </Link>
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
