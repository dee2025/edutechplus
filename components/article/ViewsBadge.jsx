"use client";

import { useEffect, useState } from "react";

export default function ViewsBadge({ slug, initial = 0 }) {
  const [views, setViews] = useState(initial ?? 0);

  useEffect(() => {
    if (!slug) return;

    // Fetch the current article data to display latest view count
    // Do NOT POST from here to avoid duplicating the POST done by TrackViewClient
    fetch(`/api/public/articles/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.article && typeof data.article.views === "number") {
          setViews(data.article.views);
        }
      })
      .catch(() => {
        // ignore errors silently
      });
  }, [slug]);

  return <span className="text-gray-400">{views.toLocaleString()} views</span>;
}
