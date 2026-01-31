"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function RecentReads({ max = 10 }) {
  const [items, setItems] = useState([]);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const res = await fetch(`/api/auth/reads?list=1&limit=${max}`, {
          credentials: "same-origin",
        });
        if (res.ok) {
          const json = await res.json();
          if (canceled) return;
          const list = (json.list || []).map((it) => ({
            slug: it.slug,
            title: it.title || "(untitled)",
            ts: it.created_at ? new Date(it.created_at).getTime() : Date.now(),
            featured_image: null,
          }));
          setItems(list.slice(0, max));
          setSynced(true);
          return;
        }
      } catch (e) {
        // fall back to localStorage
      }

      try {
        const raw = localStorage.getItem("recent_articles");
        const list = raw ? JSON.parse(raw) : [];
        if (!canceled) setItems(list.slice(0, max));
      } catch (e) {
        if (!canceled) setItems([]);
      }
    }
    load();
    return () => (canceled = true);
  }, [max]);
  async function handleClear() {
    try {
      // try to clear server-side if synced/authenticated
      if (synced) {
        try {
          const res = await fetch(`/api/auth/reads`, {
            method: "DELETE",
            credentials: "same-origin",
          });
          if (res.ok) {
            const json = await res.json();
            toast.success(`Cleared ${json.deleted || 0} reads`);
          }
        } catch (e) {
          // ignore server errors
        }
      }

      localStorage.removeItem("recent_articles");
      setItems([]);
    } catch (e) {
      // ignore
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-[#0b0f19] border border-gray-800 rounded p-4">
        <h3 className="text-sm font-semibold text-gray-100 mb-2">
          Recently read
        </h3>
        <p className="text-xs text-gray-400">No recently-read articles yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19] border border-gray-800 rounded p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-100">Recently read</h3>
          {synced && <span className="text-xs text-green-400">Synced</span>}
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-gray-200"
          aria-label="Clear recent reads (local)"
        >
          Clear
        </button>
      </div>

      <ul className="mt-3 space-y-3">
        {items.map((it) => (
          <li key={it.slug} className="flex items-center gap-3">
            <Link
              href={`/articles/${it.slug}`}
              className="flex items-center gap-3 w-full"
            >
              <div className="w-12 h-12 rounded-md overflow-hidden bg-[#111827] border border-gray-700 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.featured_image ? (
                  <img
                    src={it.featured_image}
                    alt={it.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="text-sm text-gray-100 truncate">{it.title}</div>
                <div className="text-xs text-gray-400">
                  {new Date(it.ts).toLocaleString()}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
