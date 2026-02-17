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
        <div className="relative w-full mb-6 sm:mb-8 md:mb-10 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="relative w-full aspect-[21/9] sm:aspect-[21/9]">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        </div>
      )}

      <article
        className="
          prose 
          prose-base
          sm:prose-lg
          prose-slate 
          dark:prose-invert 
          max-w-none
          
          prose-headings:font-bold
          prose-headings:tracking-tight
          prose-headings:scroll-mt-20
          
          prose-h1:text-2xl
          sm:prose-h1:text-3xl
          prose-h1:mb-5
          prose-h1:mt-10
          
          prose-h2:text-xl
          sm:prose-h2:text-2xl
          prose-h2:mb-4
          prose-h2:mt-10
          prose-h2:pb-2
          prose-h2:border-b
          prose-h2:border-gray-200
          dark:prose-h2:border-gray-800
          
          prose-h3:text-lg
          sm:prose-h3:text-xl
          prose-h3:mb-3
          prose-h3:mt-8
          
          prose-h4:text-base
          sm:prose-h4:text-lg
          prose-h4:mb-3
          prose-h4:mt-6
          
          prose-h5:text-base
          prose-h5:mb-2
          prose-h5:mt-5
          
          prose-h6:text-sm
          prose-h6:mb-2
          prose-h6:mt-4
          
          prose-p:text-base
          sm:prose-p:text-lg
          prose-p:leading-relaxed
          prose-p:mb-5
          prose-p:text-gray-700
          dark:prose-p:text-gray-300
          
          prose-a:text-cyan-600
          dark:prose-a:text-cyan-400
          prose-a:no-underline
          prose-a:font-medium
          prose-a:transition-colors
          hover:prose-a:text-cyan-700
          dark:hover:prose-a:text-cyan-300
          hover:prose-a:underline
          prose-a:break-words
          
          prose-strong:text-gray-900
          dark:prose-strong:text-gray-100
          prose-strong:font-semibold
          
          prose-em:text-gray-700
          dark:prose-em:text-gray-300
          prose-em:italic
          
          prose-blockquote:border-l-4
          prose-blockquote:border-cyan-500
          prose-blockquote:pl-4
          sm:prose-blockquote:pl-6
          prose-blockquote:py-3
          prose-blockquote:my-6
          prose-blockquote:mx-0
          prose-blockquote:bg-gray-50
          dark:prose-blockquote:bg-gray-900/30
          prose-blockquote:rounded-r-lg
          prose-blockquote:text-gray-700
          dark:prose-blockquote:text-gray-300
          prose-blockquote:italic
          prose-blockquote:font-normal
          prose-blockquote:text-base
          sm:prose-blockquote:text-lg
          
          prose-code:text-cyan-600
          dark:prose-code:text-cyan-400
          prose-code:bg-gray-100
          dark:prose-code:bg-gray-900
          prose-code:px-1.5
          prose-code:py-0.5
          prose-code:rounded
          prose-code:font-mono
          prose-code:text-xs
          sm:prose-code:text-sm
          prose-code:before:content-none
          prose-code:after:content-none
          prose-code:break-words
          
          prose-pre:bg-gray-900
          dark:prose-pre:bg-gray-950
          prose-pre:border
          prose-pre:border-gray-700
          prose-pre:rounded-lg
          prose-pre:shadow-lg
          prose-pre:my-6
          prose-pre:overflow-x-auto
          prose-pre:text-sm
          
          prose-ul:list-disc
          prose-ul:my-5
          prose-ul:pl-5
          sm:prose-ul:pl-6
          
          prose-ol:list-decimal
          prose-ol:my-5
          prose-ol:pl-5
          sm:prose-ol:pl-6
          
          prose-li:my-1.5
          prose-li:text-base
          sm:prose-li:text-lg
          prose-li:text-gray-700
          dark:prose-li:text-gray-300
          prose-li:marker:text-cyan-600
          dark:prose-li:marker:text-cyan-400
          prose-li:leading-relaxed
          
          prose-img:rounded-lg
          sm:prose-img:rounded-xl
          prose-img:shadow-md
          prose-img:my-6
          sm:prose-img:my-8
          prose-img:w-full
          prose-img:h-auto
          
          prose-hr:border-gray-200
          dark:prose-hr:border-gray-800
          prose-hr:my-8
          sm:prose-hr:my-12
          prose-hr:border-t-2
          
          prose-table:border
          prose-table:border-gray-300
          dark:prose-table:border-gray-700
          prose-table:rounded-lg
          prose-table:overflow-x-auto
          prose-table:my-6
          sm:prose-table:my-8
          prose-table:shadow-md
          prose-table:text-sm
          sm:prose-table:text-base
          prose-table:w-full
          prose-table:block
          sm:prose-table:table
          
          prose-thead:bg-gray-100
          dark:prose-thead:bg-gray-900
          
          prose-th:bg-gray-100
          dark:prose-th:bg-gray-900
          prose-th:text-gray-900
          dark:prose-th:text-gray-100
          prose-th:font-semibold
          prose-th:px-3
          sm:prose-th:px-4
          prose-th:py-2
          sm:prose-th:py-3
          prose-th:border-b-2
          prose-th:border-gray-300
          dark:prose-th:border-gray-700
          prose-th:text-left
          prose-th:text-xs
          sm:prose-th:text-sm
          
          prose-td:px-3
          sm:prose-td:px-4
          prose-td:py-2
          sm:prose-td:py-3
          prose-td:border
          prose-td:border-gray-200
          dark:prose-td:border-gray-800
          prose-td:text-gray-700
          dark:prose-td:text-gray-300
          prose-td:text-xs
          sm:prose-td:text-sm
        "
      >
        <TipTapRenderer content={contentRaw} fallback={fallback} />
      </article>
    </div>
  );
}
