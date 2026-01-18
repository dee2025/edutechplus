import { NextResponse } from "next/server";

export async function GET() {
  // Example data (replace with your database or CMS content)
  const blogPosts = [
    {
      title: "Post 1",
      description: "This is the first blog post.",
      link: "https://yourwebsite.com/post-1",
      pubDate: new Date("2025-01-01").toUTCString(),
    },
    {
      title: "Post 2",
      description: "This is the second blog post.",
      link: "https://yourwebsite.com/post-2",
      pubDate: new Date("2025-01-15").toUTCString(),
    },
  ];

  // Generate RSS XML
  const rss = `
        <rss version="2.0">
            <channel>
                <title>Your Blog Title</title>
                <link>https://yourwebsite.com</link>
                <description>Your Blog Description</description>
                <language>en-us</language>
                <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
                ${blogPosts
                  .map(
                    (post) => `
                        <item>
                            <title>${post.title}</title>
                            <description>${post.description}</description>
                            <link>${post.link}</link>
                            <pubDate>${post.pubDate}</pubDate>
                        </item>
                    `
                  )
                  .join("")}
            </channel>
        </rss>
    `;

  // Return the RSS feed as XML
  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
