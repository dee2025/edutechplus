"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditPollPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [options, setOptions] = useState([]); // { id?, label, votes_count, sort_order }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/polls/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.poll) {
          setQuestion(data.poll.question || "");
          setSlug(data.poll.slug || "");
          setIsActive(Boolean(data.poll.is_active));
          setStartAt(
            data.poll.start_at
              ? new Date(data.poll.start_at).toISOString().slice(0, 16)
              : "",
          );
          setEndAt(
            data.poll.end_at
              ? new Date(data.poll.end_at).toISOString().slice(0, 16)
              : "",
          );
          setOptions(
            (data.options || []).map((o) => ({
              id: o.id,
              label: o.label,
              votes_count: o.votes_count,
              sort_order: o.sort_order,
            })),
          );
        } else {
          setError("Poll not found");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load");
      })
      .finally(() => setLoading(false));
  }, [id]);

  function updateOption(idx, val) {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, label: val } : o)),
    );
  }

  function updateSortOrder(idx, val) {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, sort_order: Number(val) } : o)),
    );
  }
  function addOption() {
    setOptions((prev) => [...prev, { label: "" }]);
  }

  function removeOption(idx) {
    if ((options || []).length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    const cleaned = options
      .map((o, i) => ({
        id: o.id,
        label: (o.label || "").trim(),
        sort_order: o.sort_order ?? i,
      }))
      .filter((o) => o.label.length > 0);
    if (!question.trim()) return setError("Question is required");
    if (cleaned.length < 2) return setError("At least 2 options required");

    setSaving(true);
    try {
      const payload = {
        question: question.trim(),
        slug: slug.trim() || null,
        is_active: isActive ? 1 : 0,
        start_at: startAt || null,
        end_at: endAt || null,
        options: cleaned,
        forceDelete,
      };
      const res = await fetch(`/api/admin/polls/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(`Save failed: ${txt}`);
        setSaving(false);
        return;
      }
      router.push("/admin/polls");
    } catch (err) {
      console.error(err);
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this poll? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/polls/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        setError(`Delete failed: ${txt}`);
        return;
      }
      router.push("/admin/polls");
    } catch (err) {
      console.error(err);
      setError("Delete failed");
    }
  }

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Edit Poll</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Question</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 rounded bg-[#07111a]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-3 rounded bg-[#07111a]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Active</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-cyan-400"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm text-gray-300">Is active</span>
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Start at</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full p-2 rounded bg-[#07111a]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">End at</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full p-2 rounded bg-[#07111a]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-300">Options</label>
              <button
                type="button"
                onClick={addOption}
                className="text-xs text-cyan-400"
              >
                Add
              </button>
              <button
                type="button"
                onClick={async () => {
                  // trigger recount
                  setLoading(true);
                  const res = await fetch(`/api/admin/polls/${id}/recount`, {
                    method: "POST",
                  });
                  if (res.ok) {
                    const data = await fetch(`/api/admin/polls/${id}`);
                    const fresh = await data.json();
                    setOptions(
                      (fresh.options || []).map((o) => ({
                        id: o.id,
                        label: o.label,
                        votes_count: o.votes_count,
                        sort_order: o.sort_order,
                      })),
                    );
                  }
                  setLoading(false);
                }}
                className="text-xs text-yellow-400"
              >
                Recount
              </button>
              <a
                href={`/admin/polls/${id}/votes`}
                className="text-xs text-cyan-300"
              >
                View votes
              </a>
            </div>
          </div>

          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={opt.label}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 p-2 rounded bg-[#07111a]"
                />
                <input
                  type="number"
                  value={opt.sort_order || 0}
                  onChange={(e) => updateSortOrder(i, e.target.value)}
                  className="w-20 p-2 rounded bg-[#07111a] text-sm"
                />
                <div className="text-xs text-gray-400">
                  {opt.votes_count || 0} votes
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 2}
                  className="px-3 bg-[#111827] rounded text-gray-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={forceDelete}
              onChange={(e) => setForceDelete(e.target.checked)}
              className="accent-yellow-400"
            />
            <span className="text-xs text-gray-300">
              Force delete options with votes
            </span>
          </label>
        </div>

        {error ? <div className="text-red-400">{error}</div> : null}

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            type="submit"
            className="px-4 py-2 rounded bg-cyan-400 text-black font-semibold"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
