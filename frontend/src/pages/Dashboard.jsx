import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import TaskCard from "../components/TaskCard.jsx";
import { TaskCardSkeleton } from "../components/Skeletons.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import LevelUpModal from "../components/LevelUpModal.jsx";
import { triggerParticles } from "../lib/particles.js";
import { playQuestComplete, playLevelUp } from "../lib/sound.js";
import ActivityHeatmap from "../components/ActivityHeatmap.jsx";
import LiveLeaderboardWidget from "../components/LiveLeaderboardWidget.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { SparklesIcon, SwordIcon, BookIcon, QuestScrollIcon, TargetIcon } from "../components/Icons.jsx";

export default function Dashboard() {
  const { character, setCharacter } = useAuth();
  const { showFlagToast } = useToast();
  const outletContext = useOutletContext();
  const onOpenGuide = outletContext?.onOpenGuide;
  const [pending, setPending] = useState(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState(null);
  const [newLevel, setNewLevel] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listTasks("pending"), api.listTasks("completed"), api.getAnalytics()])
      .then(([pendingData, completedData, analyticsData]) => {
        if (cancelled) return;
        setPending(pendingData.tasks.slice(0, 5));
        const today = new Date().toISOString().slice(0, 10);
        setCompletedToday(
          completedData.tasks.filter((t) => (t.completedAt || "").slice(0, 10) === today).length
        );
        setAnalytics(analyticsData);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => {
        if (!cancelled) setLoadingAnalytics(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleComplete(task) {
    setCompletingId(task.id);
    setError("");
    const prev = pending;
    setPending((p) => p.filter((t) => t.id !== task.id));

    try {
      const data = await api.completeTask(task.id);
      setCharacter(data.character);
      setCompletedToday((n) => n + 1);

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
      api.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err) {
      setPending(prev);
      setError(err.message);
    } finally {
      setCompletingId(null);
    }
  }

  // Accurately determine if the user is a first-time player
  const isFirstTimeUser =
    !character?.streak?.lastActiveDate &&
    (character?.xp || 0) === 0 &&
    (character?.level || 1) === 1 &&
    completedToday === 0;

  return (
    <div className="space-y-8">
      <LevelUpModal newLevel={newLevel} onClose={() => setNewLevel(null)} />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-hairline bg-surface/60 backdrop-blur-md shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="select-none text-amber">
                {isFirstTimeUser ? (
                  <SparklesIcon className="w-6 h-6" />
                ) : (
                  <SwordIcon className="w-6 h-6" />
                )}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">
                {isFirstTimeUser
                  ? `Welcome, ${character?.username || "Adventurer"}!`
                  : `Welcome back, ${character?.username || "Adventurer"}`}
              </h1>
            </div>

            <p className="text-mute text-sm max-w-xl">
              {isFirstTimeUser
                ? "Your life RPG adventure begins today. Turn your real-world routines into quests to earn XP, collect gold, and level up."
                : completedToday > 0
                ? `Great momentum! ${completedToday} quest${completedToday === 1 ? "" : "s"} conquered today. Keep your streak burning.`
                : "No quests completed yet today — complete at least one to keep your daily streak alive."}
            </p>
          </div>

          {isFirstTimeUser && onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo text-paper hover:opacity-95 transition-all shadow-sm"
            >
              <BookIcon className="w-4 h-4" />
              <span>How to Play Guide</span>
            </button>
          )}
        </div>

        {/* Quick Hero Banner Stats */}
        <div className="mt-6 pt-5 border-t border-hairline grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-paper/60 border border-hairline/80">
            <span className="text-xs text-mute block mb-0.5">Quests Done Today</span>
            <span className="font-display text-xl sm:text-2xl text-ink tabular-nums">
              {completedToday}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-paper/60 border border-hairline/80">
            <span className="text-xs text-mute block mb-0.5">Level Progress</span>
            <span className="font-display text-xl sm:text-2xl text-indigo tabular-nums">
              Lvl {character?.level || 1}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-paper/60 border border-hairline/80">
            <span className="text-xs text-mute block mb-0.5">Treasury</span>
            <span className="font-display text-xl sm:text-2xl text-amber tabular-nums">
              {character?.gold || 0}g
            </span>
          </div>
        </div>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      {/* RPG Archetype & Activity Heatmap */}
      <ActivityHeatmap analytics={analytics} loading={loadingAnalytics} />

      {/* Quests Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QuestScrollIcon className="w-5 h-5 text-amber" />
            <h2 className="text-base font-medium text-ink">Active Quests</h2>
          </div>
          <Link
            to="/quests"
            className="text-xs font-medium text-indigo hover:text-ink transition-colors flex items-center gap-1"
          >
            <span>Manage all quests</span>
            <span>→</span>
          </Link>
        </div>

        {pending === null && (
          <div className="space-y-3">
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </div>
        )}

        {pending && pending.length === 0 && (
          <div className="border border-dashed border-hairline rounded-2xl p-8 sm:p-10 text-center bg-surface/40">
            <div className="w-12 h-12 mx-auto rounded-full bg-paper border border-hairline flex items-center justify-center text-mute/60 mb-3 shadow-2xs">
              <TargetIcon className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg text-ink mb-1">
              {isFirstTimeUser ? "Your Quest Log is Empty" : "All Quests Conquered"}
            </h3>
            <p className="text-xs text-mute max-w-sm mx-auto mb-5">
              {isFirstTimeUser
                ? "Start your journey by adding your first real-life task (e.g. 'Read 20 pages' or 'Workout for 30 mins')."
                : "You've finished your active tasks. Create a new quest to continue earning XP and Gold."}
            </p>
            <Link
              to="/quests"
              className="inline-flex items-center gap-2 bg-ink text-paper rounded-lg px-5 py-2.5 text-xs font-medium hover:opacity-90 transition-all shadow-sm"
            >
              <span>+</span>
              <span>Create a Quest</span>
            </Link>
          </div>
        )}

        {pending && pending.length > 0 && (
          <ul className="space-y-3">
            <AnimatePresence>
              {pending.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  completing={completingId === task.id}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {/* Live Daily Champions Widget */}
      <LiveLeaderboardWidget />
    </div>
  );
}

/* commit_stage_68_ayush */
