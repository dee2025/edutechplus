import Image from "next/image";
import Link from "next/link";

async function getTrendingArticles() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/home/trending`,
        { cache: "no-store" }
    );

    if (!res.ok) return [];
    return res.json();
}

export default async function LatestNews() {
    const articles = await getTrendingArticles();

    if (!articles.length) return null;

    return (
        <section className="bg-[#0b0f19] py-10">
            <div className="max-w-7xl mx-auto px-4">

                <h2 className="text-xl font-bold text-gray-100 mb-6">
                    Latest Updates
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/articles/${article.slug}`}
                            className="group rounded-xl overflow-hidden bg-[#111827] hover:bg-[#1f2937] transition"
                        >
                            {article.featured_image && (
                                <Image
                                    src={article.featured_image}
                                    alt={article.title}
                                    width={400}
                                    height={250}
                                    className="object-cover w-full h-44 group-hover:scale-105 transition duration-500"
                                />
                            )}

                            <div className="p-4">
                                <span className="text-xs text-cyan-400 font-semibold">
                                    {article.category_name}
                                </span>

                                <h3 className="mt-2 font-semibold text-gray-100 leading-snug">
                                    {article.title}
                                </h3>

                                <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                                    {article.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
}
