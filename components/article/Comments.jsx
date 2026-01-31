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
        className="flex gap-3 items-start transition-shadow duration-150 hover:shadow-md rounded"
        key={c.id}
      >
        <div
          className={`${depth === 0 ? "w-10 h-10" : "w-8 h-8"} rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-200 shrink-0`}
        >
          {c.user_name?.slice(0, 1) || "U"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-100 font-medium">
              {c.user_name}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(c.created_at).toLocaleString()}
            </div>
          </div>

          <div className="mt-2 text-gray-200 whitespace-pre-wrap">
            {editingId === c.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded text-gray-200"
                />
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-xs text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onSaveEdit(c.id)}
                    className="px-3 py-1 bg-cyan-400 text-black rounded text-xs font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div
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

          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => {
                if (!user) return setShowAuth(true);
                setReplyingId(replyingId === c.id ? null : c.id);
                setLocalReply("");
              }}
              className="text-xs text-cyan-300"
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
                  className="text-xs text-cyan-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="text-xs text-red-400"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {replyingId === c.id && (
            <div className="mt-3 transition-all duration-200 ease-in-out">
              <textarea
                ref={replyRef}
                value={localReply}
                onChange={(e) => setLocalReply(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded text-gray-200"
                placeholder="Write a reply..."
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={() => setReplyingId(null)}
                  className="px-3 py-1 text-xs text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onPostReply(c.id, localReply);
                    setLocalReply("");
                  }}
                  className="px-3 py-1 bg-cyan-400 text-black rounded text-xs font-semibold"
                >
                  Post reply
                </button>
              </div>
            </div>
          )}

          {c.children && c.children.length > 0 && (
            <ul className="mt-3 pl-6 border-l border-gray-800 space-y-3 transition-all duration-200 ease-in-out">
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
    <div className="bg-[#111827] rounded p-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200">Comments</h3>
        <div className="text-xs text-gray-400">
          {commentsRaw.length} comments
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading comments...</p>
      ) : (
        <ul className="space-y-4">
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

      <div className="mt-6">
        {user ? (
          <form onSubmit={postComment} className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded text-gray-200"
              placeholder="Write a thoughtful comment..."
            />
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-cyan-400 text-black rounded font-semibold">
                Post comment
              </button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-gray-300">
            <div>
              Please{" "}
              <button
                onClick={() => setShowAuth(true)}
                className="underline text-cyan-300"
              >
                log in
              </button>{" "}
              to comment.
            </div>
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
