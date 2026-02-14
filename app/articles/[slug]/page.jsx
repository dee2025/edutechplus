import { notFound, permanentRedirect } from "next/navigation";

async function getArticle(slug) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const url = `${base}/api/public/articles/${slug}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.warn("Article redirect fetch failed", e);
    return null;
  }
}

export default async function ArticleRedirectPage({ params }) {
  const param = await params;
  const slug = param.slug;

  const data = await getArticle(slug);
  if (!data || !data.article) return notFound();

  const article = data.article;
  if (!article.category_slug) return notFound();
  const target = `/${article.category_slug}/${article.slug}`;

  permanentRedirect(target);
}
