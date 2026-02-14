"use client";

import { FollowButton } from "@/components/profile/FollowButton";
import {
  ExternalLink,
  Github,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MapPin,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserProfilePage({ params }) {
  const { slug } = params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [slug]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${slug}/profile`);
      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch profile:", data.message);
        return;
      }

      setUser(data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            User not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The profile you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-black">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 dark:from-cyan-900 dark:via-blue-900 dark:to-purple-900" />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg -mt-24 relative z-10 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0 overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
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

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {user.name}
              </h1>
              {user.bio && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {user.bio}
                </p>
              )}

              {/* Social Links and Info */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-1">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <LinkIcon size={16} />
                    <span>Website</span>
                  </a>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex gap-3 mb-4">
                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors"
                    title="Twitter"
                  >
                    <Twitter size={18} className="text-[#1DA1F2]" />
                  </a>
                )}
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors"
                    title="GitHub"
                  >
                    <Github size={18} className="text-gray-900 dark:text-gray-100" />
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${user.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 rounded-lg transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin size={18} className="text-[#0A66C2]" />
                  </a>
                )}
              </div>

              {/* Follow Button */}
              <FollowButton userId={user.id} isCurrentUser={false} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
            <Link
              href={`/profile/${user.user_slug}/followers`}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                Followers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.followers_count || 0}
              </p>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
            <Link
              href={`/profile/${user.user_slug}/following`}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                Following
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.following_count || 0}
              </p>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
              Articles
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user.articles_count || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
              Total Views
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(user.total_views || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Recent Articles */}
        {user.articles && user.articles.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Articles
            </h2>
            <div className="space-y-4">
              {user.articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md transition-all"
                >
                  <div className="flex gap-4">
                    {article.featured_image && (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-500 mt-2">
                        <span>{article.views || 0} views</span>
                        <span>
                          {new Date(article.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
