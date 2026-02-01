"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePollPage() {
  const [question, setQuestion] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  function updateOption(idx, val) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(idx) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!question.trim()) return setError("Question is required");
    const cleaned = options
      .map((o, i) => ({ label: o.trim(), sort_order: i }))
      .filter((o) => o.label.length > 0);
    if (cleaned.length < 2) return setError("At least 2 options required");

    setLoading(true);
    try {
      const payload = {
        question,
        slug: slug.trim() || undefined,
        is_active: isActive ? 1 : 0,
        start_at: startAt || null,
        end_at: endAt || null,
        options: cleaned,
      };
      const res = await fetch(`/api/admin/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        setError(`Create failed: ${txt}`);
        setLoading(false);
        return;
      }

      const body = await res.json();
      router.push(`/admin/polls`);
    } catch (err) {
      console.error(err);
      setError("Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Poll</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm text-gray-300 mb-1">
              Slug (optional)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-3 rounded bg-[#07111a]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Active</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-cyan-400"
                />
                <span className="text-sm text-gray-300">Is active</span>
              </label>
            </div>
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
            <label className="text-sm text-gray-300">Options</label>
            <button
              type="button"
              onClick={addOption}
              className="text-xs text-cyan-400"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 p-2 rounded bg-[#07111a]"
                />
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

        {error ? <div className="text-red-400">{error}</div> : null}

        <div>
          <button
            disabled={loading}
            type="submit"
            className="px-4 py-2 rounded bg-cyan-400 text-black font-semibold"
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </form>
    </div>
  );
}
