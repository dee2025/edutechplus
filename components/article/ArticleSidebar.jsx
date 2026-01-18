import Link from 'next/link';

export default function ArticleSidebar({ trending }) {
    return (
        <div className="sticky top-24 space-y-6">

            {/* Trending */}
            <div className="bg-[#111827] rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-200 mb-4">
                    Trending
                </h3>

                <ul className="space-y-3">
                    {trending.map(item => (
                        <li key={item.id}>
                            <Link
                                href={`/articles/${item.slug}`}
                                className="text-sm text-gray-400 hover:text-cyan-400 leading-snug"
                            >
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Ad */}
            <div className="bg-[#111827] rounded-xl p-5 border border-dashed border-gray-700 text-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                    Advertisement
                </span>
                <div className="mt-4 h-64 flex items-center justify-center text-gray-600">
                    300 × 250 Ad
                </div>
            </div>
        </div>
    );
}
