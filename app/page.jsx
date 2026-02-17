import HomePageClient from "@/components/Home/HomePageClient";

export const metadata = {
  title: "EduTechPlus - Discover & Share Knowledge",
  description:
    "A platform for developers to share knowledge and discover great content.",
};

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const filter = params?.filter || "latest";

  return <HomePageClient filter={filter} />;
}
