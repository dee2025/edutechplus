"use client";

import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthorLink from "../common/AuthorLink";

export default function FeaturedArticlesCarousel() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetchFeatured();
  }, []);

  async function fetchFeatured() {
    try {
      const res = await fetch("/api/articles/featured?limit=5");
      const data = await res.json();
      setFeatured(data.articles || []);
    } catch (err) {
      console.error("Failed to fetch featured articles:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || featured.length === 0) {
    return null;
  }

  const article = featured[current];
  const normalizeSlug = (slug) =>
    (slug || "").replace(/^\/?(articles|article)\//, "");
  const articleUrl = `/${article.author_username || article.author_slug || article.author_id}/${normalizeSlug(article.slug)}`;

  return (
    <section className="bg-linear-to-r from-cyan-600 to-blue-600 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 p-8">
          {/* Image */}
          {article.featured_image && (
            <div className="hidden lg:block relative h-80 rounded-lg overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="flex flex-col justify-center text-white space-y-4">
            <div className="inline-flex items-center gap-2 w-fit">
              <Star size={16} className="text-yellow-300" />
              <span className="text-sm font-semibold">Editor's Spotlight</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold leading-tight line-clamp-3">
              {article.title}
            </h2>

            <p className="text-cyan-100 line-clamp-3">
              {article.excerpt || article.description}
            </p>

            <div className="flex items-center gap-3 text-sm text-cyan-100">
              <Link
                href={`/profile/${article.author_username || article.author_slug || article.author_id}`}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-semibold hover:bg-white/30 transition-colors"
              >
                {article.author_name?.charAt(0)?.toUpperCase() || "A"}
              </Link>
              <div>
                <AuthorLink
                  user={{
                    name: article.author_name || "Admin",
                    username: article.author_username,
                    slug: article.author_slug,
                    id: article.author_id,
                  }}
                  className="text-cyan-100! font-medium block"
                />
                <p className="text-xs opacity-80">{article.views || 0} views</p>
              </div>
            </div>

            <Link
              href={articleUrl}
              className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-white text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-semibold w-fit"
            >
              Read Article
              <ArrowRight size={18} />
            </Link>

            {/* Carousel Navigation */}
            <div className="flex gap-2 pt-4">
              {featured.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === current
                      ? "bg-white w-8"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
