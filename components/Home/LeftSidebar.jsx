"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import { Tag } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LeftSidebar() {
  const { data: session } = useSession();
  const [showAuth, setShowAuth] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTags();
  }, []);

  async function fetchTrendingTags() {
    try {
      setTagsLoading(true);
      const res = await fetch("/api/tags/trending");
      const data = await res.json();
      if (res.ok) {
        setTags(data.tags?.slice(0, 5) || []);
      }
    } catch (err) {
      console.error("Failed to fetch trending tags:", err);
    } finally {
      setTagsLoading(false);
    }
  }

  return (
    <aside className="hidden lg:block w-64 sticky top-20 h-fit">
      <div className="space-y-4">
        {/* User Actions */}
        {session?.user ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <Link
              href="/profile"
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

        {/* Tags */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Tag size={16} />
            Popular Tags
          </h3>
          <div className="space-y-2">
            {tagsLoading ? (
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-7 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
                />
              ))
            ) : tags.length > 0 ? (
              tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="block px-3 py-1 text-sm text-cyan-500 hover:bg-cyan-50 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  #{tag.name}
                  <span className="text-xs text-gray-400 ml-1">
                    ({tag.article_count})
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No tags yet
              </p>
            )}
          </div>
          <Link
            href="/tags"
            className="text-xs text-cyan-500 hover:text-cyan-600 font-medium mt-3 block"
          >
            View all tags →
          </Link>
        </div>

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
