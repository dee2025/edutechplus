import { query } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://articlegrip.com";
const ITEMS_PER_PAGE = 50; // Google recommends max 50k URLs per sitemap

// Static pages with their priority and change frequency
const STATIC_PAGES = [
  { url: "/", priority: 1.0, changefreq: "daily" },
  { url: "/categories", priority: 0.9, changefreq: "weekly" },
  { url: "/latest-articles", priority: 0.9, changefreq: "daily" },
  { url: "/roadmaps", priority: 0.8, changefreq: "weekly" },
  { url: "/about-us", priority: 0.7, changefreq: "monthly" },
  { url: "/contact-us", priority: 0.5, changefreq: "monthly" },
  { url: "/privacy-policy", priority: 0.5, changefreq: "monthly" },
  { url: "/terms", priority: 0.5, changefreq: "monthly" },
  { url: "/disclaimer", priority: 0.5, changefreq: "monthly" },
  { url: "/country-want-to-know", priority: 0.6, changefreq: "weekly" },
];

async function generateDynamicPages() {
  const pages = [];

  try {
    // Get categories count
    const categoriesResult = await query(
      "SELECT COUNT(*) as count FROM categories WHERE parent_id IS NULL",
    );
    const categoriesCount = categoriesResult?.[0]?.count || 0;
    const categoryPages = Math.ceil(categoriesCount / ITEMS_PER_PAGE);

    for (let i = 1; i <= categoryPages; i++) {
      pages.push({
        url: `/categories?page=${i}`,
        lastModified: new Date(),
        priority: 0.8,
        changefreq: "weekly",
      });
    }

    // Get articles count
    const articlesResult = await query(
      "SELECT COUNT(*) as count FROM articles WHERE status = 'published'",
    );
    const articlesCount = articlesResult?.[0]?.count || 0;
    const articlePages = Math.ceil(articlesCount / ITEMS_PER_PAGE);

    for (let i = 1; i <= articlePages; i++) {
      pages.push({
        url: `/latest-articles?page=${i}`,
        lastModified: new Date(),
        priority: 0.8,
        changefreq: "daily",
      });
    }

    // Get individual articles
    const articles = await query(
      "SELECT a.id, a.slug, a.updated_at, MIN(c.slug) AS category_slug FROM articles a LEFT JOIN article_categories ac ON ac.article_id = a.id LEFT JOIN categories c ON c.id = COALESCE(ac.category_id, a.category_id) WHERE a.status = 'published' GROUP BY a.id ORDER BY a.updated_at DESC",
    );

    if (articles && Array.isArray(articles)) {
      articles
        .filter((article) => article.category_slug)
        .slice(0, 10000)
        .forEach((article) => {
          const articlePath = `/${article.category_slug}/${article.slug}`;
          pages.push({
            url: articlePath,
            lastModified: article.updated_at
              ? new Date(article.updated_at)
              : new Date(),
            priority: 0.7,
            changefreq: "weekly",
          });
        });
    }

    // Get individual categories with articles
    const categories = await query(
      "SELECT id, slug FROM categories ORDER BY id DESC LIMIT 1000",
    );

    if (categories && Array.isArray(categories)) {
      categories.forEach((category) => {
        pages.push({
          url: `/${category.slug}`,
          lastModified: new Date(),
          priority: 0.75,
          changefreq: "weekly",
        });
      });
    }


  } catch (error) {
    console.error("Error generating dynamic sitemap pages:", error);
  }

  return pages;
}

export default async function sitemap() {
  const dynamicPages = await generateDynamicPages();

  // Combine static and dynamic pages
  const allPages = [
    ...STATIC_PAGES.map((page) => ({
      url: `${BASE_URL}${page.url}`,
      lastModified: new Date(),
      priority: page.priority,
      changefreq: page.changefreq,
    })),
    ...dynamicPages.map((page) => ({
      url: `${BASE_URL}${page.url}`,
      lastModified: page.lastModified,
      priority: page.priority,
      changefreq: page.changefreq,
    })),
  ];

  return allPages;
}
