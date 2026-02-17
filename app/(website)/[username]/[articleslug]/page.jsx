import ArticleContent from "@/components/article/ArticleContent";
import ArticleTitleActions from "@/components/article/ArticleTitleActions";
import AuthorSidebar from "@/components/article/AuthorSidebar";
import Comments from "@/components/article/Comments";
import TrackViewClient from "@/components/article/TrackViewClient";
import { extractFaqsFromContent } from "@/lib/extractFaqs";
import { notFound } from "next/navigation";

async function getArticle(username, articleSlug) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const url = `${base}/api/articles/by-author/${username}/${articleSlug}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.warn("getArticle fetch failed", e);
    return null;
  }
}

/* ---------------- SEO METADATA ---------------- */
export async function generateMetadata({ params }) {
  const param = await params;
  const data = await getArticle(param.username, param.articleslug);
  if (!data) return {};

  const article = data.article;

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt;

  const base =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  const canonicalPath = `/${article.author_username}/${article.slug}`;
  const url = base ? `${base}${canonicalPath}` : canonicalPath;

  const openGraph = {
    title,
    description,
    url,
    type: "article",
    publishedTime: article.published_at,
  };

  if (article.featured_image) {
    openGraph.images = [
      {
        url: article.featured_image,
        width: 1200,
        height: 630,
        alt: article.title,
      },
    ];
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.featured_image ? [article.featured_image] : undefined,
    },
  };
}

/* ---------------- PAGE ---------------- */
export default async function ArticleByAuthorPage({ params }) {
  const param = await params;

  const data = await getArticle(param.username, param.articleslug);

  if (!data) return notFound();

  const { article, latestByAuthor = [] } = data;

  let faqs = [];
  try {
    faqs = extractFaqsFromContent(article.content || "");
  } catch (e) {
    console.warn("extractFaqs failed", e);
    faqs = [];
  }

  const base =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  const canonicalPath = `/${article.author_username}/${article.slug}`;
  const canonicalUrl = base ? `${base}${canonicalPath}` : canonicalPath;

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
      name: article.author_name,
      url: `${base}/${article.author_username}`,
    },
    publisher: {
      "@type": "Organization",
      name: "EduTechPlus",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
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
    <main className="bg-white dark:bg-[#0b0f19] min-h-screen">
      <div>
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
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-transparent">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                {article.title}
              </h1>
              <ArticleTitleActions article={article} />
              <ArticleContent article={article} />
              <TrackViewClient article={article} />

              {/* Article Footer Divider */}
              <div className="mt-8 sm:mt-10 md:mt-12 mb-8 sm:mb-10 border-t border-gray-200 dark:border-gray-800"></div>

              {/* Comments */}
              <div id="comments-section">
                <Comments slug={article.slug} />
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <AuthorSidebar article={article} latestByAuthor={latestByAuthor} />
          </div>
        </div>
      </div>
    </main>
  );
}
