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

export default function StreakCalendar({ days = 365 }) {
  const [data, setData] = useState({ counts: {}, total: 0 });
  const [synced, setSynced] = useState(false);
  const [summary, setSummary] = useState({ best: 0, current: 0 });
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

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

  // Available years for the filter
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 3; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, []);

  const today = startOfDay(new Date());

  // Generate days for selected year
  const dayList = useMemo(() => {
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);
    const now = new Date();
    const endDate = yearEnd > now ? now : yearEnd;

    const arr = [];
    let current = new Date(yearStart);

    while (current <= endDate) {
      const key = formatDate(current);
      const c = counts[key] || 0;
      arr.push({
        date: new Date(current),
        key,
        count: Number.isFinite(c) ? Math.max(0, Math.floor(c)) : 0,
      });
      current.setDate(current.getDate() + 1);
    }
    return arr;
  }, [counts, selectedYear]);

  // compute streak: consecutive days ending today with count > 0
  const streak = useMemo(() => {
    let s = 0;
    const now = formatDate(new Date());
    for (let i = dayList.length - 1; i >= 0; i--) {
      if (dayList[i].key > now) continue; // Skip future dates
      if (dayList[i].count > 0) s += 1;
      else break;
    }
    return s;
  }, [dayList]);

  // Create GitHub-style week columns
  const weeks = useMemo(() => {
    if (!dayList.length) return [];

    // Start from the first Sunday before or on the first day
    const firstDay = new Date(dayList[0].date);
    const startDay = new Date(firstDay);
    startDay.setDate(firstDay.getDate() - firstDay.getDay()); // Go to Sunday

    const cols = [];
    let currentWeek = [];
    let currentDate = new Date(startDay);
    const lastDay = dayList[dayList.length - 1].date;

    while (currentDate <= lastDay || currentWeek.length > 0) {
      const key = formatDate(currentDate);
      const dayData = dayList.find((d) => d.key === key);

      if (currentDate < dayList[0].date || currentDate > lastDay) {
        currentWeek.push(null); // Empty cell
      } else {
        currentWeek.push(
          dayData || { date: new Date(currentDate), key, count: 0 },
        );
      }

      if (currentWeek.length === 7) {
        cols.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      cols.push(currentWeek);
    }

    return cols;
  }, [dayList]);

  // Month labels for the weeks
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;

    weeks.forEach((week, idx) => {
      const firstDay = week.find((d) => d !== null);
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth && idx > 0) {
          labels.push({
            index: idx,
            month: firstDay.date.toLocaleDateString("en-US", {
              month: "short",
            }),
          });
          lastMonth = month;
        } else if (idx === 0) {
          labels.push({
            index: idx,
            month: firstDay.date.toLocaleDateString("en-US", {
              month: "short",
            }),
          });
          lastMonth = month;
        } else {
          labels.push(null);
        }
      } else {
        labels.push(null);
      }
    });

    return labels;
  }, [weeks]);

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
        return "bg-green-700 dark:bg-green-700";
      case 2:
        return "bg-green-600 dark:bg-green-600";
      case 3:
        return "bg-green-500 dark:bg-green-500";
      case 4:
        return "bg-cyan-500 dark:bg-cyan-400";
      default:
        return "bg-transparent";
    }
  };

  // hover handlers for tooltip (keyboard + mouse)
  function showTooltip(e, day) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    // Position tooltip near the cursor/element
    const left = rect.left + rect.width / 2;
    const top = rect.top - 8;

    setHoverInfo({ day, left, top });
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
      className="relative bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {synced ? summary.current || 0 : streak}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  day streak
                </span>
              </div>
              {synced && summary.best > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  🏆 Best: {summary.best} days
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {data.total || 0} reads
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              in {selectedYear}
            </div>
          </div>

          {/* Year filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 hover:border-cyan-400 dark:hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all cursor-pointer shadow-sm"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!synced && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
          <svg
            className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-xs text-yellow-800 dark:text-yellow-300">
            Log in to sync your streak
          </div>
        </div>
      )}

      {/* Calendar */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2 scroll-smooth"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(96, 165, 250) transparent",
        }}
      >
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex gap-0.75 mb-3 ml-7">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-[11px] font-medium text-gray-700 dark:text-gray-300"
                style={{ width: "10px" }}
              >
                {label ? label.month : ""}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="flex gap-0.75">
            {/* Day labels */}
            <div className="flex flex-col gap-0.75 pr-2">
              <div className="h-2.5 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Sun
              </div>
              <div className="h-2.5 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Mon
              </div>
              <div className="h-2.5 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Tue
              </div>
              <div className="h-2.5 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Wed
              </div>
              <div className="h-2.5 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Thu
              </div>
              <div className="h-2.5 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Fri
              </div>
              <div className="h-2.5 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                Sat
              </div>
            </div>

            {/* Week columns */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.75">
                {week.map((day, dayIdx) => {
                  if (!day) return <div key={dayIdx} className="w-2.5 h-2.5" />;

                  const lvl = levelForCount(day.count);
                  const cls = lvl
                    ? colorClass(lvl)
                    : "bg-gray-200 dark:bg-gray-700";

                  return (
                    <button
                      key={dayIdx}
                      aria-label={`${day.date.toDateString()}: ${day.count} reads`}
                      onMouseEnter={(e) => showTooltip(e, day)}
                      onMouseLeave={hideTooltip}
                      className={`w-2.5 h-2.5 rounded-sm ${cls} hover:ring-2 hover:ring-cyan-500 dark:hover:ring-cyan-400 hover:scale-125 transition-all duration-200 cursor-pointer`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 transition-transform hover:scale-110" />
            <div className="w-3 h-3 rounded border border-green-800 dark:border-green-600 bg-green-700 dark:bg-green-700 transition-transform hover:scale-110" />
            <div className="w-3 h-3 rounded border border-green-700 dark:border-green-500 bg-green-600 dark:bg-green-600 transition-transform hover:scale-110" />
            <div className="w-3 h-3 rounded border border-green-600 dark:border-green-400 bg-green-500 dark:bg-green-500 transition-transform hover:scale-110" />
            <div className="w-3 h-3 rounded border border-cyan-600 dark:border-cyan-300 bg-cyan-500 dark:bg-cyan-400 transition-transform hover:scale-110" />
          </div>
          <span>More</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          📊 Contribution graph
        </div>
      </div>

      {/* Tooltip - positioned fixed for better placement */}
      {hoverInfo && (
        <div
          className="fixed z-9999 px-3 py-2 rounded-lg bg-gray-900 dark:bg-gray-800 text-xs text-white shadow-2xl border border-gray-700 dark:border-gray-600 pointer-events-none animate-in fade-in zoom-in duration-150"
          style={{
            left: `${hoverInfo.left}px`,
            top: `${hoverInfo.top}px`,
            transform: "translate(-50%, calc(-100% - 8px))",
          }}
        >
          <div className="font-semibold whitespace-nowrap mb-1">
            {hoverInfo.day.count === 0
              ? "📖 No reads"
              : `📚 ${hoverInfo.day.count} read${hoverInfo.day.count !== 1 ? "s" : ""}`}
          </div>
          <div className="text-[10px] text-gray-300 dark:text-gray-400 whitespace-nowrap">
            📅{" "}
            {hoverInfo.day.date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-r border-b border-gray-700 dark:border-gray-600 transform -translate-x-1/2 rotate-45"></div>
        </div>
      )}
    </div>
  );
}
