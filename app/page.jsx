import HomeFeed from "@/components/Home/HomeFeed";
import LeftSidebar from "@/components/Home/LeftSidebar";
import RecentlyPublished from "@/components/Home/RecentlyPublished";
import RightSidebar from "@/components/Home/RightSidebar";
import TopContributors from "@/components/Home/TopContributors";

export const metadata = {
  title: "ArticleGrip - Discover & Share Knowledge",
  description:
    "A platform for developers to share knowledge and discover great content.",
};

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const filter = params?.filter || "latest";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Featured Section - Full Width */}
      {/* <div className="max-w-7xl mx-auto px-4 py-8">
        <FeaturedArticlesCarousel />
      </div> */}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex gap-6 mb-12">
          {/* Left Sidebar */}
          <LeftSidebar />

          {/* Center Feed */}
          <HomeFeed filter={filter} />

          {/* Right Sidebar */}
          <RightSidebar />
        </div>

        {/* Recently Published Section */}
        <RecentlyPublished />

        {/* Top Contributors Section */}
        <TopContributors />
      </div>
    </div>
  );
}
