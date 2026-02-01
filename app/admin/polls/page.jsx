import Link from "next/link";

export default async function Page() {
  // Server component: fetch polls
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/polls`,
    { cache: "no-store" },
  );
  const data = await res.json();
  const polls = data.polls || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Polls</h1>
        <Link
          href="/admin/polls/create"
          className="px-4 py-2 rounded bg-cyan-400 text-black font-semibold"
        >
          Create poll
        </Link>
      </div>

      <div className="space-y-4">
        {polls.length === 0 ? (
          <div className="text-gray-400">No polls yet</div>
        ) : (
          polls.map((p) => (
            <div key={p.id} className="bg-[#0b0f19] p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {p.question}{" "}
                    <span className="text-xs text-gray-400">
                      {p.slug ? ` · ${p.slug}` : ""}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(p.created_at).toLocaleString()} ·{" "}
                    {p.is_active ? (
                      <span className="text-emerald-400">Active</span>
                    ) : (
                      <span className="text-red-400">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-300">
                    {(p.options || []).reduce(
                      (s, o) => s + (o.votes_count || 0),
                      0,
                    )}{" "}
                    votes
                  </div>
                  <Link
                    href={`/admin/polls/${p.id}/edit`}
                    className="text-cyan-400 text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
