import { getAllRoadmaps } from "@/lib/roadmaps";
import { RoadmapList } from "../../../components/roadmaps";

export const metadata = {
  title: "Roadmaps | Edutech+",
  description:
    "Curated learning roadmaps and resources — frontend, backend, cloud, data, mobile, and more.",
};

export default async function RoadmapsPage() {
  // replace SAMPLE data with data from lib (sync for now, pluggable to API later)
  const roadmaps = await getAllRoadmaps();

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-10 md:py-14">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
            Learning Roadmaps
          </h1>
          <p className="text-gray-400 max-w-2xl mt-2">
            Curated step-by-step roadmaps and resources to learn key tech
            disciplines — pick a path and follow the recommended sequence.
          </p>
        </div>

        {/* LIST */}
        <div>
          <RoadmapList items={roadmaps} />

          {!roadmaps.length && (
            <p className="text-gray-500">No roadmaps available yet.</p>
          )}
        </div>

        {/* FOOTER CTA */}
        <div className="mt-6">
          <p className="text-gray-400">
            Want a roadmap added? Reach out via the contact page and we'll
            curate it.
          </p>
        </div>
      </div>
    </div>
  );
}
