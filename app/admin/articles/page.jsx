"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this article? This action cannot be undone."
        );

        if (!confirmed) return;

        setLoading(true);

        const res = await fetch(`/api/admin/articles/${id}`, {
            method: "DELETE",
        });

        setLoading(false);

        if (!res.ok) {
            alert("Failed to delete article");
            return;
        }

        // ✅ Remove from UI without refetch
        setArticles((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Articles</h1>

                <Link
                    href="/admin/articles/create"
                    className="px-4 py-2 bg-cyan-400 text-black rounded font-semibold"
                >
                    + New Article
                </Link>
            </div>

            <div className="bg-[#111827] rounded-xl p-6 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                            <th className="text-left py-2">Title</th>
                            <th>Slug</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Author</th>
                            <th>Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {articles.map((a) => (
                            <tr
                                key={a.id}
                                className="border-b border-gray-800 hover:bg-[#1f2937]"
                            >
                                <td className="py-2">{a.title}</td>

                                <td className="py-2 text-center">
                                    {a.slug}
                                </td>

                                <td className="py-2 text-center">
                                    {a.category_name || "-"}
                                </td>

                                <td className="text-center">
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

                                <td className="text-center">
                                    {a.author_name}
                                </td>

                                <td className="text-center">
                                    {new Date(a.created_at).toLocaleDateString()}
                                </td>

                                <td className="text-right space-x-4">
                                    <Link
                                        href={`/admin/articles/edit/${a.id}`}
                                        className="text-cyan-400 hover:underline"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(a.id)}
                                        disabled={loading}
                                        className="text-red-400 hover:underline disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!articles.length && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="text-center py-6 text-gray-500"
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
