import { useState } from "react";
import {
  BrainIcon,
  SwordIcon,
  CrossedSwordsIcon,
  ShieldIcon,
  PaletteIcon,
  LeafIcon,
  FlameIcon,
  SparklesIcon,
  TrophyIcon,
  TargetIcon,
  QuestScrollIcon,
} from "./Icons.jsx";

const ARCHETYPE_ICONS = {
  intellect: BrainIcon,
  strength: CrossedSwordsIcon,
  discipline: ShieldIcon,
  creativity: PaletteIcon,
  vitality: LeafIcon,
  polymath: SparklesIcon,
};

const ARCHETYPE_THEME_COLORS = {
  indigo: {
    badge: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
    glow: "shadow-indigo-500/20",
    text: "text-indigo-400",
    bar: "bg-indigo-500",
  },
  rose: {
    badge: "border-rose-500/40 bg-rose-500/10 text-rose-400",
    glow: "shadow-rose-500/20",
    text: "text-rose-400",
    bar: "bg-rose-500",
  },
  amber: {
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    glow: "shadow-amber-500/20",
    text: "text-amber-400",
    bar: "bg-amber-500",
  },
  purple: {
    badge: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    glow: "shadow-purple-500/20",
    text: "text-purple-400",
    bar: "bg-purple-500",
  },
  emerald: {
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    glow: "shadow-emerald-500/20",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
};

const LEVEL_CLASSES = [
  "bg-ink/5 dark:bg-ink/10 border-hairline/60 hover:border-ink/30",
  "bg-emerald-500/30 border-emerald-500/40 hover:bg-emerald-500/45",
  "bg-emerald-500/55 border-emerald-500/60 hover:bg-emerald-500/70",
  "bg-emerald-500/80 border-emerald-400 shadow-sm hover:bg-emerald-500",
  "bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-500/30 hover:bg-emerald-300",
];

export default function ActivityHeatmap({ analytics, loading }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface/80 backdrop-blur-md p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 skeleton rounded-md" />
          <div className="h-5 w-24 skeleton rounded-md" />
        </div>
        <div className="h-28 w-full skeleton rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const {
    totalCompleted = 0,
    activeDaysPast16Weeks = 0,
    streak = { current: 0, longest: 0 },
    archetype = {
      key: "polymath",
      title: "Polymath Ascendant",
      subtitle: "Harmonious Sovereign of All Arts",
      description: "A balanced soul advancing mind, body, spirit, and craft.",
      color: "amber",
    },
    heatmap = [],
  } = analytics;

  const ArchetypeIcon = ARCHETYPE_ICONS[archetype.key] || SparklesIcon;
  const themeStyles = ARCHETYPE_THEME_COLORS[archetype.color] || ARCHETYPE_THEME_COLORS.amber;

  // Group the 112 days into 16 week columns of 7 days
  const weeks = [];
  const WEEKS_COUNT = Math.ceil(heatmap.length / 7);
  for (let w = 0; w < WEEKS_COUNT; w++) {
    weeks.push(heatmap.slice(w * 7, (w + 1) * 7));
  }

  // Find month transitions for headers
  const monthLabels = [];
  let lastMonth = "";
  weeks.forEach((week, wIdx) => {
    if (week.length > 0) {
      const firstDayDate = new Date(week[0].date);
      const monthName = firstDayDate.toLocaleDateString("en-US", { month: "short" });
      if (monthName !== lastMonth) {
        monthLabels.push({ index: wIdx, label: monthName });
        lastMonth = monthName;
      }
    }
  });

  function formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="rounded-2xl border border-hairline bg-surface/70 backdrop-blur-md p-6 sm:p-7 shadow-sm space-y-6">
      {/* Top Banner: Archetype & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-hairline">
        <div className="flex items-start gap-4">
          <div
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center shrink-0 shadow-lg ${themeStyles.badge} ${themeStyles.glow}`}
          >
            <ArchetypeIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-hairline bg-paper/60 text-mute">
                RPG Archetype
              </span>
              <h2 className="font-display text-xl sm:text-2xl text-ink font-semibold tracking-tight">
                {archetype.title}
              </h2>
            </div>
            <p className={`text-xs sm:text-sm font-medium ${themeStyles.text}`}>
              {archetype.subtitle}
            </p>
            <p className="text-xs text-mute max-w-xl leading-relaxed">
              {archetype.description}
            </p>
          </div>
        </div>

        {/* Quick Consistency Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 shrink-0">
          <div className="p-3 rounded-xl border border-hairline bg-paper/40">
            <div className="flex items-center gap-1.5 text-xs text-mute">
              <FlameIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Current Streak</span>
            </div>
            <p className="font-display text-lg sm:text-xl font-bold text-ink mt-0.5">
              {streak.current} <span className="text-xs font-normal text-mute">days</span>
            </p>
          </div>

          <div className="p-3 rounded-xl border border-hairline bg-paper/40">
            <div className="flex items-center gap-1.5 text-xs text-mute">
              <TrophyIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Best Streak</span>
            </div>
            <p className="font-display text-lg sm:text-xl font-bold text-ink mt-0.5">
              {streak.longest} <span className="text-xs font-normal text-mute">days</span>
            </p>
          </div>

          <div className="p-3 rounded-xl border border-hairline bg-paper/40">
            <div className="flex items-center gap-1.5 text-xs text-mute">
              <TargetIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active (16w)</span>
            </div>
            <p className="font-display text-lg sm:text-xl font-bold text-ink mt-0.5">
              {activeDaysPast16Weeks} <span className="text-xs font-normal text-mute">days</span>
            </p>
          </div>

          <div className="p-3 rounded-xl border border-hairline bg-paper/40">
            <div className="flex items-center gap-1.5 text-xs text-mute">
              <QuestScrollIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Conquered</span>
            </div>
            <p className="font-display text-lg sm:text-xl font-bold text-ink mt-0.5">
              {totalCompleted} <span className="text-xs font-normal text-mute">quests</span>
            </p>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-mute">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-ink/80 uppercase tracking-wider text-[11px]">
              Quest Activity Heatmap (Past 16 Weeks)
            </span>
          </div>
          {hoveredDay ? (
            <div className="font-mono text-xs text-ink/90 flex items-center gap-1.5 bg-paper/80 px-2 py-0.5 rounded border border-hairline">
              <span className="font-semibold text-emerald-400">
                {hoveredDay.count} quest{hoveredDay.count === 1 ? "" : "s"}
              </span>
              <span className="text-mute">•</span>
              <span>{formatDisplayDate(hoveredDay.date)}</span>
            </div>
          ) : (
            <span className="text-mute hidden sm:inline text-[11px]">
              Hover squares to inspect completed quests
            </span>
          )}
        </div>

        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex text-[10px] text-mute mb-1.5 pl-6 select-none">
              {weeks.map((week, idx) => {
                const labelObj = monthLabels.find((m) => m.index === idx);
                return (
                  <div key={idx} className="w-3.5 sm:w-4 text-center mr-1">
                    {labelObj ? labelObj.label : ""}
                  </div>
                );
              })}
            </div>

            {/* Heatmap Columns with Weekday Labels */}
            <div className="flex items-start">
              {/* Day-of-week labels */}
              <div className="flex flex-col justify-between text-[9px] text-mute pr-2 h-[106px] select-none shrink-0 py-0.5">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>

              {/* Grid of Weeks */}
              <div className="flex gap-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <button
                        key={day.date}
                        type="button"
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => setHoveredDay(day)}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] border transition-transform duration-150 hover:scale-125 hover:z-20 focus:outline-none ${
                          LEVEL_CLASSES[day.level] || LEVEL_CLASSES[0]
                        }`}
                        title={`${day.count} quests on ${day.date}`}
                        aria-label={`${day.count} quests completed on ${day.date}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-mute pt-2">
          <span>{activeDaysPast16Weeks} questing days in the last 112 days</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {LEVEL_CLASSES.map((cls, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-[2px] border ${cls.split(" ")[0]} ${cls.split(" ")[1]}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* commit_stage_65_xzen */
