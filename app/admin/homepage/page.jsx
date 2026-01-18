"use client";

import { useEffect, useState, useRef } from "react";
import { Flame, Star, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";

export default function HomepageManager() {
    const [articles, setArticles] = useState([]);
    const debounceRef = useRef(null);

    const fetchArticles = async () => {
        const res = await fetch("/api/admin/article-flags");
        const data = await res.json();
        setArticles(data);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const autoSave = (id, updatedArticle) => {
        // debounce to avoid API spam
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            await fetch(`/api/admin/article-flags/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedArticle),
            });

            toast.success("Homepage updated", {
                duration: 1500,
            });
        }, 500);
    };

    const updateArticle = (id, key, value) => {
        setArticles((prev) =>
            prev.map((a) => {
                if (a.id !== id) return a;

                const updated = {
                    ...a,
                    [key]: value,
                };

                autoSave(id, updated);
                return updated;
            })
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-gray-100">
                Homepage Articles
            </h1>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto bg-[#111827] rounded-xl">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-800 text-gray-400">
                        <tr>
                            <th className="p-3 text-left">Title</th>
                            <th className="text-center">Featured</th>
                            <th className="text-center">Order</th>
                            <th className="text-center">Trending</th>
                            <th className="text-center">Order</th>
                            <th className="text-center">Editor Pick</th>
                        </tr>
                    </thead>

                    <tbody>
                        {articles.map((a) => (
                            <tr
                                key={a.id}
                                className="border-b border-gray-800 hover:bg-[#0b0f19]"
                            >
                                <td className="p-3 text-gray-200">
                                    {a.title}
                                </td>

                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={!!a.is_featured}
                                        onChange={(e) =>
                                            updateArticle(
                                                a.id,
                                                "is_featured",
                                                e.target.checked
                                            )
                                        }
                                    />
                                </td>

                                <td className="text-center">
                                    <input
                                        type="number"
                                        value={a.featured_order || ""}
                                        onChange={(e) =>
                                            updateArticle(
                                                a.id,
                                                "featured_order",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-16 px-2 py-1 bg-[#0b0f19] border border-gray-700 rounded"
                                    />
                                </td>

                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={!!a.is_trending}
                                        onChange={(e) =>
                                            updateArticle(
                                                a.id,
                                                "is_trending",
                                                e.target.checked
                                            )
                                        }
                                    />
                                </td>

                                <td className="text-center">
                                    <input
                                        type="number"
                                        value={a.trending_order || ""}
                                        onChange={(e) =>
                                            updateArticle(
                                                a.id,
                                                "trending_order",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-16 px-2 py-1 bg-[#0b0f19] border border-gray-700 rounded"
                                    />
                                </td>

                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={!!a.is_editors_pick}
                                        onChange={(e) =>
                                            updateArticle(
                                                a.id,
                                                "is_editors_pick",
                                                e.target.checked
                                            )
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">
                {articles.map((a) => (
                    <div
                        key={a.id}
                        className="bg-[#111827] p-4 rounded-lg space-y-3"
                    >
                        <p className="font-medium text-gray-100">
                            {a.title}
                        </p>

                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1">
                                <Star size={14} />
                                Featured
                            </span>
                            <input
                                type="checkbox"
                                checked={!!a.is_featured}
                                onChange={(e) =>
                                    updateArticle(
                                        a.id,
                                        "is_featured",
                                        e.target.checked
                                    )
                                }
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1">
                                <TrendingUp size={14} />
                                Trending
                            </span>
                            <input
                                type="checkbox"
                                checked={!!a.is_trending}
                                onChange={(e) =>
                                    updateArticle(
                                        a.id,
                                        "is_trending",
                                        e.target.checked
                                    )
                                }
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1">
                                <Flame size={14} />
                                Editor Pick
                            </span>
                            <input
                                type="checkbox"
                                checked={!!a.is_editors_pick}
                                onChange={(e) =>
                                    updateArticle(
                                        a.id,
                                        "is_editors_pick",
                                        e.target.checked
                                    )
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
