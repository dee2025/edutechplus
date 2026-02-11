import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoadmapBySlug } from "../../../../lib/roadmaps";

export async function generateMetadata({ params }) {
  const roadmap = await getRoadmapBySlug(params.slug);
  if (!roadmap) return {};

  return {
    title: `${roadmap.title} | Roadmap | Edutech+`,
    description: roadmap.description,
  };
}

export default async function RoadmapDetailPage({ params }) {
    const param = await params;
  const roadmap = await getRoadmapBySlug(param.slug);
  if (!roadmap) return notFound();

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-10 md:py-14">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <Link href="/roadmaps" className="text-sm text-cyan-300 hover:underline">
            ← Back to roadmaps
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mt-3">
            {roadmap.emoji} {roadmap.title}
          </h1>

          <p className="text-gray-400 max-w-3xl mt-2">{roadmap.description}</p>

          <div className="mt-4 flex items-center gap-2">
            {roadmap.tags?.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded-full bg-[#0b1724] text-cyan-300">
                {t}
              </span>
            ))}

            <span className="ml-auto text-sm text-gray-400">{roadmap.steps?.length ?? roadmap.stepsCount} steps</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2 space-y-6">
            {roadmap.steps && roadmap.steps.length ? (
              roadmap.steps.map((s, idx) => (
                <section key={s.id ?? idx} className="bg-[#111827] rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-cyan-300 font-bold text-lg">{idx + 1}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{s.title}</h3>
                      {s.description && (
                        <p className="text-gray-400 mt-2">{s.description}</p>
                      )}

                      {s.resources && s.resources.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm text-gray-300 font-semibold">Resources</h4>
                          <ul className="mt-2 space-y-1">
                            {s.resources.map((r) => (
                              <li key={r.url}>
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-300 hover:underline text-sm"
                                >
                                  {r.title} ↗
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              ))
            ) : (
              <p className="text-gray-400">No steps documented yet.</p>
            )}
          </main>

          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-[#111827] rounded-xl p-5">
              <h4 className="text-sm text-gray-300 font-semibold">Summary</h4>
              <p className="text-gray-400 mt-2">{roadmap.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {roadmap.tags?.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full bg-[#0b1724] text-cyan-300">
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-400">Estimated steps: {roadmap.steps?.length ?? roadmap.stepsCount}</div>

              <div className="mt-4">
                <a href="/contact-us" className="inline-block px-4 py-2 rounded-md bg-cyan-400 text-black font-semibold hover:opacity-90">Request changes</a>
              </div>
            </div>

            <div className="bg-[#111827] rounded-xl p-5">
              <h4 className="text-sm text-gray-300 font-semibold">Get started</h4>
              <p className="text-gray-400 mt-2">Follow the steps in sequence, practice with projects, and consult the listed resources.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
