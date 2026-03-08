"use client";

import { Activity, BarChart3, Clock, Eye, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function ViewsMonitor() {
  const [recentViews, setRecentViews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/recent");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setRecentViews(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching views:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchData();
    const interval = autoRefresh ? setInterval(fetchData, 10000) : null; // Refresh every 10 seconds
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchData, autoRefresh]);

  const handleManualRefresh = () => {
    setRefreshCount((c) => c + 1);
    fetchData();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6 bg-gray-50 dark:bg-[#0b0f19] min-h-screen">
      {/* Header with Controls */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Views Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time article view tracking
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              autoRefresh
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600"
            }`}
          >
            {autoRefresh ? "🔄 Auto-Refresh ON" : "⏸️ Auto-Refresh OFF"}
          </button>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      {lastRefresh && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Live monitoring active
            </span>
          </div>
          <span className="text-xs text-blue-600 dark:text-blue-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      )}

      {/* Today's Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={Eye}
          label="Views Today"
          value={recentViews?.today_activity?.total_views?.toLocaleString()}
          color="blue"
        />
        <MetricCard
          icon={BarChart3}
          label="Articles Viewed"
          value={recentViews?.today_activity?.articles_viewed}
          color="green"
        />
        <MetricCard
          icon={Activity}
          label="Authenticated Users"
          value={recentViews?.today_activity?.authenticated_users}
          color="purple"
        />
        <MetricCard
          icon={Clock}
          label="Unique IPs"
          value={recentViews?.today_activity?.unique_ips}
          color="orange"
        />
        {recentViews?.peak_hour && (
          <MetricCard
            icon={TrendingUp}
            label="Peak Hour"
            value={`${recentViews.peak_hour.hour}:00 (${recentViews.peak_hour.views} views)`}
            color="yellow"
          />
        )}
      </div>

      {/* Top Article in Last Hour */}
      {recentViews?.last_hour_top_article && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-cyan-500 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                🔥 Top Article (Last Hour)
              </h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {recentViews.last_hour_top_article.title}
              </p>
              <div className="mt-2 flex items-center gap-4">
                <span className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full text-sm font-semibold">
                  {recentViews.last_hour_top_article.views} views
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Views Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Views (Last 50)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-6 text-gray-700 dark:text-gray-300 font-semibold">
                  Article
                </th>
                <th className="text-left py-3 px-6 text-gray-700 dark:text-gray-300 font-semibold">
                  Category
                </th>
                <th className="text-left py-3 px-6 text-gray-700 dark:text-gray-300 font-semibold">
                  User Type
                </th>
                <th className="text-left py-3 px-6 text-gray-700 dark:text-gray-300 font-semibold">
                  IP/User ID
                </th>
                <th className="text-left py-3 px-6 text-gray-700 dark:text-gray-300 font-semibold">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentViews?.recent_views?.length > 0 ? (
                recentViews.recent_views.map((view, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  >
                    <td className="py-3 px-6">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {view.article_title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {view.article_slug}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-700 dark:text-gray-300">
                      {view.category_name || "—"}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          view.is_authenticated
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                        }`}
                      >
                        {view.is_authenticated ? "🔐 Auth" : "👤 Anon"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {view.user_id
                        ? `UID: ${view.user_id}`
                        : `IP: ${view.ip?.slice(0, 15)}...`}
                    </td>
                    <td className="py-3 px-6 text-gray-600 dark:text-gray-400">
                      {new Date(view.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-8 px-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No views recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Activity Summary
        </h2>
        <div className="space-y-3">
          {recentViews?.today_activity && (
            <>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <span className="text-gray-700 dark:text-gray-300">
                  First view today
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(
                    recentViews.today_activity.first_view,
                  ).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <span className="text-gray-700 dark:text-gray-300">
                  Last view today
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(
                    recentViews.today_activity.last_view,
                  ).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <span className="text-gray-700 dark:text-gray-300">
                  Views per hour (avg)
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(recentViews.today_activity.total_views / 24)}{" "}
                  views/hour
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Refresh Info */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {autoRefresh ? (
          <p>
            Auto-refreshing every 10 seconds... (Manual refreshes:{" "}
            {refreshCount})
          </p>
        ) : (
          <p>
            Auto-refresh disabled. Click &quot;Refresh&quot; to update manually.
          </p>
        )}
      </div>
    </main>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400",
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value ?? "—"}
          </p>
        </div>
        <Icon className="w-6 h-6 opacity-40" />
      </div>
    </div>
  );
}
