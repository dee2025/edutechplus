import Image from "next/image";
import Link from "next/link";

export default function HeroFeatured({ articles }) {
    return (
        <section className="bg-[#0b0f19] py-10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Story */}
                <Link
                    href={articles[0].slug}
                    className="relative lg:col-span-2 lg:row-span-2 rounded-xl overflow-hidden group"
                >
                    <Image
                        src={articles[0].image}
                        alt={articles[0].title}
                        fill
                        priority
                        className="object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 p-6">
                        <span className="text-xs text-cyan-400 font-semibold">
                            {articles[0].category}
                        </span>
                        <h2 className="mt-2 text-2xl font-bold text-white">
                            {articles[0].title}
                        </h2>
                    </div>
                </Link>

                {/* Secondary */}
                {articles.slice(1, 5).map((a, i) => (
                    <Link
                        key={i}
                        href={a.slug}
                        className="relative h-48 rounded-xl overflow-hidden group"
                    >
                        <Image
                            src={a.image}
                            alt={a.title}
                            fill
                            className="object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/60" />
                        <div className="absolute bottom-0 p-4">
                            <span className="text-xs text-cyan-400">
                                {a.category}
                            </span>
                            <h3 className="text-sm font-semibold text-white line-clamp-2">
                                {a.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
