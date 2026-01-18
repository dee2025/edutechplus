import Image from "next/image";
import Link from "next/link";

async function getHeroArticles() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/home/hero`,
        { cache: "no-store" }
    );

    if (!res.ok) return [];
    return res.json();
}

export default async function HeroNews() {
    const articles = await getHeroArticles();
    if (!articles.length) return null;

    const [main, ...secondary] = articles;

    return (
        <section className="bg-[#0b0f19] py-10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* MAIN HERO */}
                {main && (
                    <Link
                        href={`/articles/${main.slug}`}
                        className="relative lg:col-span-2 lg:row-span-2 rounded-xl overflow-hidden group min-h-[400px]"
                    >
                        <Image
                            src={main.featured_image}
                            alt={main.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-500"
                            priority
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        <div className="absolute bottom-0 p-6">
                            <span className="inline-block mb-3 text-xs font-semibold tracking-widest text-cyan-400">
                                {main.category_name}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug">
                                {main.title}
                            </h2>
                            <p className="mt-3 text-sm text-gray-300 line-clamp-2">
                                {main.excerpt}
                            </p>
                        </div>
                    </Link>
                )}

                {/* SECONDARY CARDS */}
                {secondary.map((item) => (
                    <Link
                        key={item.id}
                        href={`/articles/${item.slug}`}
                        className="relative rounded-xl overflow-hidden group h-48"
                    >
                        <Image
                            src={item.featured_image}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-500"
                        />

                        <div className="absolute inset-0 bg-black/50" />

                        <div className="absolute bottom-0 p-4">
                            <span className="text-xs font-semibold text-cyan-400">
                                {item.category_name}
                            </span>
                            <h3 className="mt-1 text-sm font-bold text-white leading-snug line-clamp-2">
                                {item.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
