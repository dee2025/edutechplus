"use client";

import TagInput from "@/components/article/TagInput";
import { Upload, X } from "lucide-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const Editor = dynamic(() => import("@/components/article/Editor"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
  ),
});

export default function PublishArticlePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    featured_image: "",
    seo_title: "",
    seo_description: "",
    tags: [],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  async function handleImageUpload(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    toast.loading("Uploading image...", { id: "upload" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/articles/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setForm((prev) => ({ ...prev, featured_image: data.url }));
      toast.success("Image uploaded successfully!", { id: "upload" });
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Image upload failed", { id: "upload" });
    } finally {
      setUploading(false);
    }
  }

  async function handlePublish(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (form.title.trim().length > 255) {
      toast.error("Title must be 255 characters or less");
      return;
    }

    if (!form.content.trim()) {
      toast.error("Article content is required");
      return;
    }

    if (form.subtitle && form.subtitle.trim().length > 255) {
      toast.error("Subtitle must be 255 characters or less");
      return;
    }

    if (form.seo_title && form.seo_title.trim().length > 255) {
      toast.error("SEO title must be 255 characters or less");
      return;
    }

    if (form.seo_description && form.seo_description.trim().length > 320) {
      toast.error("SEO description must be 320 characters or less");
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
            maxLength={255}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {form.title.length}/255
          </p>
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
            maxLength={255}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {form.subtitle.length}/255
          </p>
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
            Featured Image
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {!form.featured_image ? (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Click to upload
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <img
                  src={form.featured_image}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured_image: "" })}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                  Remove Image
                </button>
              </div>
            )}
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

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Tags (up to 5)
          </label>
          <TagInput
            value={form.tags}
            onChange={(tags) => setForm({ ...form, tags })}
            max={5}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Add relevant tags to help readers discover your article
          </p>
        </div>

        {/* SEO */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
            SEO Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                value={form.seo_title}
                onChange={(e) =>
                  setForm({ ...form, seo_title: e.target.value })
                }
                placeholder="Leave empty to use article title"
                maxLength={255}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-sm text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 text-right">
                {form.seo_title.length}/255
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                SEO Description
              </label>
              <textarea
                value={form.seo_description}
                onChange={(e) =>
                  setForm({ ...form, seo_description: e.target.value })
                }
                placeholder="Leave empty to use article excerpt (recommended: 150-160 chars)"
                maxLength={320}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded text-sm text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 text-right">
                {form.seo_description.length}/320{" "}
                {form.seo_description.length > 160 && "(optimal: 150-160)"}
              </p>
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
