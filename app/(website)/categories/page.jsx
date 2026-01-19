import Link from "next/link";

export const metadata = {
    title: "Categories | Tech & Startup Insights",
    description:
        "Browse all categories covering technology, AI, programming, startups, and digital products.",
};

async function getCategories() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/categories`,
        { cache: "no-store" }
    );

    if (!res.ok) return [];
    return res.json();
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="min-h-screen bg-[#020617] px-4 py-10 md:py-14">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                        Categories
                    </h1>
                    <p className="text-gray-400 max-w-2xl mt-2">
                        Explore articles by category — technology, AI,
                        programming, startups, and more.
                    </p>
                </div>

                {/* CATEGORY GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/${cat.slug}`}
                            className="bg-[#111827] rounded-xl p-5 hover:bg-[#0b0f19] transition"
                        >
                            <h2 className="text-lg font-semibold text-gray-100">
                                {cat.name}
                            </h2>

                            {cat.description && (
                                <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                                    {cat.description}
                                </p>
                            )}

                            <p className="text-sm text-cyan-400 mt-4">
                                View articles →
                            </p>
                        </Link>
                    ))}

                    {!categories.length && (
                        <p className="text-gray-500">
                            No categories available.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}
