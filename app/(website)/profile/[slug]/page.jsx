"use client";

import EditProfileModal from "@/components/profile/EditProfileModal";
import FollowButton from "@/components/profile/FollowButton";
import RecentReads from "@/components/profile/RecentReads";
import StreakCalendar from "@/components/profile/StreakCalendar";
import {
  Edit3,
  Github,
  Link as LinkIcon,
  Linkedin,
  MapPin,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserProfilePage() {
  const params = useParams();
  const slug = params?.slug;
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchData();
  }, [slug]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch the profile user
      const profileRes = await fetch(`/api/users/${slug}/profile`);
      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        console.error("Failed to fetch profile:", profileData.message);
        setLoading(false);
        return;
      }

      setUser(profileData.user);

      // Fetch current user
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();

      if (meRes.ok && meData && meData.id) {
        setCurrentUser(meData);

        // Check if current user is following this profile user
        if (meData.id !== profileData.user.id) {
          checkFollowStatus(meData.id, profileData.user.id);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function checkFollowStatus(currentUserId, profileUserId) {
    try {
      const res = await fetch(
        `/api/users/${profileUserId}/is-following?follower_id=${currentUserId}`,
      );
      const data = await res.json();

      if (res.ok && data.isFollowing !== undefined) {
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error("Error checking follow status:", err);
    }
  }

  function handleProfileUpdate(updatedUser) {
    setUser(updatedUser);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  }

  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f19]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f19]">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 bg-white dark:bg-[#0b0f19] min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {isOwnProfile ? "Your Profile" : `${user.name}'s Profile`}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card - Left Sidebar */}
        <aside className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sticky top-6 space-y-6">
            {/* Avatar and Name Section */}
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center transition hover:scale-[1.02]">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-white">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Identity */}
              <div className="mt-4">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user.name}
                </p>
                {isOwnProfile && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                )}
                {user.username && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    @{user.username}
                  </p>
                )}
              </div>

              {user.bio && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {user.bio}
                </p>
              )}

              {/* Location and Links */}
              {(user.location || user.website) && (
                <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                    >
                      <LinkIcon size={14} />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>

              {/* Social Media Icons */}
              {(user.twitter || user.github || user.linkedin) && (
                <div className="mt-4 flex gap-3">
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
                      <Github
                        size={18}
                        className="text-gray-900 dark:text-gray-100"
                      />
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
              )}

              {/* Action Buttons */}
              <div className="mt-6 w-full space-y-2">
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <FollowButton
                    userId={user.id}
                    isFollowing={isFollowing}
                    isCurrentUser={false}
                  />
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="grid grid-cols-3 gap-3">
                <Link
                  href={`/profile/${user.username || user.user_slug || user.id}/followers`}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Followers
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {user.followers_count || 0}
                  </p>
                </Link>

                <Link
                  href={`/profile/${user.username || user.user_slug || user.id}/following`}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Following
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {user.following_count || 0}
                  </p>
                </Link>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Articles
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {user.articles_count || 0}
                  </p>
                </div>
              </div>

              {user.total_views > 0 && (
                <div className="mt-3 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-3 text-center border border-cyan-200 dark:border-cyan-800">
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Total Views
                  </p>
                  <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                    {user.total_views.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content - Right Side */}
        <section className="lg:col-span-8 space-y-6">
          {/* Recent Articles */}
          {user.articles && user.articles.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
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
                            {new Date(
                              article.published_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Show Streak and Recent Reads only for own profile */}
          {isOwnProfile && (
            <>
              {/* Streak Calendar */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Reading Streak
                </h2>
                <div className="overflow-x-auto">
                  <StreakCalendar days={180} />
                </div>
              </div>

              {/* Recent Reads */}
              <RecentReads max={10} />
            </>
          )}

          {/* No Articles Message */}
          {(!user.articles || user.articles.length === 0) && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {isOwnProfile
                  ? "You haven't published any articles yet."
                  : `${user.name} hasn't published any articles yet.`}
              </p>
              {isOwnProfile && (
                <Link
                  href="/publish"
                  className="inline-block mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Write your first article
                </Link>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}
