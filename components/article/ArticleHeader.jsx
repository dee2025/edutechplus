import { Calendar, Clock } from "lucide-react";
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
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight text-center mb-4">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-5 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {article.author_name}
          </span>

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
