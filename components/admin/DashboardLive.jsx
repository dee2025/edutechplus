"use client";

import { CheckCircle, Eye, FileText, RefreshCcw } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  async function fetchMetrics() {
    try {
      const res = await fetch("/api/admin/metrics", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      if (isMounted.current) {
        setMetrics(data);
        setLoading(false);
      }
    } catch (e) {
      console.error("Metrics fetch error", e);
    }
  }

  useEffect(() => {
    isMounted.current = true;
    fetchMetrics();
    const id = setInterval(fetchMetrics, 10000); // poll every 10s
    return () => {
      isMounted.current = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#111827] text-gray-200 hover:opacity-90"
            onClick={fetchMetrics}
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <Link
            href="/admin/articles"
            className="px-3 py-1.5 rounded bg-cyan-400 text-black font-semibold"
          >
            Manage Articles
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Articles"
          value={metrics.total_articles.toLocaleString()}
          icon={FileText}
        />
        <StatsCard
          title="Published"
          value={metrics.published.toLocaleString()}
          icon={CheckCircle}
        />
        <StatsCard
          title="Total views"
          value={metrics.views_total.toLocaleString()}
          icon={Eye}
        />
        <StatsCard
          title="Views Today"
          value={metrics.views_today.toLocaleString()}
          icon={Eye}
        />
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#111827] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300">
            Top articles (7d)
          </h3>

          {loading ? (
            <p className="text-gray-400 mt-4">Loading top articles...</p>
          ) : metrics.top_articles.length ? (
            <ul className="mt-4 space-y-3">
              {metrics.top_articles.map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="text-sm text-gray-100 hover:underline"
                    >
                      {a.title}
                    </Link>
                    <div className="text-xs text-gray-400">
                      {a.views || 0} views
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/admin/articles/edit/${a.id}`}
                      className="text-xs text-cyan-300 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-4">No recently-viewed articles.</p>
          )}
        </div>

        <div className="bg-[#111827] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300">Traffic</h3>
          <div className="mt-3 text-gray-400 text-sm">
            <div>
              Today:{" "}
              <strong className="text-gray-100">
                {metrics.views_today.toLocaleString()}
              </strong>
            </div>
            <div>
              Last 7 days:{" "}
              <strong className="text-gray-100">
                {metrics.views_7d.toLocaleString()}
              </strong>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Unique logged-in users (7d):{" "}
              <strong className="text-gray-100">
                {metrics.unique_user_views_7d.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/admin/homepage"
              className="text-sm text-cyan-300 hover:underline"
            >
              Homepage settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
