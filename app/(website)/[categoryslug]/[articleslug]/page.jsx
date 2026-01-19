import ArticleContent from "@/components/article/ArticleContent";
import ArticleHeader from "@/components/article/ArticleHeader";
import ArticleSidebar from "@/components/article/ArticleSidebar";
import { extractFaqsFromContent } from "@/lib/extractFaqs";
import { notFound } from "next/navigation";

async function getArticle(slug) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/articles/${slug}`,
    { cache: "no-store" },
  );

  if (!res.ok) return null;
  return res.json();
}

/* ---------------- SEO METADATA ---------------- */
export async function generateMetadata({ params }) {
  const param = await params;
  const data = await getArticle(param.articleslug);
  if (!data) return {};

  const article = data.article;

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt;

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: article.published_at,
      images: [
        {
          url: article.featured_image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.featured_image],
    },
  };
}

/* ---------------- PAGE ---------------- */
export default async function ArticlePage({ params }) {
  const param = await params;

  const data = await getArticle(param.articleslug);

  if (!data) return notFound();

  const { article, categories, trending } = data;

  const faqs = extractFaqsFromContent(article.content);
  console.log(article);
  /* ---------- SCHEMAS ---------- */

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.featured_image,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: "Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Your Website Name",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${article.slug}`,
    },
  };

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <main className="bg-[#0b0f19] min-h-screen">
      {/* -------- JSON-LD SCHEMA -------- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}

      <ArticleHeader article={article} categories={categories} />

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <ArticleContent article={article} />
        </div>
        <div className="lg:col-span-4">
          <ArticleSidebar trending={trending} />
        </div>
      </div>
    </main>
  );
}
