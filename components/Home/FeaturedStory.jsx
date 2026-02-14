import Image from "next/image";
import Link from "next/link";

async function getFeaturedStory() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const url = `${base}/api/public/home/featured`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.warn("getFeaturedStory fetch failed", e);
    return null;
  }
}

export default async function FeaturedStory() {
  const article = await getFeaturedStory();
  if (!article) return null;

  const articleUrl = `/${article.category_slug}/${article.slug}`;

  return (
    <section className="bg-gray-50 dark:bg-[#111827] py-14">
      <div className="w-full md:max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Image */}
        {article.featured_image && (
          <Image
            src={article.featured_image}
            alt={article.title}
            width={600}
            height={400}
            className="rounded-xl object-cover w-full"
            priority
          />
        )}

        {/* Content */}
        <div>
          <span className="text-sm font-semibold text-cyan-400">
            FEATURED STORY
          </span>

          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {article.title}
          </h2>

          <p className="mt-4 text-gray-700 dark:text-gray-400">
            {article.excerpt}
          </p>

          <Link
            href={articleUrl}
            className="inline-block mt-6 text-cyan-400 font-semibold hover:underline"
          >
            Read Full Story →
          </Link>
        </div>
      </div>
    </section>
  );
}
