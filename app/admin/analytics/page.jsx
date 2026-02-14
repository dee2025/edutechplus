"use client";

import { Calendar, Eye, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [topArticles, setTopArticles] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, chartRes, articlesRes, categoriesRes] =
          await Promise.all([
            fetch("/api/admin/analytics/overview"),
            fetch(`/api/admin/analytics/chart-data?days=30`),
            fetch(
              `/api/admin/analytics/top-articles?period=${period}&limit=10`,
            ),
            fetch(`/api/admin/analytics/categories?period=${period}`),
          ]);

        if (
          !overviewRes.ok ||
          !chartRes.ok ||
          !articlesRes.ok ||
          !categoriesRes.ok
        ) {
          throw new Error("Failed to fetch analytics");
        }

        const [overviewData, chartData, articlesData, categoriesData] =
          await Promise.all([
            overviewRes.json(),
            chartRes.json(),
            articlesRes.json(),
            categoriesRes.json(),
          ]);

        setOverview(overviewData);
        setChartData(chartData);
        setTopArticles(articlesData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6 bg-gray-50 dark:bg-[#0b0f19] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive view statistics and insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="Total Views"
          value={overview?.total_views?.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={Calendar}
          label="Today's Views"
          value={overview?.today_views?.toLocaleString()}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="This Week"
          value={overview?.week_views?.toLocaleString()}
          color="purple"
        />
        <StatCard
          icon={Users}
          label="This Month"
          value={overview?.month_views?.toLocaleString()}
          color="orange"
        />
      </div>

      {/* Visitor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Time Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All Time - Auth vs Anonymous
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Authenticated
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {overview?.auth_breakdown?.authenticated?.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      overview?.auth_breakdown?.authenticated +
                        overview?.auth_breakdown?.anonymous >
                      0
                        ? (overview?.auth_breakdown?.authenticated /
                            (overview?.auth_breakdown?.authenticated +
                              overview?.auth_breakdown?.anonymous)) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Anonymous
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {overview?.auth_breakdown?.anonymous?.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${
                      overview?.auth_breakdown?.authenticated +
                        overview?.auth_breakdown?.anonymous >
                      0
                        ? (overview?.auth_breakdown?.anonymous /
                            (overview?.auth_breakdown?.authenticated +
                              overview?.auth_breakdown?.anonymous)) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Today Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today - Auth vs Anonymous
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Authenticated
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {overview?.today_breakdown?.authenticated?.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      overview?.today_breakdown?.authenticated +
                        overview?.today_breakdown?.anonymous >
                      0
                        ? (overview?.today_breakdown?.authenticated /
                            (overview?.today_breakdown?.authenticated +
                              overview?.today_breakdown?.anonymous)) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Anonymous
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {overview?.today_breakdown?.anonymous?.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${
                      overview?.today_breakdown?.authenticated +
                        overview?.today_breakdown?.anonymous >
                      0
                        ? (overview?.today_breakdown?.anonymous /
                            (overview?.today_breakdown?.authenticated +
                              overview?.today_breakdown?.anonymous)) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Views Over Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Views Over Time (Last 30 Days)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">
                  Total Views
                </th>
                <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">
                  Auth Views
                </th>
                <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">
                  Anon Views
                </th>
                <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">
                  Articles
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData?.views_by_date?.slice(0, 15).map((day, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                    {day.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                    {day.auth_views}
                  </td>
                  <td className="py-3 px-4 text-right text-purple-600 dark:text-purple-400">
                    {day.anon_views}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                    {day.articles_viewed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Articles & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Articles
            </h3>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 text-sm"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="space-y-3">
            {topArticles?.articles?.map((article, idx) => (
              <div
                key={idx}
                className="border border-gray-200 dark:border-gray-700 rounded p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {article.category}
                    </p>
                  </div>
                  <span className="ml-2 font-bold text-blue-600 dark:text-blue-400">
                    {article.total_views}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-cyan-600 dark:text-cyan-400">
                    Auth: {article.auth_views}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">
                    Anon: {article.anon_views}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {categories?.categories?.map((cat, idx) => (
              <div
                key={idx}
                className="border border-gray-200 dark:border-gray-700 rounded p-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {cat.category_name}
                  </span>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Views</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {cat.total_views}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Articles</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {cat.articles_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Avg/Article
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {cat.avg_views_per_article}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Views by Hour (Today)
        </h3>
        <div className="flex items-end gap-2 h-48">
          {chartData?.views_by_hour?.map((hour, idx) => {
            const maxViews = Math.max(
              ...chartData.views_by_hour.map((h) => h.views),
            );
            const percentage = (hour.views / maxViews) * 100 || 0;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                  style={{ height: `${percentage}%` }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {hour.hour}h
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day of Week Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Average Views by Day of Week (Last 4 Weeks)
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {chartData?.views_by_day_of_week?.map((day, idx) => {
            const maxViews = Math.max(
              ...chartData.views_by_day_of_week.map((d) => d.avg_views),
            );
            const percentage = (day.avg_views / maxViews) * 100 || 0;
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded"
                  style={{ height: `${percentage * 2}px` }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {day.day_name.slice(0, 3)}
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {day.avg_views}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  };

  return (
    <div
      className={`${colorClasses[color]} rounded-lg p-6 border border-gray-200 dark:border-gray-700`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value ?? "—"}
          </p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  );
}
