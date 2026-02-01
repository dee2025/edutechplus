"use client";

import { useEffect, useState } from "react";

export default function CountryWantToKnowPage() {
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState("");
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Voter token is now issued by the server as an HttpOnly cookie; client-side JS must not set it.

  async function loadPoll() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/polls`, { credentials: "same-origin" });
      const data = await res.json();
      if (!data || !data.polls || data.polls.length === 0) {
        setError("No polls available");
        setLoading(false);
        return;
      }
      // pick the first (latest) poll
      const p = data.polls[0];
      const details = await (
        await fetch(`/api/polls/${p.id}`, { credentials: "same-origin" })
      ).json();
      setPoll(details.poll);
      setOptions(details.options || []);
      setVoted(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load poll");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPoll();
  }, []);

  function totalVotes(arr) {
    return (arr || []).reduce((s, o) => s + (o.votes_count || 0), 0);
  }

  function percent(votes) {
    const t = totalVotes(options);
    if (!t) return 0;
    return Math.round((votes / t) * 100);
  }

  async function handleVote() {
    if (!selected || !poll) return;
    try {
      const res = await fetch(`/api/polls/${poll.id}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_id: selected }),
      });

      if (res.status === 409) {
        // already voted
        setVoted(true);
        // fetch fresh snapshot
        const snapshot = await (
          await fetch(`/api/polls/${poll.id}`, { credentials: "same-origin" })
        ).json();
        setOptions(snapshot.options || []);
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        setError(`Vote failed: ${txt}`);
        return;
      }

      const body = await res.json();
      setOptions(body.options || []);
      setVoted(true);
    } catch (err) {
      console.error(err);
      setError("Vote failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse bg-[#0b0f19] rounded-xl p-6 h-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-[#0b0f19] rounded-xl p-6">
            <div className="text-red-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-[#020617] text-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-[#0b0f19] rounded-xl p-6">No poll</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Country want to know</h1>
        <p className="text-gray-400 mb-6">
          Answer the poll and see live percentages.
        </p>

        <div className="bg-[#0b0f19] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{poll.question}</h2>

          <div className="space-y-3 mb-4">
            {options.map((o) => (
              <label
                key={o.id}
                className={`flex items-center justify-between gap-4 w-full p-3 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-700 ${
                  selected === String(o.id) ? "bg-[#111827]" : "bg-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="poll"
                    value={o.id}
                    checked={selected === String(o.id)}
                    onChange={() => setSelected(String(o.id))}
                    className="accent-cyan-400"
                    disabled={voted}
                  />
                  <span className="font-medium">{o.label}</span>
                </div>

                {voted ? (
                  <div className="w-1/2 text-right">
                    <div className="text-sm text-gray-300">
                      {percent(o.votes_count)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {o.votes_count} votes
                    </div>
                  </div>
                ) : null}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {!voted ? (
              <>
                <button
                  onClick={handleVote}
                  className={`px-5 py-2 rounded-full bg-cyan-400 text-black font-semibold disabled:opacity-50`}
                  disabled={!selected}
                >
                  Vote
                </button>
                <button
                  onClick={() => setSelected("")}
                  className="px-4 py-2 rounded-full bg-[#111827] text-gray-300"
                >
                  Clear
                </button>
              </>
            ) : (
              <div className="w-full">
                <div className="text-sm text-gray-400 mb-3">
                  Results (total votes: {totalVotes(options)})
                </div>
                <div className="space-y-3">
                  {options.map((o) => {
                    const p = percent(o.votes_count);
                    return (
                      <div key={o.id} className="">
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span>{o.label}</span>
                          <span>{p}%</span>
                        </div>
                        <div className="bg-[#07111a] rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full bg-cyan-400 transition-all ease-in-out duration-500`}
                            style={{ width: `${p}%` }}
                            aria-hidden
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
