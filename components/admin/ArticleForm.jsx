"use client";

import { useEffect, useState } from "react";
import { Image, FileText, Tag, Search, Save } from "lucide-react";
import { toast } from "react-hot-toast";

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
        category_id: "",
        ...initialData,
    });

    useEffect(() => {
        fetch("/api/admin/categories")
            .then((res) => res.json())
            .then(setCategories);
    }, []);

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
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400">Slug</label>
                    <input
                        value={form.slug}
                        onChange={(e) =>
                            setForm({ ...form, slug: e.target.value })
                        }
                        className="w-full mt-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
                    />
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
                    onChange={(e) =>
                        setForm({ ...form, excerpt: e.target.value })
                    }
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

                <textarea
                    value={form.content}
                    onChange={(e) =>
                        setForm({ ...form, content: e.target.value })
                    }
                    rows={10}
                    className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded"
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
                    onChange={(e) =>
                        setForm({ ...form, seo_title: e.target.value })
                    }
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
