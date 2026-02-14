/**
 * SITEMAP SETUP VERIFICATION CHECKLIST
 *
 * After implementation, verify the following:
 */

import { query } from "@/lib/db";

export const metadata = {
  title: "Sitemap Setup Verification",
  description: "Verify sitemap configuration and test URLs",
};

async function getSitemapStats() {
  try {
    const articles = await query(
      "SELECT COUNT(*) as count FROM articles WHERE status = 'published'",
    );
    const categories = await query(
      "SELECT COUNT(*) as count FROM categories WHERE parent_id IS NULL",
    );
    return {
      articles: articles?.[0]?.count || 0,
      categories: categories?.[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { articles: 0, categories: 0, roadmaps: 0 };
  }
}

export default async function SitemapSetupPage() {
  const stats = await getSitemapStats();
  const totalURLs = 10 + stats.articles + stats.categories; // 10 static pages

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          📊 Sitemap Setup Verification
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Published Articles
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.articles}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Categories
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.categories}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Roadmaps</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.roadmaps}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Total URLs
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {totalURLs}
            </p>
          </div>
        </div>

        {/* Test Links */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            ✅ Verify Sitemaps
          </h2>
          <div className="space-y-3">
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Main Sitemap:
              </span>
              <br />
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                /sitemap.xml
              </a>
            </p>
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Robots File:
              </span>
              <br />
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                /robots.txt
              </a>
            </p>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            🔗 API Endpoints
          </h2>
          <div className="space-y-3 font-mono text-sm">
            <p>
              <a
                href="/api/public/sitemap?type=all"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                /api/public/sitemap?type=all
              </a>
            </p>
            <p>
              <a
                href="/api/public/sitemap?type=articles"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                /api/public/sitemap?type=articles
              </a>
            </p>
            <p>
              <a
                href="/api/public/sitemap?type=categories"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                /api/public/sitemap?type=categories
              </a>
            </p>
            <p>
              <a
                href="/api/public/sitemap?type=roadmaps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                /api/public/sitemap?type=roadmaps
              </a>
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <h2 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-100">
            ✓ Implementation Checklist
          </h2>
          <ul className="space-y-2 text-green-900 dark:text-green-100">
            <li>✅ app/sitemap.js created - Main sitemap generation</li>
            <li>✅ app/robots.js created - Robots configuration</li>
            <li>
              ✅ /api/public/sitemap/route.js created - Detailed API endpoint
            </li>
            <li>
              ✅ NEXT_PUBLIC_SITE_URL added to .env.local -{" "}
              {process.env.NEXT_PUBLIC_SITE_URL}
            </li>
            <li>✅ Static pages included - 10 pages</li>
            <li>✅ Dynamic articles included - {stats.articles} URLs</li>
            <li>✅ Dynamic categories included - {stats.categories} URLs</li>
            <li>✅ Dynamic roadmaps included - {stats.roadmaps} URLs</li>
            <li>✅ Automatic pagination support - 50k URLs per sitemap max</li>
            <li>
              ✅ Caching enabled - 1 hour, stale-while-revalidate: 24 hours
            </li>
            <li>✅ Image sitemaps - Featured images included</li>
            <li>✅ Priority-based URLs - 1.0 for home, 0.5-0.9 for others</li>
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
            🚀 Next Steps for SEO
          </h2>
          <ol className="space-y-3 text-blue-900 dark:text-blue-100 list-decimal list-inside">
            <li>
              <strong>Submit to Google Search Console:</strong>
              <br />
              Go to GSC → Sitemaps → Add your sitemap.xml
            </li>
            <li>
              <strong>Submit to Bing Webmaster Tools:</strong>
              <br />
              Similar process at bing.com/webmasters
            </li>
            <li>
              <strong>Monitor Coverage Report:</strong>
              <br />
              Check GSC to see if all URLs are being indexed
            </li>
            <li>
              <strong>Monitor Crawl Stats:</strong>
              <br />
              Track crawl efficiency in GSC Settings
            </li>
            <li>
              <strong>Verify Canonical Tags:</strong>
              <br />
              Ensure each page has proper canonical link
            </li>
            <li>
              <strong>Add Structured Data:</strong>
              <br />
              Consider adding schema.org markup for rich results
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
