export const metadata = {
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Latest Articles",
    description:
      "Explore the newest articles across categories, with filters and search.",
  },
};

export default function LatestArticlesLayout({ children }) {
  return children;
}
