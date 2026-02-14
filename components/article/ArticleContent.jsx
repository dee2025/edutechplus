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
import TipTapRenderer from "./TipTapRenderer";

export default function ArticleContent({ article }) {
  const contentRaw = article?.content ? String(article.content) : "";
  const fallback = article?.excerpt || "";

  return (
    <div className="max-w-none">
      {/* Hero Image */}
      {article?.featured_image && (
        <div className="relative w-full mb-12 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="relative w-full aspect-[21/9]">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <article
        className="
          prose 
          prose-lg
          prose-slate 
          dark:prose-invert 
          max-w-none
          
          prose-headings:font-extrabold
          prose-headings:tracking-tight
          prose-headings:scroll-mt-24
          
          prose-h1:text-4xl
          prose-h1:mb-6
          prose-h1:mt-12
          
          prose-h2:text-3xl
          prose-h2:mb-6
          prose-h2:mt-12
          prose-h2:pb-3
          prose-h2:border-b
          prose-h2:border-gray-200
          dark:prose-h2:border-gray-800
          
          prose-h3:text-2xl
          prose-h3:mb-4
          prose-h3:mt-8
          
          prose-h4:text-xl
          prose-h4:mb-3
          prose-h4:mt-6
          
          prose-p:text-base
          prose-p:leading-8
          prose-p:mb-6
          prose-p:text-gray-700
          dark:prose-p:text-gray-300
          
          first:prose-p:first-letter:text-6xl
          first:prose-p:first-letter:font-bold
          first:prose-p:first-letter:mr-2
          first:prose-p:first-letter:float-left
          first:prose-p:first-letter:leading-none
          first:prose-p:first-letter:text-cyan-600
          dark:first:prose-p:first-letter:text-cyan-400
          
          prose-a:text-cyan-600
          dark:prose-a:text-cyan-400
          prose-a:no-underline
          prose-a:font-medium
          prose-a:transition-colors
          hover:prose-a:text-cyan-700
          dark:hover:prose-a:text-cyan-300
          hover:prose-a:underline
          
          prose-strong:text-gray-900
          dark:prose-strong:text-gray-100
          prose-strong:font-bold
          
          prose-em:text-gray-700
          dark:prose-em:text-gray-300
          
          prose-blockquote:border-l-4
          prose-blockquote:border-cyan-500
          prose-blockquote:pl-6
          prose-blockquote:py-1
          prose-blockquote:my-6
          prose-blockquote:bg-gray-50
          dark:prose-blockquote:bg-gray-900/30
          prose-blockquote:rounded-r-lg
          prose-blockquote:text-gray-700
          dark:prose-blockquote:text-gray-300
          prose-blockquote:italic
          prose-blockquote:font-medium
          
          prose-code:text-cyan-600
          dark:prose-code:text-cyan-400
          prose-code:bg-gray-100
          dark:prose-code:bg-gray-900
          prose-code:px-1.5
          prose-code:py-0.5
          prose-code:rounded
          prose-code:font-mono
          prose-code:text-sm
          prose-code:before:content-none
          prose-code:after:content-none
          
          prose-pre:bg-gray-900
          dark:prose-pre:bg-gray-950
          prose-pre:border
          prose-pre:border-gray-700
          prose-pre:rounded-xl
          prose-pre:shadow-lg
          prose-pre:my-6
          
          prose-ul:list-disc
          prose-ul:my-6
          prose-ul:pl-6
          
          prose-ol:list-decimal
          prose-ol:my-6
          prose-ol:pl-6
          
          prose-li:my-2
          prose-li:text-gray-700
          dark:prose-li:text-gray-300
          prose-li:marker:text-cyan-600
          dark:prose-li:marker:text-cyan-400
          
          prose-img:rounded-xl
          prose-img:shadow-lg
          prose-img:my-8
          
          prose-hr:border-gray-200
          dark:prose-hr:border-gray-800
          prose-hr:my-12
          
          prose-table:border
          prose-table:border-gray-300
          dark:prose-table:border-gray-700
          prose-table:rounded-lg
          prose-table:overflow-hidden
          prose-table:my-8
          prose-table:shadow-md
          
          prose-thead:bg-gray-100
          dark:prose-thead:bg-gray-900
          
          prose-th:bg-gray-100
          dark:prose-th:bg-gray-900
          prose-th:text-gray-900
          dark:prose-th:text-gray-100
          prose-th:font-bold
          prose-th:px-4
          prose-th:py-3
          prose-th:border-b-2
          prose-th:border-gray-300
          dark:prose-th:border-gray-700
          
          prose-td:px-4
          prose-td:py-3
          prose-td:border
          prose-td:border-gray-200
          dark:prose-td:border-gray-800
          prose-td:text-gray-700
          dark:prose-td:text-gray-300
        "
      >
        <TipTapRenderer content={contentRaw} fallback={fallback} />
      </article>
    </div>
  );
}
