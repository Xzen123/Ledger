import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import TaskCard from "../components/TaskCard.jsx";
import { TaskCardSkeleton } from "../components/Skeletons.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import LevelUpModal from "../components/LevelUpModal.jsx";
import { ATTRIBUTE_META } from "../lib/attributes.js";
import { triggerParticles } from "../lib/particles.js";
import { playInscribeQuest, playQuestComplete, playLevelUp, playClick } from "../lib/sound.js";
import {
  QuestScrollIcon,
  SwordIcon,
  LightningIcon,
  GoldCoinIcon,
  AttributeIcon,
  SparklesIcon,
} from "../components/Icons.jsx";

const DIFFICULTIES = ["easy", "medium", "hard", "epic"];
const FILTERS = [
  { key: "pending", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

const QUEST_PRESETS = [
  { label: "Workout", title: "Gym & Strength Training", attribute: "strength", difficulty: "hard" },
  { label: "Deep Study", title: "Deep Focus Coding & Learning", attribute: "intellect", difficulty: "medium" },
  { label: "Morning Routine", title: "Tidy Sanctuary & Morning Routine", attribute: "discipline", difficulty: "easy" },
  { label: "Hydrate", title: "Drink 2 Liters of Water", attribute: "vitality", difficulty: "easy" },
  { label: "Creativity", title: "Creative Writing or Art Practice", attribute: "creativity", difficulty: "medium" },
];

const DIFFICULTY_CONFIG = {
  easy: {
    label: "Easy",
    xp: 15,
    gold: 5,
    tag: "Minor Habit",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    active: "border-emerald-500 bg-emerald-500/15 shadow-sm ring-2 ring-emerald-500/30",
  },
  medium: {
    label: "Medium",
    xp: 35,
    gold: 12,
    tag: "Solid Quest",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    active: "border-indigo-500 bg-indigo-500/15 shadow-sm ring-2 ring-indigo-500/30",
  },
  hard: {
    label: "Hard",
    xp: 70,
    gold: 25,
    tag: "Challenging",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    active: "border-amber-500 bg-amber-500/15 shadow-sm ring-2 ring-amber-500/30",
  },
  epic: {
    label: "Epic",
    xp: 140,
    gold: 55,
    tag: "Monumental",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    active: "border-rose-500 bg-rose-500/15 shadow-sm ring-2 ring-rose-500/30",
  },
};

const ATTRIBUTES_LIST = ["intellect", "strength", "discipline", "creativity", "vitality"];

export default function Tasks() {
  const { setCharacter } = useAuth();
  const { showFlagToast } = useToast();
  const [tasks, setTasks] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState(null);
  const [newLevel, setNewLevel] = useState(null);

  const [form, setForm] = useState({ title: "", attribute: "discipline", difficulty: "medium", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTasks(null);
    api
      .listTasks(filter === "all" ? undefined : filter)
      .then((data) => !cancelled && setTasks(data.tasks))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [filter]);

  function applyPreset(preset) {
    playClick();
    setForm({
      title: preset.title,
      attribute: preset.attribute,
      difficulty: preset.difficulty,
      notes: "",
    });
    triggerParticles({ count: 14 });
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Give your quest a title first.");
      return;
    }
    setSubmitting(true);
    setError("");

    // Optimistic insert with a temporary id.
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      title: form.title.trim(),
      notes: form.notes,
      attribute: form.attribute,
      difficulty: form.difficulty,
      status: "pending",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    if (filter !== "completed") {
      setTasks((prev) => [optimisticTask, ...(prev || [])]);
    }

    try {
      const data = await api.createTask({
        title: form.title.trim(),
        attribute: form.attribute,
        difficulty: form.difficulty,
        notes: form.notes || undefined,
      });
      playInscribeQuest();
      setTasks((prev) => (prev || []).map((t) => (t.id === tempId ? data.task : t)));
      setForm({ title: "", attribute: "discipline", difficulty: "medium", notes: "" });
      setShowNotes(false);
      triggerParticles({ count: 20 });
    } catch (err) {
      setTasks((prev) => (prev || []).filter((t) => t.id !== tempId));
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id, updates) {
    const prevTasks = tasks;
    setTasks((prev) =>
      (prev || []).map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    try {
      const data = await api.updateTask(id, updates);
      setTasks((prev) =>
        (prev || []).map((t) => (t.id === id ? data.task : t))
      );
    } catch (err) {
      setTasks(prevTasks);
      setError(err.message);
      throw err;
    }
  }

  async function handleComplete(task) {
    setCompletingId(task.id);
    setError("");
    const prevTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: "completed" } : t))
    );

    try {
      const data = await api.completeTask(task.id);
      setCharacter(data.character);

      if (data.antiCheat?.flagged) {
        showFlagToast({
          durationSeconds: data.antiCheat.durationSeconds,
          flags: data.antiCheat.flags,
          maxFlags: data.antiCheat.maxFlags,
          aiAgent: data.antiCheat.aiAgent,
        });
      }

      if (!data.antiCheat?.flagged) {
        triggerParticles();
      }

      if (data.rewards.levelsGained > 0) {
        playLevelUp();
        setNewLevel(data.character.level);
        setTimeout(() => triggerParticles({ count: 54 }), 300);
      } else if (!data.antiCheat?.flagged) {
        playQuestComplete();
      }
      if (filter === "pending") {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
      } else {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
      }
    } catch (err) {
      setTasks(prevTasks);
      setError(err.message);
    } finally {
      setCompletingId(null);
    }
  }

  async function handleDelete(task) {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await api.deleteTask(task.id);
    } catch (err) {
      setTasks(prevTasks);
      setError(err.message);
    }
  }

  const curDiff = DIFFICULTY_CONFIG[form.difficulty] || DIFFICULTY_CONFIG.medium;

  return (
    <div className="space-y-8">
      <LevelUpModal newLevel={newLevel} onClose={() => setNewLevel(null)} />

      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">Quest Log</h1>
        <p className="text-mute text-sm mt-1">Conquer real-world commitments and build your legend.</p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {/* ========================================================================= */}
      {/* 📜 GUILD QUEST INSCRIBER (RPG Quest Creation Chamber) */}
      {/* ========================================================================= */}
      <div className="rpg-glass rounded-2xl border-2 border-hairline/80 p-5 sm:p-7 shadow-md relative overflow-hidden transition-all">
        {/* Decorative faint background watermark */}
        <div
          className="absolute -right-8 -bottom-8 w-44 h-44 opacity-5 pointer-events-none select-none text-ink flex items-center justify-center"
          aria-hidden="true"
        >
          <QuestScrollIcon className="w-36 h-36" />
        </div>

        {/* Header with Title & Live Reward HUD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-soft/80 border border-amber/30 flex items-center justify-center text-amber">
                <QuestScrollIcon className="w-4 h-4" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-ink tracking-tight">
                Inscribe a Quest
              </h2>
            </div>
            <p className="text-xs text-mute">
              Establish a personal contract and pledge bounties for real-world discipline.
            </p>
          </div>

          {/* Live Bounty Calculator Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper border border-hairline shadow-2xs self-start sm:self-auto">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Bounty:</span>
            <span className="text-xs font-semibold text-indigo flex items-center gap-1">
              <LightningIcon className="w-3.5 h-3.5" />
              <span>+{curDiff.xp} XP</span>
            </span>
            <span className="text-hairline">•</span>
            <span className="text-xs font-semibold text-amber flex items-center gap-1">
              <GoldCoinIcon className="w-3.5 h-3.5" />
              <span>{curDiff.gold}g</span>
            </span>
          </div>
        </div>

        {/* Quick Inspiration Chips */}
        <div className="pt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-medium text-mute shrink-0 flex items-center gap-1">
            <SparklesIcon className="w-3.5 h-3.5 text-amber" />
            <span>Inspiration:</span>
          </span>
          {QUEST_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-paper border border-hairline hover:border-indigo/40 hover:bg-surface text-[11px] text-mute hover:text-ink transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <AttributeIcon name={p.attribute} className="w-3 h-3 text-indigo" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Quest Inscription Form */}
        <form onSubmit={handleAdd} className="mt-4 space-y-5">
          {/* Quest Title Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center justify-between">
              <span>Quest Objective</span>
              <span className="text-[10px] text-mute font-normal lowercase">
                {form.title.length}/140 chars
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="What endeavor will you conquer? (e.g. Read 20 pages, 45min workout, ship PR)"
                className="w-full border border-hairline rounded-xl px-3.5 py-3 text-sm bg-paper text-ink placeholder:text-mute/60 focus:border-indigo focus:ring-2 focus:ring-indigo/20 transition-all"
                maxLength={140}
              />
            </div>
          </div>

          {/* Target RPG Attribute (Tactile Cards) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
              Pledged RPG Attribute
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ATTRIBUTES_LIST.map((key) => {
                const meta = ATTRIBUTE_META[key];
                const isSelected = form.attribute === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, attribute: key }))}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-surface border-indigo ring-2 ring-indigo/30 shadow-xs"
                        : "bg-paper/70 border-hairline hover:border-hairline/80 hover:bg-surface"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "bg-indigo-soft text-indigo" : "bg-surface text-mute"
                      }`}
                    >
                      <AttributeIcon name={key} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink truncate leading-none">
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-mute truncate mt-1">
                        +Attribute pts
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Bounty Selector (Tactile Cards with Live Rewards) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
              Difficulty & Bounty Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DIFFICULTIES.map((d) => {
                const cfg = DIFFICULTY_CONFIG[d];
                const isSelected = form.difficulty === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSelected ? cfg.active : "bg-paper/70 border-hairline hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display font-semibold text-xs text-ink capitalize">
                        {cfg.label}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${cfg.color}`}>
                        {cfg.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs pt-1">
                      <span className="font-semibold text-indigo flex items-center gap-0.5 text-[11px]">
                        <LightningIcon className="w-3 h-3" />
                        <span>+{cfg.xp} XP</span>
                      </span>
                      <span className="text-hairline">•</span>
                      <span className="font-semibold text-amber flex items-center gap-0.5 text-[11px]">
                        <GoldCoinIcon className="w-3 h-3" />
                        <span>{cfg.gold}g</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expandable Notes / Lore Field */}
          <div>
            {!showNotes ? (
              <button
                type="button"
                onClick={() => setShowNotes(true)}
                className="text-xs text-mute hover:text-indigo transition-colors flex items-center gap-1 py-1"
              >
                <span>+ Add quest lore / sub-goals (optional)</span>
              </button>
            ) : (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs text-mute">
                  <span className="font-medium">Quest Lore & Notes</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotes(false);
                      setForm((f) => ({ ...f, notes: "" }));
                    }}
                    className="hover:text-ink text-[11px]"
                  >
                    Remove notes
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional details, checklist steps, or motivational lore for this quest…"
                  className="w-full border border-hairline rounded-xl p-3 text-xs bg-paper text-ink placeholder:text-mute/60 focus:border-indigo focus:ring-2 focus:ring-indigo/20 transition-all"
                />
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-hairline">
            <p className="text-xs text-mute text-center sm:text-left">
              Pledging <strong className="text-ink font-medium">{form.title ? `"${form.title}"` : "this quest"}</strong> grants{" "}
              <span className="text-indigo font-semibold">+{curDiff.xp} XP</span> and{" "}
              <span className="text-amber font-semibold">{curDiff.gold} Gold</span> upon completion.
            </p>

            <button
              type="submit"
              disabled={submitting || !form.title.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-ink text-paper font-semibold text-xs tracking-wide disabled:opacity-50 hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-sm border border-amber/40"
            >
              <SwordIcon className="w-3.5 h-3.5 text-amber" />
              <span>{submitting ? "Inscribing…" : "Inscribe Quest"}</span>
            </button>
          </div>
        </form>
      </div>

      <div>
        <div role="tablist" aria-label="Filter quests" className="flex gap-1 border-b border-hairline mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 text-sm -mb-px border-b-2 ${
                filter === f.key ? "border-ink text-ink font-medium" : "border-transparent text-mute"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {tasks === null && (
          <div className="space-y-3">
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </div>
        )}

        {tasks && tasks.length === 0 && (
          <p className="text-sm text-mute py-8 text-center">
            {filter === "completed" ? "No completed quests yet." : "No quests here. Add one above to get started."}
          </p>
        )}

        {tasks && tasks.length > 0 && (
          <ul className="space-y-3">
            <AnimatePresence>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  completing={completingId === task.id}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

/* commit_stage_42_ayush */
