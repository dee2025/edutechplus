import Image from "next/image";
import Link from "next/link";

export default function CategoryFeed({ articles, categoryName }) {
    if (!articles.length) {
        return (
            <p className="text-gray-400">
                No articles found in this category.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {articles.map((article) => (
                <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="flex flex-col md:flex-row gap-4 bg-[#111827] rounded-xl p-4 hover:bg-[#1f2937] transition"
                >
                    {article.featured_image && (
                        <Image
                            src={article.featured_image}
                            alt={article.title}
                            width={100}
                            height={10}
                            className="rounded-lg w-auto object-cover"
                        />
                    )}

                    <div>
                        <span className="text-xs font-semibold text-cyan-400">
                            {categoryName}
                        </span>

                        <h2 className="mt-2 text-lg font-bold text-gray-100 leading-snug">
                            {article.title}
                        </h2>

                        <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                            {article.excerpt}
                        </p>

                        <div className="mt-3 text-xs text-gray-500">
                            {new Date(article.published_at).toLocaleDateString()} ·{" "}
                            {article.read_time} min read
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
