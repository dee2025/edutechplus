"use client";

import { useEffect, useState } from "react";

export default function page() {
    const [articles, setArticles] = useState([]);

    const fetchArticles = async () => {
        const res = await fetch("/api/admin/article-flags");
        const data = await res.json();
        setArticles(data);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const updateFlags = async (id, payload) => {
        await fetch(`/api/admin/article-flags/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        fetchArticles();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-100">
                Homepage Articles
            </h1>

            <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-800">
                    <thead className="bg-[#111827] text-gray-400">
                        <tr>
                            <th className="p-3 text-left">Title</th>
                            <th>Featured</th>
                            <th>Order</th>
                            <th>Trending</th>
                            <th>Order</th>
                            <th>Editor Pick</th>
                            <th>Save</th>
                        </tr>
                    </thead>

                    <tbody>
                        {articles.map((a) => (
                            <tr
                                key={a.id}
                                className="border-t border-gray-800"
                            >
                                <td className="p-3 text-gray-200">
                                    {a.title}
                                </td>

                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        defaultChecked={a.is_featured}
                                        onChange={(e) =>
                                            (a.is_featured =
                                                e.target.checked)
                                        }
                                    />
                                </td>

                                <td className="text-center">
                                    <input
                                        type="number"
                                        defaultValue={a.featured_order || ""}
                                        className="w-16 px-2 py-1 bg-[#0b0f19] border border-gray-700 rounded"
                                        onChange={(e) =>
                                            (a.featured_order =
                                                Number(e.target.value))
                                        }
                                    />
                                </td>

                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        defaultChecked={a.is_trending}
                                        onChange={(e) =>
                                            (a.is_trending =
                                                e.target.checked)
                                        }
                                    />
                                </td>

                                <td className="text-center">
                                    <input
                                        type="number"
                                        defaultValue={a.trending_order || ""}
                                        className="w-16 px-2 py-1 bg-[#0b0f19] border border-gray-700 rounded"
                                        onChange={(e) =>
                                            (a.trending_order =
                                                Number(e.target.value))
                                        }
                                    />
                                </td>

                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        defaultChecked={a.is_editors_pick}
                                        onChange={(e) =>
                                            (a.is_editors_pick =
                                                e.target.checked)
                                        }
                                    />
                                </td>

                                <td className="text-center">
                                    <button
                                        onClick={() =>
                                            updateFlags(a.id, a)
                                        }
                                        className="px-3 py-1 bg-cyan-400 text-black rounded"
                                    >
                                        Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
