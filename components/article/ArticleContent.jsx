"use client";
import Image from "next/image";

// NOTE: Article content is rendered only via the TipTap read-only renderer.
// The markdown/html fallback has been removed — content should be TipTap output.

export default function ArticleContent({ article }) {
  const contentRaw = article && article.content ? String(article.content) : "";
  const fallback = article && article.excerpt ? String(article.excerpt) : "";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Image */}
      {article?.featured_image && (
        <Image
          src={article.featured_image}
          alt={article.title}
          width={800}
          height={450}
          className="rounded-xl mb-8 object-cover"
          priority
        />
      )}

      <article
        dangerouslySetInnerHTML={{
          __html: contentRaw,
        }}
        className="text-gray-300 leading-7 prose prose-slate dark:prose-invert mx-auto"
      
      />
    </div>
  );
}
