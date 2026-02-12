import AITutorSection from "@/components/Home/AITutorSection";
import CategoryBlocks from "@/components/Home/CategoryBlocks";
import FeaturedStory from "@/components/Home/FeaturedStory";
import Hero from "@/components/Home/Hero";
import LatestNews from "@/components/Home/LatestNews";
import Newsletter from "@/components/Home/Newsletter";
import TrendingTopics from "@/components/Home/TrendingTopics";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Hero />
      <TrendingTopics />
      <AITutorSection />
      <LatestNews />
      <FeaturedStory />
      <CategoryBlocks />
      <Newsletter />
    </div>
  );
}
