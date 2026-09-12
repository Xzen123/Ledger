import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import ReportBotModal from "../components/ReportBotModal.jsx";
import {
  TrophyIcon,
  ShieldIcon,
  FlameIcon,
  SwordIcon,
  AlertTriangleIcon,
  SparklesIcon,
  AttributeIcon,
  QuestScrollIcon,
} from "../components/Icons.jsx";

const PODIUM_COLORS = [
  {
    ring: "border-amber-400 bg-amber-500/10 text-amber-400 shadow-amber-500/20",
    badge: "bg-amber-500 text-ink",
    label: "1st Champion",
  },
  {
    ring: "border-slate-300 bg-slate-400/10 text-slate-300 shadow-slate-400/20",
    badge: "bg-slate-300 text-slate-900",
    label: "2nd Runner-up",
  },
  {
    ring: "border-amber-700 bg-amber-800/10 text-amber-600 shadow-amber-700/20",
    badge: "bg-amber-700 text-amber-100",
    label: "3rd Contender",
  },
];

export default function Leaderboard() {
  const { character } = useAuth();
  const { showSuccess } = useToast();
  const [period, setPeriod] = useState("daily");
  const [players, setPlayers] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportingPlayer, setReportingPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState("rankings"); // "rankings" | "audit"

  function fetchLeaderboard(selectedPeriod) {
    setLoading(true);
    api
      .getLeaderboard(selectedPeriod)
      .then((data) => {
        setPlayers(data.players || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  function fetchAuditLogs() {
    api
      .getAuditLogs()
      .then((data) => setAuditLogs(data.reports || []))
      .catch(() => {});
  }

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const topThree = players ? players.slice(0, 3) : [];
  const remainingPlayers = players ? players.slice(3) : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-hairline bg-surface/70 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-amber">
                <TrophyIcon className="w-6 h-6" />
              </span>
              <h1 className="font-display text-2xl sm:text-3xl text-ink tracking-tight">
                Live Realm Leaderboard
              </h1>
            </div>
            <p className="text-mute text-xs sm:text-sm max-w-xl">
              Real-time standing of adventurers across the realm. Monitored 24/7 by the
              <span className="font-medium text-ink"> Arcane Sentinel AI</span> with sub-minute anti-cheat detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Sentinel Guard Active</span>
            </span>
          </div>
        </div>

        {/* Period Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-paper border border-hairline text-xs font-medium">
            <button
              onClick={() => setPeriod("daily")}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                period === "daily"
                  ? "bg-ink text-paper shadow-sm font-semibold"
                  : "text-mute hover:text-ink"
              }`}
            >
              Daily Champions
            </button>
            <button
              onClick={() => setPeriod("all-time")}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                period === "all-time"
                  ? "bg-ink text-paper shadow-sm font-semibold"
                  : "text-mute hover:text-ink"
              }`}
            >
              All-Time Legends
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab("rankings")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeTab === "rankings"
                  ? "bg-surface border-ink text-ink font-semibold"
                  : "border-transparent text-mute hover:text-ink"
              }`}
            >
              Player Standings
            </button>
            <button
              onClick={() => {
                setActiveTab("audit");
                fetchAuditLogs();
              }}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                activeTab === "audit"
                  ? "bg-surface border-ink text-ink font-semibold"
                  : "border-transparent text-mute hover:text-ink"
              }`}
            >
              <ShieldIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sentinel AI Audit Feed</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === "rankings" ? (
        <>
          {/* Top 3 Champions Podium */}
          {!loading && topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((player, idx) => {
                const colors = PODIUM_COLORS[idx] || PODIUM_COLORS[0];
                const isCurrentUser = character?.id === player.id;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-2xl border p-5 sm:p-6 bg-surface/80 backdrop-blur-md relative overflow-hidden flex flex-col justify-between ${
                      colors.ring
                    } ${isCurrentUser ? "ring-2 ring-indigo-500" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                        {colors.label}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-paper/60 border border-hairline text-mute">
                        Rank #{player.rank}
                      </span>
                    </div>

                    <div className="my-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-paper border border-hairline flex items-center justify-center font-display font-bold text-lg text-ink">
                          {player.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-display text-lg text-ink font-bold truncate max-w-[160px]">
                            {player.username}
                            {isCurrentUser && <span className="text-xs font-normal text-indigo ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-mute">
                            Level {player.level} Adventurer
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-hairline/60 flex items-center justify-between text-xs">
                        <span className="text-mute font-medium">
                          {period === "daily" ? "Today's Quests:" : "All-Time Record:"}
                        </span>
                        <span className="font-display font-bold text-base text-ink">
                          {player.scoreLabel}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-hairline/40">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          player.securityStatus === "banned"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : player.securityStatus === "flagged"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {player.statusLabel}
                      </span>

                      {!isCurrentUser && (
                        <button
                          onClick={() => setReportingPlayer(player)}
                          className="text-[11px] text-mute hover:text-rose-400 transition-colors flex items-center gap-1"
                        >
                          <AlertTriangleIcon className="w-3 h-3" />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="rounded-2xl border border-hairline bg-surface/70 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-hairline flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <QuestScrollIcon className="w-4 h-4 text-amber" />
                <span>Full Leaderboard Standings</span>
              </h3>
              <span className="text-xs text-mute">
                {players ? `${players.length} ranked adventurers` : "Loading rankings…"}
              </span>
            </div>

            {loading && (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 skeleton rounded-xl" />
                ))}
              </div>
            )}

            {!loading && players && players.length === 0 && (
              <div className="p-12 text-center text-mute text-xs">
                No adventurers have completed quests in this timeframe yet. Be the first to claim #1!
              </div>
            )}

            {!loading && players && players.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper/60 text-mute uppercase tracking-wider text-[10px] border-b border-hairline">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Adventurer</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">
                        {period === "daily" ? "Quests Today" : "Total Quests"}
                      </th>
                      <th className="py-3 px-4">Streak</th>
                      <th className="py-3 px-4">Sentinel Standing</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {players.map((p) => {
                      const isCurrentUser = character?.id === p.id;
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-paper/40 transition-colors ${
                            isCurrentUser ? "bg-indigo-500/5 font-medium" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold">
                            {p.rank <= 3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-paper border border-hairline font-bold">
                                {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : "🥉"}
                              </span>
                            ) : (
                              `#${p.rank}`
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-paper border border-hairline flex items-center justify-center font-bold text-ink">
                                {p.username[0]?.toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-ink">
                                  {p.username}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[10px] text-indigo font-normal ml-1.5 px-1.5 py-0.2 rounded bg-indigo-soft">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-indigo">
                            Lvl {p.level}
                          </td>

                          <td className="py-3.5 px-4 font-display font-bold text-ink text-sm">
                            {period === "daily" ? p.score : p.score}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="flex items-center gap-1 text-mute">
                              <FlameIcon className="w-3.5 h-3.5 text-amber-500" />
                              <span>{p.streak}d</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                p.securityStatus === "banned"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  : p.securityStatus === "flagged"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              }`}
                            >
                              {p.securityStatus === "verified" && (
                                <ShieldIcon className="w-3 h-3 text-emerald-400" />
                              )}
                              <span>{p.statusLabel}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {!isCurrentUser && (
                              <button
                                onClick={() => setReportingPlayer(p)}
                                className="px-2.5 py-1 rounded-lg border border-hairline bg-paper/60 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-mute transition-all text-[11px]"
                              >
                                Report
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Sentinel AI Audit Log Feed */
        <div className="rounded-2xl border border-hairline bg-surface/70 backdrop-blur-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-5 h-5 text-indigo-400" />
              <h2 className="font-display text-base font-semibold text-ink">
                Autonomous Arcane Sentinel AI Audit Stream
              </h2>
            </div>
            <span className="text-xs text-mute font-mono">Live Security Feed</span>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-mute py-8 text-center">
              No anti-cheat infractions or bot reports recorded yet. All realm activity is pristine.
            </p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-hairline bg-paper/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Target: {log.targetUsername}</span>
                    </span>
                    <span className="font-mono text-[10px] text-mute">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-mute text-xs">
                    <span className="font-medium text-ink">Reason:</span> {log.reason}
                  </p>

                  {log.aiVerdict && (
                    <div className="p-3 rounded-lg bg-black/20 border border-hairline/60 font-mono text-[11px] text-amber-200/90 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400">
                          🤖 Sentinel Verdict: {log.aiVerdict.verdict || log.aiVerdict.status}
                        </span>
                        <span>{Math.round((log.aiConfidence || 0.95) * 100)}% Certainty</span>
                      </div>
                      <p className="text-mute/80 text-[10px] leading-relaxed">
                        {log.aiVerdict.analysis || log.aiVerdict.reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bot Reporting Modal */}
      <ReportBotModal
        targetPlayer={reportingPlayer}
        isOpen={Boolean(reportingPlayer)}
        onClose={() => setReportingPlayer(null)}
        onReportSuccess={(report) => {
          showSuccess("Report Logged", `Sentinel AI investigated ${report.targetUsername}`);
          fetchLeaderboard(period);
        }}
      />
    </div>
  );
}

/* commit_stage_101_ayush */
