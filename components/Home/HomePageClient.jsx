"use client";

import { useEffect, useState } from "react";
import HomeFeed from "./HomeFeed";
import LeftSidebar from "./LeftSidebar";
import RecentlyPublished from "./RecentlyPublished";
import RightSidebar from "./RightSidebar";
import TopContributors from "./TopContributors";

export default function HomePageClient({ filter = "latest" }) {
  const [latestArticles, setLatestArticles] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      try {
        const [latestRes, tagsRes, topRes, statsRes] = await Promise.all([
          fetch("/api/articles/latest?limit=20", { cache: "no-store" }),
          fetch("/api/tags/trending", { cache: "no-store" }),
          fetch("/api/articles/most-viewed?limit=5&days=7", {
            cache: "no-store",
          }),
          fetch("/api/stats/platform", { cache: "no-store" }),
        ]);

        if (!cancelled && latestRes.ok) {
          const latestData = await latestRes.json();
          setLatestArticles(latestData.articles || []);
        }

        if (!cancelled && tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTrendingTags(tagsData.tags || []);
        }

        if (!cancelled && topRes.ok) {
          const topData = await topRes.json();
          setTopArticles(topData.articles || []);
        }

        if (!cancelled && statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats || null);
        }
      } catch (error) {
        console.error("Failed to preload home data:", error);
      }
    }

    loadHomeData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex gap-6 mb-12">
          <LeftSidebar initialTags={trendingTags} />
          <HomeFeed filter={filter} initialArticles={latestArticles} />
          <RightSidebar
            initialTrendingTags={trendingTags}
            initialTopArticles={topArticles}
            initialStats={stats}
          />
        </div>

        <RecentlyPublished initialArticles={latestArticles.slice(0, 6)} />
        <TopContributors initialStats={stats} />
      </div>
    </div>
  );
}
