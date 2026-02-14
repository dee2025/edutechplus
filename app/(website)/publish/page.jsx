"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/article/Editor"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />,
});

export default function PublishArticlePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    featured_image: "",
    category_ids: [],
    seo_title: "",
    seo_description: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchCategories();
    }
  }, [status, router]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/public/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!form.content.trim()) {
      toast.error("Article content is required");
      return;
    }

    if (form.category_ids.length === 0) {
      toast.error("Select at least one category");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/articles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to publish article");
        return;
      }

      toast.success("Article published successfully!");
      router.push(`/articles/${data.slug}`);
    } catch (err) {
      console.error("Publish error:", err);
      toast.error("Failed to publish article");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b0f19]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white dark:bg-[#0b0f19] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Publish Article
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your thoughts and insights with our community
        </p>
      </div>

      <form onSubmit={handlePublish} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter article title"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Subtitle
          </label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Optional subtitle"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Excerpt
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Brief summary of your article"
            rows="2"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Featured Image URL
          </label>
          <input
            type="url"
            value={form.featured_image}
            onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          {form.featured_image && (
            <img
              src={form.featured_image}
              alt="Preview"
              className="mt-3 h-40 w-full object-cover rounded-lg"
            />
          )}
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Categories * (select at least one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={form.category_ids.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({
                        ...form,
                        category_ids: [...form.category_ids, cat.id],
                      });
                    } else {
                      setForm({
                        ...form,
                        category_ids: form.category_ids.filter((id) => id !== cat.id),
                      });
                    }
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Content *
          </label>
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <Editor
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
            />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">SEO Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={form.seo_title}
                onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                placeholder="Leave empty to use article title"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-sm text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                SEO Description
              </label>
              <input
                type="text"
                value={form.seo_description}
                onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                placeholder="Leave empty to use article excerpt"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-sm text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold rounded-lg transition-colors"
          >
            {submitting ? "Publishing..." : "Publish Article"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
