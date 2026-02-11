// "use client";
// import Image from "next/image";

// // NOTE: Article content is rendered only via the TipTap read-only renderer.
// // The markdown/html fallback has been removed — content should be TipTap output.

// export default function ArticleContent({ article }) {
//   const contentRaw = article && article.content ? String(article.content) : "";
//   const fallback = article && article.excerpt ? String(article.excerpt) : "";

//   return (
//     <div className="max-w-3xl mx-auto">
//       {/* Hero Image */}
//       {article?.featured_image && (
//         <Image
//           src={article.featured_image}
//           alt={article.title}
//           width={800}
//           height={450}
//           className="rounded-xl mb-8 object-cover"
//           priority
//         />
//       )}

//       <article
//         dangerouslySetInnerHTML={{
//           __html: contentRaw,
//         }}
//         className="text-gray-300 leading-7 prose prose-slate dark:prose-invert mx-auto"
      
//       />
//     </div>
//   );
// }


"use client";
import Image from "next/image";

export default function ArticleContent({ article }) {
  const contentRaw = article?.content ? String(article.content) : "";

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Hero Image */}
      {article?.featured_image && (
        <Image
          src={article.featured_image}
          alt={article.title}
          width={800}
          height={450}
          className="rounded-2xl mb-10 object-cover"
          priority
        />
      )}

      <article
        dangerouslySetInnerHTML={{ __html: contentRaw }}
        className="
          prose 
          prose-slate 
          dark:prose-invert 
          max-w-none
          prose-headings:font-bold
          prose-headings:tracking-tight
          prose-h1:text-3xl
          prose-h2:text-2xl
          prose-h3:text-xl
          prose-p:leading-8
          prose-p:text-gray-300
          prose-a:text-blue-400
          prose-a:no-underline
          hover:prose-a:underline
          prose-blockquote:border-l-4
          prose-blockquote:border-blue-500
          prose-blockquote:pl-6
          prose-blockquote:text-gray-300
          prose-ul:list-disc
          prose-ol:list-decimal
          prose-li:marker:text-blue-400
          prose-table:border
          prose-table:border-gray-700
          prose-th:bg-gray-800
          prose-th:text-gray-200
          prose-td:border-gray-700
        "
      />
    </div>
  );
}
