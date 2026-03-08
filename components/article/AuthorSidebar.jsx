import FollowButton from "@/components/profile/FollowButton";
import { Calendar, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import ArticleSidebarActions from "./ArticleSidebarActions";

function formatDate(date) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function AuthorSidebar({ article, latestByAuthor = [] }) {
  const authorProfileUrl = `/${article.author_username}`;

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      {/* <ArticleSidebarActions article={article} /> */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {article.author_avatar ? (
            <img
              src={article.author_avatar}
              alt={article.author_name || "Author"}
              className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {article.author_name || "Author"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              @{article.author_username}
            </p>
          </div>
        </div>

        {article.bio && (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {article.bio}
          </p>
        )}

        <div className="mt-4">
          <FollowButton
            userId={article.author_id}
            isFollowing={Boolean(article.is_following)}
            isCurrentUser={false}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href={authorProfileUrl}
            className="inline-flex items-center gap-1.5 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            View profile
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Latest from this user
        </h3>

        {latestByAuthor.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No other published articles yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {latestByAuthor.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/${article.author_username}/${item.slug}`}
                  className="block rounded-lg p-2 -m-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.published_at)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
