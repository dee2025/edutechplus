import Link from "next/link";

export default function RoadmapCard({ roadmap }) {
    console.log(roadmap)
  return (
    <Link
      href={`/roadmaps/${roadmap.slug}`}
      className="block bg-[#111827] rounded-xl p-5 hover:bg-[#0b0f19] transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            {roadmap.title}
          </h3>
          <p className="text-sm text-gray-400 mt-2 line-clamp-3">
            {roadmap.description}
          </p>

          <div className="mt-4 flex items-center gap-2">
            {roadmap.tags?.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-1 rounded-full bg-[#0b1724] text-cyan-300"
              >
                {t}
              </span>
            ))}

            {/* <span className="ml-auto text-sm text-gray-400">
              {roadmap?.steps} steps
            </span> */}
          </div>
        </div>

        <div className="hidden sm:flex items-center">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
            {roadmap.emoji ?? "📚"}
          </div>
        </div>
      </div>
    </Link>
  );
}
