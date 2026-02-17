"use client";

import { Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // UI state
  const [showForm, setShowForm] = useState(false);

  // form state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#06B6D4");

  const fetchTags = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch("/api/admin/tags");
      const data = await res.json();

      if (Array.isArray(data)) {
        setTags(data);
      } else {
        console.error("Tags response is not an array:", data);
        setTags([]);
        toast.error("Failed to load tags");
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
      toast.error("Failed to load tags");
      setTags([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setColor("#06B6D4");
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error("Name and slug are required");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      slug,
      description,
      color,
    };

    try {
      if (editId) {
        const res = await fetch(`/api/admin/tags/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to update tag");
          return;
        }

        toast.success("Tag updated successfully");
      } else {
        const res = await fetch("/api/admin/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to create tag");
          return;
        }

        toast.success("Tag created successfully");
      }

      await fetchTags();
      resetForm();
    } catch (err) {
      console.error("Tag operation error:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tag) => {
    setEditId(tag.id);
    setName(tag.name);
    setSlug(tag.slug);
    setDescription(tag.description || "");
    setColor(tag.color || "#06B6D4");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (tag) => {
    toast((t) => (
      <div className="space-y-3">
        <p className="text-sm">
          Delete <b>{tag.name}</b>? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);

              const res = await fetch(`/api/admin/tags/${tag.id}`, {
                method: "DELETE",
              });

              const data = await res.json();

              if (!res.ok) {
                toast.error(data.message || "Failed to delete tag");
                return;
              }

              if (editId === tag.id) resetForm();
              fetchTags();
              toast.success("Tag deleted");
            }}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  // Auto-generate slug from name
  const handleNameChange = (value) => {
    setName(value);
    if (!editId) {
      const autoSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(autoSlug);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tags</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage tags for article categorization (users can add up to 5 tags
            per article)
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition"
        >
          <Plus size={18} />
          Add Tag
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-[#111827] p-8 rounded-xl border border-gray-700 relative">
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold mb-6 text-white">
            {editId ? "Edit Tag" : "Create New Tag"}
          </h2>

          <div className="space-y-5">
            {/* Row 1: Name and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tag Name *
                </label>
                <input
                  placeholder="e.g., JavaScript, React, TypeScript"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  placeholder="e.g., javascript, react, typescript"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            {/* Row 2: Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#06B6D4"
                  className="flex-1 px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                />
                <div
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    border: `1px solid ${color}50`,
                  }}
                >
                  Preview
                </div>
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="Add a brief description for this tag..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 bg-[#0b0f19] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : editId ? "Update Tag" : "Create Tag"}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2.5 bg-gray-700 text-gray-200 font-medium rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-[#111827] border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0b0f19] border-b border-gray-700">
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Tag
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Slug
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-300">
                  Description
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-300">
                  Usage
                </th>
                <th className="px-6 py-4 text-right font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-[#1a1f2e] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1 rounded-lg font-medium text-sm flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          border: `1px solid ${tag.color}50`,
                        }}
                      >
                        <Tag size={14} />
                        {tag.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{tag.slug}</td>
                  <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                    {tag.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-900/40 text-blue-300 rounded">
                      {tag.article_count || 0} articles
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="text-cyan-400 hover:text-cyan-300 transition"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="text-red-400 hover:text-red-300 transition"
                        disabled={tag.article_count > 0}
                        title={
                          tag.article_count > 0
                            ? "Cannot delete tag in use"
                            : "Delete tag"
                        }
                      >
                        <Trash2
                          size={18}
                          className={tag.article_count > 0 ? "opacity-30" : ""}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {tags.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400">No tags created yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition"
            >
              Create your first tag →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
