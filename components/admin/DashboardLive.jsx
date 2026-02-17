"use client";

import {
  CheckCircle,
  Eye,
  FileText,
  RefreshCcw,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import StatsCard from "./StatsCard";

export default function DashboardLive() {
  const [metrics, setMetrics] = useState({
    total_articles: 0,
    published: 0,
    categories: 0,
    views_today: 0,
    views_7d: 0,
    views_total: 0,
    unique_user_views_7d: 0,
    top_articles: [],
  });
  const [activeUsers, setActiveUsers] = useState({
    active_users: 0,
    unique_visitors: 0,
    logged_in_users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const isMounted = useRef(true);

  async function fetchMetrics() {
    try {
      const [metricsRes, activeRes] = await Promise.all([
        fetch("/api/admin/metrics", { credentials: "include" }),
        fetch("/api/admin/active-users", { credentials: "include" }),
      ]);

      if (!metricsRes.ok || !activeRes.ok)
        throw new Error("Failed to fetch data");

      const metricsData = await metricsRes.json();
      const activeData = await activeRes.json();

      if (isMounted.current) {
        setMetrics(metricsData);
        setActiveUsers(activeData);
        setLoading(false);
        setLastUpdated(new Date());
      }
    } catch (e) {
      // Silently fail
    }
  }

  useEffect(() => {
    isMounted.current = true;
    fetchMetrics();
    const id = setInterval(fetchMetrics, 10000);
    return () => {
      isMounted.current = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200 font-medium transition-all duration-200 hover:shadow-lg"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <Link
            href="/admin/articles/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/30"
          >
            <Zap size={16} />
            New Article
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Articles"
          value={metrics.total_articles.toLocaleString()}
          icon={FileText}
          trend={metrics.published}
        />
        <StatsCard
          title="Published"
          value={metrics.published.toLocaleString()}
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Total Views"
          value={metrics.views_total.toLocaleString()}
          icon={Eye}
          color="blue"
        />
        <StatsCard
          title="Views Today"
          value={metrics.views_today.toLocaleString()}
          icon={TrendingUp}
          color="violet"
        />
        <StatsCard
          title="Active Now"
          value={activeUsers.active_users.toLocaleString()}
          icon={Users}
          color="rose"
          highlight={true}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Articles */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm p-6 hover:border-gray-600/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Top Articles</h2>
              <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
            </div>
            <Link
              href="/admin/articles"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-700/30 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : metrics.top_articles.length ? (
            <ul className="space-y-3">
              {metrics.top_articles.map((article, idx) => (
                <li
                  key={article.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-700/20 hover:bg-gray-700/40 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${article.author_username || article.category_slug}/${article.slug}`}
                      className="text-sm font-medium text-gray-100 hover:text-cyan-300 transition-colors truncate"
                    >
                      {article.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <Eye size={12} />
                      {article.views || 0} views
                    </div>
                  </div>
                  <Link
                    href={`/admin/articles/edit/${article.id}`}
                    className="text-xs px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-400">No articles yet</p>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div className="space-y-4">
          {/* Traffic Card */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm p-6 hover:border-gray-600/50 transition-all duration-300">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Eye size={16} className="text-cyan-400" />
              Traffic Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg">
                <span className="text-xs text-gray-400">Today</span>
                <span className="text-sm font-bold text-white">
                  {metrics.views_today.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-700/20 rounded-lg">
                <span className="text-xs text-gray-400">7 Days</span>
                <span className="text-sm font-bold text-white">
                  {metrics.views_7d.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-sm font-bold text-emerald-400">
                  {metrics.views_total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Active Users Card */}
          <div className="rounded-2xl bg-gradient-to-br from-rose-900/30 to-rose-950/30 border border-rose-500/20 backdrop-blur-sm p-6 hover:border-rose-500/40 transition-all duration-300">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Users size={16} className="text-rose-400 animate-pulse" />
              Live Users
            </h3>
            <div className="space-y-3">
              <div className="text-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <p className="text-2xl font-bold text-rose-400">
                  {activeUsers.active_users}
                </p>
                <p className="text-xs text-gray-400 mt-1">active now</p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-gray-700/20 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Visitors</p>
                  <p className="text-sm font-bold text-white">
                    {activeUsers.unique_visitors}
                  </p>
                </div>
                <div className="flex-1 p-2 bg-gray-700/20 rounded-lg text-center">
                  <p className="text-xs text-gray-400">Users</p>
                  <p className="text-sm font-bold text-white">
                    {activeUsers.logged_in_users}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Settings size={16} className="text-cyan-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/categories"
                className="block text-xs font-medium text-cyan-400 hover:text-cyan-300 p-2 rounded hover:bg-gray-700/30 transition-all"
              >
                Manage Categories
              </Link>
              <Link
                href="/admin/subscribers"
                className="block text-xs font-medium text-cyan-400 hover:text-cyan-300 p-2 rounded hover:bg-gray-700/30 transition-all"
              >
                View Subscribers
              </Link>
              <Link
                href="/admin/newsletter"
                className="block text-xs font-medium text-cyan-400 hover:text-cyan-300 p-2 rounded hover:bg-gray-700/30 transition-all"
              >
                Send Newsletter
              </Link>
              <Link
                href="/admin/analytics"
                className="block text-xs font-medium text-cyan-400 hover:text-cyan-300 p-2 rounded hover:bg-gray-700/30 transition-all"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
