import LatestArticlesClient from "./LatestArticlesClient";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Latest Articles",
    description:
      "Explore the newest articles across categories, with filters and search.",
    alternates: {
      canonical: "/latest-articles",
    },
    openGraph: {
      title: "Latest Articles",
      description:
        "Explore the newest articles across categories, with filters and search.",
      url: "/latest-articles",
      type: "website",
      images: ["/latest-articles/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Latest Articles",
      description:
        "Explore the newest articles across categories, with filters and search.",
      images: ["/latest-articles/opengraph-image"],
    },
  };
}

export default function LatestArticlesPage() {
  return <LatestArticlesClient />;
}
