import { Calendar, Clock } from "lucide-react";
import AuthorLink from "../Common/AuthorLink";
import ViewsBadge from "./ViewsBadge";

export default function ArticleHeader({ article, categories }) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Categories */}
        <div className="flex items-center justify-center mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            {categories}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight text-center mb-4 px-2">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-5 leading-relaxed px-4">
            {article.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-gray-600 dark:text-gray-400 px-2">
          <AuthorLink
            user={{
              name: article.author_name,
              username: article.author_username,
              slug: article.author_slug,
              id: article.author_id,
            }}
            className="!text-gray-900 !dark:text-gray-100"
          />

          <span className="text-gray-400 dark:text-gray-600">•</span>

          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(article.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <span className="text-gray-400 dark:text-gray-600">•</span>

          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{article.read_time} min read</span>
          </div>

          <span className="text-gray-400 dark:text-gray-600">•</span>

          <ViewsBadge slug={article.slug} initial={article.views ?? 0} />
        </div>
      </div>
    </header>
  );
}
