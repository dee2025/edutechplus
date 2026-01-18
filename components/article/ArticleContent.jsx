import Image from 'next/image';

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
                className="prose prose-invert prose-lg max-w-none text-gray-300
                    prose-a:text-cyan-400 hover:prose-a:text-cyan-300
                    prose-headings:text-gray-100
                    prose-p:text-gray-100
                    prose-a:text-cyan-400
                    prose-strong:text-gray-200"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />
        </div>
    );
}
