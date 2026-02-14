import CategoryFeed from "@/components/category/CategoryFeed";
import CategoryHeader from "@/components/category/CategoryHeader";
import CategorySidebar from "@/components/category/CategorySidebar";
import { notFound } from "next/navigation";

async function getCategory(slug) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const url = `${base}/api/public/categories/${slug}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.warn("getCategory fetch failed", e);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const param = await params;
  const slug = param.categoryslug;
  const data = await getCategory(slug);
  if (!data || !data.category) return {};

  const base =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  const canonicalPath = `/${slug}`;
  const canonicalUrl = base ? `${base}${canonicalPath}` : canonicalPath;
  const title = `${data.category.name} Articles`;
  const description =
    data.category.description ||
    `Browse the latest ${data.category.name} articles and updates.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }) {
  const param = await params;
  const slug = param.categoryslug;

  const data = await getCategory(slug);
  if (!data) notFound();

  return (
    <main className="bg-[#0b0f19] min-h-screen">
      <CategoryHeader category={data.category} />

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <CategoryFeed
            articles={data.articles}
            categoryName={data.category.name}
            categorySlug={data.category.slug}
          />
        </div>
        <div className="lg:col-span-4">
          <CategorySidebar trending={data.trending} />
        </div>
      </div>
    </main>
  );
}
