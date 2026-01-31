import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ArticleContent({ article }) {
  // Heuristic: if content contains HTML tags, treat as HTML (from editor), otherwise render as markdown (legacy)
  const isHTML = /<\/?[a-z][\s\S]*>/i.test(article.content || "");

  // Support both module shapes: exported instance or factory (robust fallback)
  let purifier = null;
  if (DOMPurify && typeof DOMPurify.sanitize === "function") {
    purifier = DOMPurify;
  } else if (typeof DOMPurify === "function") {
    try {
      purifier = DOMPurify();
    } catch (e) {
      purifier = null;
    }
  }

  const sanitized =
    isHTML && purifier && typeof purifier.sanitize === "function"
      ? purifier.sanitize(article.content || "", {
          USE_PROFILES: { html: true },
        })
      : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Image */}
      {article.featured_image && (
        <Image
          src={article.featured_image}
          alt={article.title}
          width={800}
          height={450}
          className="rounded-xl mb-8 object-cover"
          priority
        />
      )}

      {/* Content */}
      <div
        className="
                    prose prose-base md:prose-lg max-w-none
                    prose-invert
                    prose-headings:font-semibold
                    prose-headings:tracking-tight
                    prose-p:text-gray-300
                    prose-li:text-gray-300
                    prose-strong:text-gray-100
                    prose-a:text-cyan-400
                    prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:text-gray-300
                    prose-code:text-gray-200
                "
      >
        {isHTML ? (
          // Render sanitized HTML from the editor
          <div dangerouslySetInnerHTML={{ __html: sanitized }} />
        ) : (
          // Fallback: render existing markdown articles
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              /* ---------------- HEADINGS ---------------- */

              h1: ({ children }) => (
                <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-6 leading-tight border-l-4 border-cyan-400 pl-4">
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2 className="text-xl md:text-2xl font-semibold text-gray-100 mt-10 mb-5 border-l-4 border-cyan-500/70 pl-4">
                  {children}
                </h2>
              ),

              /**
               * h3 is used heavily in FAQs
               * Styled as question blocks
               */
              h3: ({ children }) => (
                <h3 className="text-base md:text-lg font-semibold text-gray-100 mt-6 mb-3 bg-[#020617] border border-gray-700 rounded-lg px-4 py-3">
                  {children}
                </h3>
              ),

              /* ---------------- TEXT ---------------- */

              p: ({ children }) => (
                <p className="leading-relaxed text-gray-300 mb-5">{children}</p>
              ),

              strong: ({ children }) => (
                <strong className="text-gray-100 font-semibold">
                  {children}
                </strong>
              ),

              /* ---------------- LISTS ---------------- */

              ul: ({ children }) => (
                <ul className="my-5 space-y-2 list-disc pl-5 marker:text-cyan-400">
                  {children}
                </ul>
              ),

              ol: ({ children }) => (
                <ol className="my-5 space-y-2 list-decimal pl-5 marker:text-cyan-400">
                  {children}
                </ol>
              ),

              li: ({ children }) => (
                <li className="text-gray-300">{children}</li>
              ),

              /* ---------------- CODE ---------------- */

              code: ({ inline, children }) => {
                if (inline) {
                  return (
                    <code className="bg-[#020617] border border-gray-700 rounded px-1.5 py-0.5 text-sm font-mono text-cyan-300">
                      {children}
                    </code>
                  );
                }

                return (
                  <pre className="bg-[#020617] border border-gray-700 rounded-xl p-4 overflow-x-auto my-6">
                    <code className="text-gray-100 font-mono text-sm">
                      {children}
                    </code>
                  </pre>
                );
              },

              /* ---------------- BLOCKQUOTE ---------------- */

              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-cyan-400 bg-[#020617] pl-5 py-4 my-6 rounded-r-lg text-gray-300">
                  {children}
                </blockquote>
              ),

              /* ---------------- TABLES ---------------- */

              table: ({ children }) => (
                <div className="overflow-x-auto my-6 rounded-lg border border-gray-700">
                  <table className="w-full border-collapse text-sm">
                    {children}
                  </table>
                </div>
              ),

              thead: ({ children }) => (
                <thead className="bg-[#020617]">{children}</thead>
              ),

              th: ({ children }) => (
                <th className="border border-gray-700 px-4 py-2 text-left font-semibold text-gray-100">
                  {children}
                </th>
              ),

              td: ({ children }) => (
                <td className="border border-gray-700 px-4 py-2 text-gray-300">
                  {children}
                </td>
              ),

              /* ---------------- IMAGES ---------------- */

              img: ({ src, alt }) => (
                <div className="my-6 overflow-hidden rounded-xl border border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src || ""}
                    alt={alt || ""}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ),

              /* ---------------- HR (used before FAQs) ---------------- */

              hr: () => <hr className="my-10 border-gray-700" />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
