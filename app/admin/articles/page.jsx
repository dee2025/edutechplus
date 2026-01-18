"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchArticles = async () => {
        const res = await fetch("/api/admin/articles");
        const data = await res.json();
        setArticles(data);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async (article) => {
        toast((t) => (
            <div className="space-y-3">
                <p className="text-sm">
                    Delete <b>{article.title}</b>?  
                    This action cannot be undone.
                </p>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 text-sm bg-gray-700 rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            setLoading(true);

                            const res = await fetch(
                                `/api/admin/articles/${article.id}`,
                                { method: "DELETE" }
                            );

                            setLoading(false);

                            if (!res.ok) {
                                toast.error("Failed to delete article");
                                return;
                            }

                            setArticles((prev) =>
                                prev.filter((a) => a.id !== article.id)
                            );

                            toast.success("Article deleted");
                        }}
                        className="px-3 py-1 text-sm bg-red-500 text-black rounded"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ));
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Articles</h1>

                <Link
                    href="/admin/articles/create"
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded font-semibold"
                >
                    <Plus size={16} />
                    New Article
                </Link>
            </div>

            {/* TABLE */}
            <div className="bg-[#111827] rounded-xl p-6 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                            <th className="text-left py-3">Title</th>
                            <th className="text-center">Slug</th>
                            <th className="text-center">Category</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Author</th>
                            <th className="text-center">Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {articles.map((a) => (
                            <tr
                                key={a.id}
                                className="border-b border-gray-800 hover:bg-[#0b0f19]"
                            >
                                <td className="py-3">{a.title}</td>

                                <td className="py-3 text-center text-gray-400">
                                    {a.slug}
                                </td>

                                <td className="py-3 text-center">
                                    {a.category_name || "-"}
                                </td>

                                <td className="py-3 text-center">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${
                                            a.status === "published"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                        }`}
                                    >
                                        {a.status}
                                    </span>
                                </td>

                                <td className="py-3 text-center">
                                    {a.author_name}
                                </td>

                                <td className="py-3 text-center text-gray-400">
                                    {new Date(a.created_at).toLocaleDateString()}
                                </td>

                                <td className="py-3 text-right flex justify-end gap-3">
                                    <Link
                                        href={`/admin/articles/edit/${a.id}`}
                                        className="text-cyan-400 hover:text-cyan-300"
                                    >
                                        <Pencil size={16} />
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(a)}
                                        disabled={loading}
                                        className="text-red-400 hover:text-red-300 disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!articles.length && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No articles found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
