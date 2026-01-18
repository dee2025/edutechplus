import Link from "next/link";

export default function CategorySidebar({ trending }) {
    return (
        <aside className="sticky top-24 space-y-6">

            {/* Trending */}
            <div className="bg-[#111827] rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-200 mb-4">
                    Trending Now
                </h3>

                <ul className="space-y-3">
                    {trending.map((item) => (
                        <li key={item.id}>
                            <Link
                                href={`/articles/${item.slug}`}
                                className="block text-sm text-gray-400 hover:text-cyan-400 leading-snug"
                            >
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Ad */}
            <div className="bg-[#111827] rounded-xl p-5 text-center border border-dashed border-gray-700">
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                    Advertisement
                </span>
                <div className="mt-4 h-56 flex items-center justify-center text-gray-600">
                    Ad Space 300×250
                </div>
            </div>
        </aside>
    );
}
