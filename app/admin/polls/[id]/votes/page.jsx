"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VotesPage() {
  const params = useParams();
  const id = params?.id;
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/polls/${id}/votes?page=${page}&per_page=50`)
      .then((r) => r.json())
      .then((d) => setVotes(d.votes || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id, page]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Votes</h1>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-2">
          {votes.length === 0 ? (
            <div className="text-gray-400">No votes</div>
          ) : (
            votes.map((v) => (
              <div key={v.id} className="bg-[#0b0f19] p-3 rounded">
                <div className="text-sm text-gray-300">
                  Option: {v.option_label}
                </div>
                <div className="text-xs text-gray-500">
                  By: {v.user_id ? `user:${v.user_id}` : v.voter_token} ·{" "}
                  {new Date(v.created_at).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">IP: {v.ip}</div>
                <div className="text-xs text-gray-500">UA: {v.user_agent}</div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-[#111827] rounded"
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-[#111827] rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
