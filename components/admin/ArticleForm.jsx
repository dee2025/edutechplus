"use client";

import { useEffect, useState } from "react";

export default function ArticleForm({
  initialData = {},
  onSubmit,
  isSuperAdmin,
}) {
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    seo_title: "",
    seo_description: "",
    read_time: "",
    status: "draft",
    category_id: "", // ✅ single category
    ...initialData,
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    setForm((prev) => ({ ...prev, featured_image: json.url }));
  };

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
      />

      {/* SLUG */}
      <input
        placeholder="Slug"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
      />

      {/* FEATURED IMAGE */}
      <input
        type="file"
        onChange={(e) => uploadImage(e.target.files[0])}
        className="text-sm"
      />

      {form.featured_image && (
        <img src={form.featured_image} className="w-64 rounded border" />
      )}

      {/* EXCERPT */}
      <textarea
        placeholder="Excerpt"
        value={form.excerpt}
        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
      />

      {/* CONTENT */}
      <textarea
        placeholder="Content"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        rows={12}
        className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
      />

      {/* <Editor
              value={form.content}
              onChange={(newValue) =>
                setForm({ ...form, content: newValue })
              }
            /> */}

      {/* CATEGORY (SINGLE SELECT) */}
      <div>
        <p className="font-semibold mb-2">Category</p>
        <select
          value={form.category_id}
          onChange={(e) =>
            setForm({
              ...form,
              category_id: Number(e.target.value),
            })
          }
          className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* STATUS */}
      {isSuperAdmin && (
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      )}

      {/* SEO */}
      <input
        placeholder="SEO Title"
        value={form.seo_title}
        onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
        className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
      />

      <textarea
        placeholder="SEO Description"
        value={form.seo_description}
        onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
        className="w-full px-4 py-2 bg-[#0b0f19] border border-gray-700 rounded"
      />

      {/* SUBMIT */}
      <button
        onClick={() => onSubmit(form)}
        className="px-8 py-2 bg-cyan-400 text-black rounded font-semibold"
      >
        Save Article
      </button>
    </div>
  );
}
