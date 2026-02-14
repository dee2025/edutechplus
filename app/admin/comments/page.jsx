"use client";

import {
  CheckCircle,
  MessageCircle,
  RefreshCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, approved, pending, rejected
  const [deleting, setDeleting] = useState(null);
  const isMounted = useRef(true);

  async function fetchComments() {
    try {
      const res = await fetch("/api/admin/comments", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      if (isMounted.current) {
        setComments(data || []);
        setLoading(false);
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    }
  }

  useEffect(() => {
    isMounted.current = true;
    fetchComments();
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function handleApprove(id) {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: 1 }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_approved: 1 } : c)),
        );
      }
    } catch (e) {
      console.error("Error approving comment:", e);
    }
  }

  async function handleReject(id) {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: 0 }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_approved: 0 } : c)),
        );
      }
    } catch (e) {
      console.error("Error rejecting comment:", e);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error("Error deleting comment:", e);
    } finally {
      setDeleting(null);
    }
  }

  const filteredComments = comments
    .filter((comment) => {
      if (filter === "approved") return comment.is_approved === 1;
      if (filter === "pending") return comment.is_approved === 0;
      if (filter === "deleted") return comment.is_deleted === 1;
      return !comment.is_deleted;
    })
    .filter((comment) => {
      const searchLower = search.toLowerCase();
      return (
        comment.content.toLowerCase().includes(searchLower) ||
        comment.user_name.toLowerCase().includes(searchLower) ||
        comment.article_title.toLowerCase().includes(searchLower)
      );
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
            Comments Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Total: {comments.length} | Showing: {filteredComments.length}
          </p>
        </div>
        <button
          onClick={fetchComments}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200 font-medium transition-all duration-200 hover:shadow-lg"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search comments, users, or articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All", color: "cyan" },
            { value: "approved", label: "Approved", color: "emerald" },
            { value: "pending", label: "Pending", color: "amber" },
            { value: "deleted", label: "Deleted", color: "red" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === tab.value
                  ? `bg-${tab.color}-500/20 text-${tab.color}-300 ring-2 ring-${tab.color}-500/50`
                  : "bg-gray-700/30 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl animate-pulse border border-gray-700/50"
              />
            ))}
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50">
            <MessageCircle size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No comments found</p>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your filters or search
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm p-6 hover:border-gray-600/50 transition-all duration-300 group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-3">
                  {/* Header Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        {comment.user_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex gap-2">
                      {comment.is_deleted === 1 ? (
                        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium border border-red-500/30">
                          Deleted
                        </span>
                      ) : comment.is_approved === 1 ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                          Approved
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Article Link */}
                  <div className="text-sm">
                    <p className="text-gray-400">On article:</p>
                    <Link
                      href={`/admin/articles`}
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      {comment.article_title}
                    </Link>
                  </div>

                  {/* Comment Content */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                    <p className="text-sm text-gray-200 leading-relaxed line-clamp-3">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {comment.is_deleted !== 1 && (
                  <div className="lg:col-span-1 flex flex-col gap-2">
                    {comment.is_approved === 1 ? (
                      <>
                        <button
                          onClick={() => handleReject(comment.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 font-medium transition-all text-sm border border-amber-500/20"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-medium transition-all text-sm border border-emerald-500/20"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleting === comment.id}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium transition-all text-sm border border-red-500/20 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deleting === comment.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-500/20 p-4">
          <p className="text-xs text-emerald-400 font-medium">Approved</p>
          <p className="text-2xl font-bold text-emerald-300 mt-2">
            {
              comments.filter((c) => c.is_approved === 1 && c.is_deleted !== 1)
                .length
            }
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-950/30 border border-amber-500/20 p-4">
          <p className="text-xs text-amber-400 font-medium">Pending</p>
          <p className="text-2xl font-bold text-amber-300 mt-2">
            {
              comments.filter((c) => c.is_approved === 0 && c.is_deleted !== 1)
                .length
            }
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-red-900/30 to-red-950/30 border border-red-500/20 p-4">
          <p className="text-xs text-red-400 font-medium">Deleted</p>
          <p className="text-2xl font-bold text-red-300 mt-2">
            {comments.filter((c) => c.is_deleted === 1).length}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-cyan-900/30 to-cyan-950/30 border border-cyan-500/20 p-4">
          <p className="text-xs text-cyan-400 font-medium">Total</p>
          <p className="text-2xl font-bold text-cyan-300 mt-2">
            {comments.length}
          </p>
        </div>
      </div>
    </div>
  );
}
