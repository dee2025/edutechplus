"use client";

import { Eye } from "lucide-react";
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

  return (
    <div className="flex items-center gap-1">
      <Eye className="w-3 h-3" />
      <span>{views.toLocaleString()} views</span>
    </div>
  );
}
