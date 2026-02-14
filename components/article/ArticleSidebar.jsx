import { Eye, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ArticleSidebar({ trending }) {
  const getArticleUrl = (item) => `/${item.category_slug}/${item.slug}`;
  return (
    <div className="sticky top-24 space-y-5">
      {/* Trending */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Trending Now
          </h3>
        </div>

        <ul className="space-y-4">
          {trending.map((item, index) => (
            <li key={item.id} className="group">
              <Link
                href={getArticleUrl(item)}
                className="flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 -m-2 rounded-lg transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug line-clamp-2 mb-1">
                    {item.title}
                  </h4>
                  {item.views && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>{item.views?.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-cyan-50 dark:bg-gray-900 rounded-lg p-5 border border-cyan-200 dark:border-gray-800">
        <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
          Stay Updated
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Get the latest tech articles delivered to your inbox.
        </p>
        <button className="w-full bg-cyan-600 dark:bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 dark:hover:bg-cyan-700 transition-colors text-sm">
          Subscribe Now
        </button>
      </div>

      {/* Ad */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-700 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider block mb-3">
          Advertisement
        </span>
        <div className="h-60 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          300 × 250
        </div>
      </div>
    </div>
  );
}
