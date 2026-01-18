import CategoryHeader from "@/components/category/CategoryHeader";
import CategoryFeed from "@/components/category/CategoryFeed";
import CategorySidebar from "@/components/category/CategorySidebar";
import { notFound } from "next/navigation";

async function getCategory(slug) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/categories/${slug}`,
        { cache: "no-store" }
    );

    if (!res.ok) return null;
    return res.json();
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
                    />
                </div>
                <div className="lg:col-span-4">
                    <CategorySidebar trending={data.trending} />
                </div>
            </div>
        </main>
    );
}
