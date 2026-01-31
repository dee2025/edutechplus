"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function StreakCalendar({ days = 180 }) {
  const [data, setData] = useState({ counts: {}, total: 0 });
  const [synced, setSynced] = useState(false);
  const [summary, setSummary] = useState({ best: 0, current: 0 });
  const [hoverInfo, setHoverInfo] = useState(null);
  const containerRef = useRef(null);

  // fetch server data with validation/sanitization, fallback to localStorage
  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const res = await fetch(`/api/auth/reads?days=${days}`, {
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error("no-auth");
        const json = await res.json();

        // sanitize counts object
        const raw = json.counts || {};
        const counts = {};
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days + 1);
        const cutoffKey = cutoff.toISOString().slice(0, 10);

        let total = 0;
        for (const k of Object.keys(raw)) {
          if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(k)) continue;
          const v = parseInt(raw[k], 10);
          if (Number.isNaN(v) || v <= 0) continue;
          if (k < cutoffKey) continue; // ignore older than window
          counts[k] = Math.max(0, v);
          total += counts[k];
        }

        if (canceled) return;
        setData({ counts, total: Number(json.total) || total });
        setSynced(true);

        try {
          const sres = await fetch(
            `/api/auth/reads?days=${days}&summary=streak`,
            { credentials: "same-origin" },
          );
          if (sres.ok) {
            const sj = await sres.json();
            if (!canceled)
              setSummary({
                best: sj.best_streak || 0,
                current: sj.current_streak || 0,
              });
          }
        } catch (e) {
          // ignore
        }
        return;
      } catch (err) {
        // fallback to localStorage
      }

      // fallback: derive counts from localStorage recent_articles
      try {
        const rawLs = localStorage.getItem("recent_articles");
        const list = rawLs ? JSON.parse(rawLs) : [];
        const counts = {};
        const cutoffTs = Date.now() - days * 24 * 60 * 60 * 1000;
        let total = 0;
        for (const it of list) {
          if (!it.ts) continue;
          if (it.ts < cutoffTs) continue;
          const key = new Date(it.ts).toISOString().slice(0, 10);
          counts[key] = (counts[key] || 0) + 1;
          total += 1;
        }
        if (!canceled) setData({ counts, total });
      } catch (e) {
        if (!canceled) setData({ counts: {}, total: 0 });
      }
    }

    load();
    return () => (canceled = true);
  }, [days]);

  const { counts, total } = data;

  const today = startOfDay(new Date());
  const dayList = useMemo(() => {
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDate(d);
      const c = counts[key] || 0;
      arr.push({
        date: d,
        key,
        count: Number.isFinite(c) ? Math.max(0, Math.floor(c)) : 0,
      });
    }
    return arr;
  }, [counts, days, today]);

  // compute streak: consecutive days ending today with count > 0
  const streak = useMemo(() => {
    let s = 0;
    for (let i = dayList.length - 1; i >= 0; i--) {
      if (dayList[i].count > 0) s += 1;
      else break;
    }
    return s;
  }, [dayList]);

  // map days into weeks (columns)
  const weeks = useMemo(() => {
    const cols = Math.ceil(days / 7);
    const w = [];
    for (let c = 0; c < cols; c++) {
      const col = [];
      for (let r = 0; r < 7; r++) {
        const index = c * 7 + r;
        if (index < dayList.length) col.push(dayList[index]);
      }
      w.push(col);
    }
    return w;
  }, [dayList, days]);

  function levelForCount(count) {
    const n = Math.max(0, Number(count) || 0);
    if (!n) return 0;
    if (n === 1) return 1;
    if (n <= 2) return 2;
    if (n <= 4) return 3;
    return 4;
  }

  const colorClass = (lvl) => {
    switch (lvl) {
      case 1:
        return "bg-green-700";
      case 2:
        return "bg-green-600";
      case 3:
        return "bg-green-500";
      case 4:
        return "bg-cyan-400";
      default:
        return "bg-transparent";
    }
  };

  // month labels
  const monthLabels = useMemo(() => {
    const labels = Array(weeks.length).fill("");
    const names = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let lastMonth = -1;
    for (let i = 0; i < weeks.length; i++) {
      const col = weeks[i];
      const firstDay = col.find(Boolean);
      if (!firstDay) continue;
      const m = firstDay.date.getMonth();
      const y = firstDay.date.getFullYear();
      if (m !== lastMonth) {
        labels[i] = `${names[m]} ${y}`;
        lastMonth = m;
      }
    }
    return labels;
  }, [weeks]);

  // hover handlers for tooltip (keyboard + mouse)
  function showTooltip(e, day) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    const containerLeft = containerRect?.left ?? 0;
    const containerWidth = containerRect?.width ?? window.innerWidth;

    const centerX = rect.left + rect.width / 2 - containerLeft;

    // assume tooltip width approx 160px for clamping (good for small text)
    const tooltipWidth = 160;
    let left = centerX;
    let leftPx = Math.round(
      Math.min(
        Math.max(left - tooltipWidth / 2, 8),
        containerWidth - tooltipWidth - 8,
      ),
    );

    // decide above or below depending on space
    const spaceAbove = rect.top - (containerRect?.top ?? 0);
    const spaceBelow =
      (containerRect?.bottom ?? window.innerHeight) - rect.bottom;
    const placement =
      spaceAbove > 48 || spaceAbove > spaceBelow ? "top" : "bottom";

    const top =
      placement === "top"
        ? Math.round(rect.top - (containerRect?.top ?? 0) - 8)
        : Math.round(rect.bottom - (containerRect?.top ?? 0) + 8);

    setHoverInfo({ day, left: leftPx + tooltipWidth / 2, top, placement });
  }
  function hideTooltip() {
    setHoverInfo(null);
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const onScroll = () => hideTooltip();
    const onResize = () => hideTooltip();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-100">
            Reading streak
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="text-lg font-bold text-cyan-400">
              {synced ? summary.current || 0 : streak} day
              {(synced ? summary.current || 0 : streak) !== 1 ? "s" : ""}
            </div>

            {synced && (
              <div className="text-xs text-green-400">
                Server: {summary.current}d · best {summary.best}d
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-gray-100">Score</div>
          <div className="text-xs text-gray-400">{total} reads</div>
        </div>
      </div>

      {!synced && (
        <div className="mb-3 text-xs text-yellow-300">
          Log in to sync your streak across devices
        </div>
      )}

      {/* Calendar */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-max">
          {/* Month labels */}
          <div className="flex gap-1 mb-1">
            {monthLabels.map((lab, i) => (
              <div
                key={i}
                className="w-3 sm:w-4 text-[10px] text-gray-400 text-center"
                style={{ lineHeight: "12px" }}
              >
                {lab ? lab.split(" ")[0] : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, ri) => {
                  const day = col[ri];
                  if (!day)
                    return <div key={ri} className="w-3 h-3 sm:w-4 sm:h-4" />;
                  const lvl = levelForCount(day.count);
                  const cls = lvl
                    ? `${colorClass(lvl)} border border-gray-700`
                    : "bg-[#020617] border border-gray-700";
                  const title = `${day.key}: ${day.count} read${day.count !== 1 ? "s" : ""}`;
                  return (
                    <button
                      key={ri}
                      aria-label={title}
                      onMouseEnter={(e) => showTooltip(e, day)}
                      onMouseLeave={hideTooltip}
                      onFocus={(e) => showTooltip(e, day)}
                      onBlur={hideTooltip}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm focus:outline-none ${cls} hover:scale-110 transition-transform duration-150`}
                      style={{
                        boxShadow: lvl
                          ? "inset 0 0 0 1px rgba(255,255,255,0.02)"
                          : undefined,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoverInfo && (
        <div
          className="streak-tooltip absolute z-50 px-2 py-2 rounded bg-[#0b1320] text-xs text-gray-200 border border-gray-700 shadow-lg"
          style={{
            left: hoverInfo.left,
            top: hoverInfo.top,
            transform:
              hoverInfo.placement === "top"
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0)",
            pointerEvents: "auto",
            minWidth: 140,
          }}
        >
          <div className="font-semibold">{hoverInfo.day.key}</div>
          <div className="text-xs text-gray-400">
            {hoverInfo.day.count} read{hoverInfo.day.count !== 1 ? "s" : ""}
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              top: hoverInfo.placement === "top" ? "100%" : undefined,
              bottom: hoverInfo.placement === "bottom" ? "100%" : undefined,
              borderTop:
                hoverInfo.placement === "top" ? "6px solid #0b1320" : undefined,
              borderBottom:
                hoverInfo.placement === "bottom"
                  ? "6px solid #0b1320"
                  : undefined,
            }}
          />
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span className="mr-1">Less</span>

        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-transparent border border-gray-700" />
          <span>0</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-700" />
          <span>1</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <span>2</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>3–4</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-cyan-400" />
          <span>5+</span>
        </div>

        <span className="ml-1">More</span>
      </div>

      {/* Footer hint */}
      <div className="mt-3 text-xs text-gray-400">
        Read something daily to grow your streak. Score = total reads in the
        last {days} days.
      </div>
    </div>
  );
}
