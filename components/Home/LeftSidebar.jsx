"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LeftSidebar() {
  const { data: session } = useSession();
  const [showAuth, setShowAuth] = useState(false);
  const [following, setFollowing] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [mySlug, setMySlug] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFollowingMembers() {
      if (!session?.user?.email) {
        setFollowing([]);
        return;
      }

      try {
        setFollowingLoading(true);

        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meRes.ok) {
          if (!cancelled) setFollowing([]);
          return;
        }

        const me = await meRes.json();
        if (!me?.id) {
          if (!cancelled) setFollowing([]);
          return;
        }

        if (!cancelled) {
          setMySlug(me.username || me.user_slug || me.id);
        }

        const followingRes = await fetch(
          `/api/users/${me.id}/following?limit=6`,
          {
            cache: "no-store",
          },
        );

        if (!followingRes.ok) {
          if (!cancelled) setFollowing([]);
          return;
        }

        const data = await followingRes.json();
        if (!cancelled) {
          setFollowing(data.following || []);
        }
      } catch (err) {
        console.error("Failed to fetch following members:", err);
        if (!cancelled) {
          setFollowing([]);
        }
      } finally {
        if (!cancelled) {
          setFollowingLoading(false);
        }
      }
    }

    fetchFollowingMembers();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.email]);

  return (
    <aside className="hidden lg:block w-64 sticky top-20 h-fit">
      <div className="space-y-4">
        {/* User Actions */}
        {session?.user ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <Link
              href={mySlug ? `/${mySlug}` : "/"}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
            >
              <span>Dashboard</span>
            </Link>
            <Link
              href="/publish"
              className="w-full block text-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
            >
              Write Article
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Sign in to personalize your feed
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="w-full block text-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Following Members */}
        {session?.user && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Following
            </h3>

            {followingLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : following.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You are not following anyone yet.
              </p>
            ) : (
              <div className="space-y-2">
                {following.map((member) => (
                  <Link
                    key={member.id}
                    href={`/${member.username || member.user_slug || member.id}`}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-semibold overflow-hidden">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (member.name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {member.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            About Edutech+
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            A platform for developers to share knowledge, discover content, and
            grow their skills.
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            window.location.reload();
          }}
        />
      )}
    </aside>
  );
}
