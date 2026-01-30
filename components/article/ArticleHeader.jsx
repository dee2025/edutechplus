import ViewsBadge from "./ViewsBadge";

export default function ArticleHeader({ article, categories }) {
  return (
    <header className="border-b border-gray-800">
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        {/* Categories */}
        <div className="text-xs font-semibold tracking-widest text-cyan-400">
          {categories}
        </div>

        {/* Title */}
        <h1 className="mt-4 text-3xl md:text-4xl font-bold text-gray-100 leading-tight">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-3">
          <div>
            By <span className="text-gray-300">{article.author_name}</span>
            {" · "}
            {new Date(article.published_at).toLocaleDateString()}
            {" · "}
            {article.read_time} min read
          </div>

          {/* ViewsBadge is a client component that records and displays views */}
          <ViewsBadge slug={article.slug} initial={article.views ?? 0} />
        </div>
      </div>
    </header>
  );
}
