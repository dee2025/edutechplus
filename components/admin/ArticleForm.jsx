"use client";

import slugify from "@/lib/slugify";
import { FileText, Image, Save, Search, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Editor from "./ui/Editor";

export default function ArticleForm({
  initialData = {},
  onSubmit,
  isSuperAdmin,
}) {
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    canonical_url: "",
    tags: "",
    content_format: "html",
    excerpt: "",
    content: "",
    featured_image: "",
    seo_title: "",
    seo_description: "",
    read_time: "",
    status: "draft",
    category_id: "",
    ...initialData,
  });

  const [slugEdited, setSlugEdited] = useState(false);
  const [readingTimeEdited, setReadingTimeEdited] = useState(
    Boolean(initialData.read_time),
  );

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  // Auto-generate slug from title unless user edited it
  useEffect(() => {
    if (!slugEdited) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.title || "") }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, slugEdited]);

  // If initial data contains slug or read_time, mark flags appropriately
  useEffect(() => {
    if (initialData?.slug) setSlugEdited(true);
    if (initialData?.read_time) setReadingTimeEdited(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  function estimateReadTime(html) {
    if (!html) return 1;
    const text = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = text ? text.split(/\s+/).length : 0;
    return Math.max(1, Math.round(words / 200));
  }

  // Auto-calc reading time when content changes, unless user manually edited it
  useEffect(() => {
    if (!readingTimeEdited) {
      const minutes = estimateReadTime(form.content);
      setForm((prev) => ({ ...prev, read_time: minutes }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.content]);

  const uploadImage = async (file) => {
    if (!file) return;

    toast.loading("Uploading image...", { id: "upload" });

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      setForm((prev) => ({ ...prev, featured_image: json.url }));
      toast.success("Image uploaded", { id: "upload" });
    } catch {
      toast.error("Upload failed", { id: "upload" });
    }
  };

  return (
    <div className="space-y-4">
      {/* TITLE + SLUG */}
      <div className="bg-[#111827] p-4 rounded-lg space-y-3">
        <div>
          <label className="text-xs text-gray-400">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400">Subtitle</label>
          <input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400">Slug</label>
          <div className="flex gap-2">
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setForm({ ...form, slug: e.target.value });
              }}
              className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
            />

            <button
              type="button"
              onClick={() => {
                if (slugEdited) {
                  // lock it back: regenerate from title
                  setSlugEdited(false);
                  setForm((prev) => ({
                    ...prev,
                    slug: slugify(prev.title || ""),
                  }));
                } else {
                  // allow editing
                  setSlugEdited(true);
                }
              }}
              className="mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded text-xs"
            >
              {slugEdited ? "Auto" : "Edit"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Slug is auto-generated from title. Click "Edit" to modify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Canonical URL</label>
            <input
              value={form.canonical_url}
              onChange={(e) =>
                setForm({ ...form, canonical_url: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
              placeholder="https://example.com/articles/your-slug"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400">Tags</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
              placeholder="comma separated tags"
            />

            {form.tags && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.tags.split(",").map((t) => {
                  const tag = t.trim();
                  if (!tag) return null;
                  return (
                    <span
                      key={tag}
                      className="text-xs bg-gray-800 text-gray-200 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Content format</label>
            <select
              value={form.content_format}
              onChange={(e) =>
                setForm({ ...form, content_format: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
            >
              <option value="html">HTML (rich editor)</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400">Read time (minutes)</label>
            <input
              type="number"
              min={1}
              value={form.read_time || ""}
              onChange={(e) => {
                setReadingTimeEdited(true);
                setForm({ ...form, read_time: Number(e.target.value) });
              }}
              className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
            />
            <p className="text-xs text-gray-400 mt-1">
              Automatically estimated from content. Edit to override.
            </p>
          </div>
        </div>
      </div>

      {/* FEATURED IMAGE + CATEGORY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111827] p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Image size={16} />
            Featured Image
          </div>

          <input
            type="file"
            onChange={(e) => uploadImage(e.target.files[0])}
            className="text-xs"
          />

          {form.featured_image && (
            <img
              src={form.featured_image}
              className="w-full max-w-xs rounded border border-gray-700"
            />
          )}
        </div>

        <div className="bg-[#111827] p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag size={16} />
            Category
          </div>

          <select
            value={form.category_id}
            onChange={(e) =>
              setForm({
                ...form,
                category_id: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {isSuperAdmin && (
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          )}
        </div>
      </div>

      {/* EXCERPT */}
      <div className="bg-[#111827] p-4 rounded-lg">
        <label className="text-xs text-gray-400">Excerpt</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          rows={3}
          className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
        />
      </div>

      {/* CONTENT (PRIMARY FOCUS) */}
      <div className="bg-[#111827] p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <FileText size={16} />
          Content
        </div>

        <Editor
          content={form.content}
          onChange={(html) => setForm({ ...form, content: html })}
        />
      </div>

      {/* SEO (COMPACT) */}
      <div className="bg-[#111827] p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Search size={16} />
          SEO
        </div>

        <input
          placeholder="SEO Title"
          value={form.seo_title}
          onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
          className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
        />

        <textarea
          placeholder="SEO Description"
          value={form.seo_description}
          onChange={(e) =>
            setForm({
              ...form,
              seo_description: e.target.value,
            })
          }
          rows={2}
          className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
        />
      </div>

      {/* ACTION */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => {
            toast.success("Article saved");
            onSubmit(form);
          }}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-400 text-black rounded font-semibold"
        >
          <Save size={16} />
          Save
        </button>
      </div>
    </div>
  );
}
