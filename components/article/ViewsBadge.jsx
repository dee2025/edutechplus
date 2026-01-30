"use client";

import { useEffect, useState } from "react";

export default function ViewsBadge({ slug, initial = 0 }) {
  const [views, setViews] = useState(initial ?? 0);

  useEffect(() => {
    if (!slug) return;

    const key = `viewed_article_${slug}`;
    const ttl = 1000 * 60 * 60 * 24; // 24 hours
    const viewed = typeof window !== "undefined" && localStorage.getItem(key);
    const now = Date.now();

    if (viewed && now - parseInt(viewed, 10) < ttl) {
      return; // already counted recently
    }

    // POST a view event
    fetch(`/api/public/articles/${slug}/view`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.views === "number") {
          setViews(data.views);
        }
        try {
          localStorage.setItem(key, String(now));
        } catch (e) {
          // ignore
        }
      })
      .catch(() => {
        // ignore errors silently
      });
  }, [slug]);

  return <span className="text-gray-400">{views.toLocaleString()} views</span>;
}
