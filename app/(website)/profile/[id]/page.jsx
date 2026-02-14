"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import FollowButton from "@/components/profile/FollowButton";
import {
  Globe,
  Github,
  Linkedin,
  Twitter,
  MapPin,
  Calendar,
  Eye,
  FileText,
  Users,
  UserCheck,
} from "lucide-react";

export default function UserProfilePage({ params }) {
  const { id } = params;
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkFollowStatus();
  }, [id]);

  async function fetchProfile() {
    try {
      const res = await fetch(`/api/users/${id}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function checkFollowStatus() {
    if (!session?.user?.email) return;

    try {
      const users = await fetch(
        `/api/users/${session.user.id}/following`
      ).then((r) => r.json());

      const isFollowingUser = users.following?.some(
        (u) => u.id === parseInt(id)
      );
      setIsFollowing(isFollowingUser);
    } catch (err) {
      console.error("Failed to check follow status:", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-8" />
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            User not found
          </h1>
          <Link
            href="/"
            className="text-cyan-500 hover:text-cyan-600 font-medium"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-gray-900 dark:to-gray-800" />

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 -mt-24 relative z-10 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-white dark:border-gray-900">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase()
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {profile.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {profile.email}
                  </p>
                </div>
                <FollowButton userId={id} isFollowing={isFollowing} />
              </div>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Social Links and Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-cyan-500 transition-colors"
                  >
                    <Globe size={16} />
                    <span>Website</span>
                  </a>
                )}

                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Joined {joinDate}</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex gap-3">
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    <Twitter size={18} className="text-blue-500" />
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Github size={18} className="text-gray-900 dark:text-gray-100" />
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    <Linkedin size={18} className="text-blue-600" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/profile/${id}/followers`}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users size={18} className="text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.followers_count || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
          </Link>

          <Link
            href={`/profile/${id}/following`}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserCheck size={18} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.following_count || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Following</p>
          </Link>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText size={18} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.articles_count || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Articles</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye size={18} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(totalViews / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Views</p>
          </div>
        </div>

        {/* Articles Section */}
        {articles.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Recent Articles
            </h2>

            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  {article.featured_image && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <Eye size={14} />
                      <span>{article.views || 0} views</span>
                      <span>•</span>
                      <span>
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
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
