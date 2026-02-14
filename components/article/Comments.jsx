"use client";

import AuthModal from "@/components/UserAuth/AuthModal";
import DOMPurify from "isomorphic-dompurify";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

export default function Comments({ slug }) {
  const [commentsRaw, setCommentsRaw] = useState([]);
  const [comments, setComments] = useState([]); // nested tree
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [replyingId, setReplyingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const saveEdit = useCallback(
    async (id) => {
      if (!editContent.trim()) return toast.error("Write something to update");
      try {
        const res = await fetch(`/api/public/articles/${slug}/comments/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent }),
        });
        const json = await res.json();
        if (!res.ok) return toast.error(json.message || "Failed to update");
        toast.success("Updated");
        setEditingId(null);
        setEditContent("");
        load();
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      }
    },
    [slug, editContent, load],
  );

  const deleteComment = useCallback(
    async (id) => {
      if (!confirm("Delete this comment?")) return;
      try {
        const res = await fetch(`/api/public/articles/${slug}/comments/${id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (!res.ok) return toast.error(json.message || "Failed to delete");
        toast.success("Deleted");
        load();
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      }
    },
    [slug, load],
  );

  function buildTree(rows) {
    const map = {};
    const roots = [];

    rows.forEach((r) => {
      map[r.id] = { ...r, children: [] };
    });

    rows.forEach((r) => {
      if (r.parent_id) {
        const parent = map[r.parent_id];
        if (parent) parent.children.push(map[r.id]);
        else roots.push(map[r.id]); // fallback
      } else {
        roots.push(map[r.id]);
      }
    });

    // Optionally sort children by created_at
    function sortRec(list) {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      list.forEach((i) => i.children && sortRec(i.children));
    }
    sortRec(roots);

    return roots;
  }

  async function load() {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([
        fetch(`/api/public/articles/${slug}/comments`),
        fetch("/api/auth/me"),
      ]);

      if (cRes.ok) {
        const rows = await cRes.json();
        setCommentsRaw(rows);
        setComments(buildTree(rows));
      }
      if (uRes.ok) setUser(await uRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function postComment(e) {
    e.preventDefault();
    if (!content.trim()) return toast.error("Write a comment");

    try {
      const res = await fetch(`/api/public/articles/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) return toast.error(json.message || "Failed to post");
      toast.success("Comment posted");
      setContent("");
      load();
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  }

  const postReply = useCallback(
    async (parentId, content) => {
      if (!content || !content.trim()) return toast.error("Write a reply");
      try {
        const res = await fetch(`/api/public/articles/${slug}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, parent_id: parentId }),
        });
        const json = await res.json();
        if (!res.ok) return toast.error(json.message || "Failed to post reply");
        toast.success("Reply posted");
        setReplyingId(null);
        load();
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      }
    },
    [slug, load],
  );

  const CommentItem = memo(function CommentItem({
    c,
    depth = 0,
    user,
    replyingId,
    setReplyingId,
    onPostReply,
    onSaveEdit,
    onDelete,
    editingId,
    setEditingId,
    editContent,
    setEditContent,
    setShowAuth,
  }) {
    const [localReply, setLocalReply] = useState("");
    const replyRef = useRef(null);

    useEffect(() => {
      if (replyingId === c.id && replyRef.current) replyRef.current.focus();
    }, [replyingId, c.id]);

    return (
      <li
        className="flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all duration-150"
        key={c.id}
      >
        <div
          className={`${depth === 0 ? "w-12 h-12" : "w-10 h-10"} rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center text-white font-bold ${depth === 0 ? "text-base" : "text-sm"} shrink-0 shadow-md`}
        >
          {c.user_name?.slice(0, 1).toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {c.user_name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(c.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="mt-3 text-gray-800 dark:text-gray-200 leading-relaxed">
            {editingId === c.id ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0b0f19] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onSaveEdit(c.id)}
                    className="px-4 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html:
                    DOMPurify && typeof DOMPurify.sanitize === "function"
                      ? DOMPurify.sanitize(c.content || "", {
                          USE_PROFILES: { html: true },
                        })
                      : c.content,
                }}
              />
            )}
          </div>

          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => {
                if (!user) return setShowAuth(true);
                setReplyingId(replyingId === c.id ? null : c.id);
                setLocalReply("");
              }}
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              Reply
            </button>

            {user && user.id === c.user_id && (
              <>
                <button
                  onClick={() => {
                    if (!user) return setShowAuth(true);
                    setEditingId(editingId === c.id ? null : c.id);
                    setEditContent(c.content);
                  }}
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {replyingId === c.id && (
            <div className="mt-4 transition-all duration-200 ease-in-out space-y-3">
              <textarea
                ref={replyRef}
                value={localReply}
                onChange={(e) => setLocalReply(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-[#0b0f19] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all"
                placeholder="Write a reply..."
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={() => setReplyingId(null)}
                  className="px-3 py-1 text-xs text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onPostReply(c.id, localReply);
                    setLocalReply("");
                  }}
                  className="px-3 py-1 bg-cyan-500 dark:bg-cyan-400 text-white dark:text-black rounded text-xs font-semibold"
                >
                  Post reply
                </button>
              </div>
            </div>
          )}

          {c.children && c.children.length > 0 && (
            <ul className="mt-3 pl-6 border-l border-gray-300 dark:border-gray-800 space-y-3 transition-all duration-200 ease-in-out">
              {c.children.map((child) => (
                <CommentItem
                  key={child.id}
                  c={child}
                  depth={depth + 1}
                  user={user}
                  replyingId={replyingId}
                  setReplyingId={setReplyingId}
                  onPostReply={onPostReply}
                  onSaveEdit={onSaveEdit}
                  onDelete={onDelete}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  setShowAuth={setShowAuth}
                />
              ))}
            </ul>
          )}
        </div>
      </li>
    );
  });

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Comments
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {commentsRaw.length}{" "}
          {commentsRaw.length === 1 ? "comment" : "comments"}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              c={c}
              depth={0}
              user={user}
              replyingId={replyingId}
              setReplyingId={setReplyingId}
              onPostReply={postReply}
              onSaveEdit={saveEdit}
              onDelete={deleteComment}
              editingId={editingId}
              setEditingId={setEditingId}
              editContent={editContent}
              setEditContent={setEditContent}
              setShowAuth={setShowAuth}
            />
          ))}
        </ul>
      )}

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        {user ? (
          <form onSubmit={postComment} className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Add a comment
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-[#0b0f19] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
              placeholder="Share your thoughts..."
            />
            <div className="flex justify-end">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 text-white dark:text-gray-900 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Join the conversation
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex px-6 py-2 bg-cyan-600 dark:bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-colors"
            >
              Log in to comment
            </button>
          </div>
        )}
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => {
            setShowAuth(false);
            load();
          }}
          onSuccess={() => {
            setShowAuth(false);
            load();
          }}
        />
      )}
    </div>
  );
}
