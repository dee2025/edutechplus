import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ArticleContent({ article }) {
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
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
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

                        h3: ({ children }) => (
                            <h3 className="text-lg md:text-xl font-semibold text-gray-200 mt-8 mb-4 border-l-2 border-cyan-500/50 pl-3">
                                {children}
                            </h3>
                        ),

                        p: ({ children }) => (
                            <p className="leading-relaxed text-gray-300 mb-5">
                                {children}
                            </p>
                        ),

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
                            <li className="text-gray-300">
                                {children}
                            </li>
                        ),

                        strong: ({ children }) => (
                            <strong className="text-gray-100 font-semibold">
                                {children}
                            </strong>
                        ),

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

                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-cyan-400 bg-[#020617] pl-5 py-4 my-6 rounded-r-lg text-gray-300">
                                {children}
                            </blockquote>
                        ),

                        /* ✅ TABLE SUPPORT (FIXED) */
                        table: ({ children }) => (
                            <div className="overflow-x-auto my-6 rounded-lg border border-gray-700">
                                <table className="w-full border-collapse text-sm">
                                    {children}
                                </table>
                            </div>
                        ),

                        thead: ({ children }) => (
                            <thead className="bg-[#020617]">
                                {children}
                            </thead>
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
                    }}
                >
                    {article.content}
                </ReactMarkdown>
            </div>
    </div>
  );
}
