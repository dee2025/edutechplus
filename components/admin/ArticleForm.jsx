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
    category_ids: [], // ✅ MULTIPLE CATEGORIES (array)
    ...initialData,
  });

  const [slugEdited, setSlugEdited] = useState(false);
  const [readingTimeEdited, setReadingTimeEdited] = useState(
    Boolean(initialData.read_time),
  );

  // Flatten hierarchical categories for the dropdown
  const flattenCategories = (cats) => {
    let flat = [];
    cats.forEach((cat) => {
      flat.push({ id: cat.id, name: cat.name });
      if (cat.subcategories && cat.subcategories.length > 0) {
        flat = flat.concat(flattenCategories(cat.subcategories));
      }
    });
    return flat;
  };

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(flattenCategories(data)));
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#111827] p-6 rounded-xl">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#0b0f19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="Article title"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-[#0b0f19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="Short subtitle (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-2">Slug</label>
                <div className="flex gap-2">
                  <input
                    value={form.slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setForm({ ...form, slug: e.target.value });
                    }}
                    className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="article-slug"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (slugEdited) {
                        setSlugEdited(false);
                        setForm((prev) => ({
                          ...prev,
                          slug: slugify(prev.title || ""),
                        }));
                      } else {
                        setSlugEdited(true);
                      }
                    }}
                    className="px-3 py-2 bg-transparent border border-gray-700 rounded-lg text-sm text-gray-300"
                  >
                    {slugEdited ? "Auto" : "Edit"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from title; click to edit.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Canonical URL
                </label>
                <input
                  value={form.canonical_url}
                  onChange={(e) =>
                    setForm({ ...form, canonical_url: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="https://example.com/articles/slug"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-[#0b0f19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                placeholder="Short summary shown on listing pages"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#111827] p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-300">
            <FileText size={16} />
            Content
          </div>
          <Editor
            content={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
          />
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        <div className="bg-[#111827] p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Image size={16} />
              Featured Image
            </div>
            <div className="text-xs text-gray-500">Recommended 1200x675</div>
          </div>

          <div className="border border-gray-700 rounded-lg p-3 bg-[#0b0f19]">
            <input
              type="file"
              onChange={(e) => uploadImage(e.target.files[0])}
              className="w-full text-sm text-gray-300"
            />

            {form.featured_image && (
              <div className="mt-3 rounded overflow-hidden border border-gray-700">
                <img
                  src={form.featured_image}
                  alt="featured"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] p-5 rounded-xl">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Tag size={16} />
            Metadata
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Categories (Multi-select)
              </label>
              <select
                multiple
                value={form.category_ids || []}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => Number(option.value),
                  );
                  setForm({ ...form, category_ids: selected });
                }}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple categories
              </p>
              {form.category_ids && form.category_ids.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.category_ids.map((catId) => {
                    const cat = categories.find((c) => c.id === catId);
                    return (
                      <span
                        key={catId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-purple-900/40 text-purple-300 rounded"
                      >
                        {cat?.name}
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              category_ids: form.category_ids.filter(
                                (id) => id !== catId,
                              ),
                            })
                          }
                          className="ml-1 text-purple-200 hover:text-purple-100"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Tags</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-white"
                placeholder="comma separated"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Read time (mins)
              </label>
              <input
                type="number"
                min={1}
                value={form.read_time || ""}
                onChange={(e) => {
                  setReadingTimeEdited(true);
                  setForm({ ...form, read_time: Number(e.target.value) });
                }}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-white"
              />
            </div>

            {isSuperAdmin && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111827] p-5 rounded-xl">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Search size={16} />
            SEO
          </div>

          <div className="space-y-3">
            <input
              placeholder="SEO Title"
              value={form.seo_title}
              onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
              className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-white"
            />

            <textarea
              placeholder="SEO Description"
              value={form.seo_description}
              onChange={(e) =>
                setForm({ ...form, seo_description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              toast.success("Article saved");
              onSubmit(form);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-300 transition"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </aside>
    </div>
  );
}
