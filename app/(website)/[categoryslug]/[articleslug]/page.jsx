import ArticleContent from "@/components/article/ArticleContent";
import ArticleHeader from "@/components/article/ArticleHeader";
import ArticleSidebar from "@/components/article/ArticleSidebar";
import { notFound } from "next/navigation";

async function getArticle(articleslug) {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/articles/${articleslug}`,
    { cache: "no-store" },
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function ArticlePage({ params }) {
  const prarm = await params;
  const slug = prarm.articleslug;

  const data = await getArticle(slug);

  console.log(data)
  if (!data) return notFound();

  return (
    <main className="bg-[#0b0f19] min-h-screen">
      <ArticleHeader article={data.article} categories={data.categories} />

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <ArticleContent article={data.article} />
        </div>
        <div className="lg:col-span-4">
          <ArticleSidebar trending={data.trending} />
        </div>
      </div>
    </main>
  );
}
