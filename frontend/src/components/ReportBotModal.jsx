import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldIcon, AlertTriangleIcon, SparklesIcon } from "./Icons.jsx";
import { api } from "../api.js";

const REPORT_REASONS = [
  "Inhuman task completion speed (<60s)",
  "Automated macro script / botting",
  "Stat padding / impossible workout routine",
  "Rapid sequential API abuse",
];

export default function ReportBotModal({ targetPlayer, isOpen, onClose, onReportSuccess }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [aiVerdict, setAiVerdict] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen || !targetPlayer) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await api.reportBot({
        targetUserId: targetPlayer.id,
        reason,
      });
      setAiVerdict(data.aiAgent);
      if (onReportSuccess) onReportSuccess(data);
    } catch (err) {
      setError(err.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setAiVerdict(null);
    setError("");
    onClose();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-md w-full rounded-2xl border border-hairline bg-surface p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangleIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  Report Player to Sentinel
                </h3>
                <p className="text-[11px] text-mute">
                  Report target: <span className="font-semibold text-ink">{targetPlayer.username}</span> (Lvl {targetPlayer.level})
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-mute hover:text-ink text-sm p-1 rounded-md"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {!aiVerdict ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-mute block mb-1.5">
                  Select Suspicious Behavior
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        reason === r
                          ? "bg-rose-500/10 border-rose-500/40 text-ink font-medium"
                          : "bg-paper/60 border-hairline text-mute hover:text-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="text-rose-500 focus:ring-rose-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-paper/70 border border-hairline text-[11px] text-mute space-y-1">
                <p className="font-semibold text-ink flex items-center gap-1">
                  <ShieldIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Autonomous AI Sentinel Audit</span>
                </p>
                <p>
                  Filing a report immediately dispatches the Arcane Sentinel AI to scan the target’s recent completion timestamps and execution velocity.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 rounded-xl border border-hairline text-xs text-mute hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Analyzing Records…" : "Dispatch Sentinel AI"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-left">
              <div
                className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  aiVerdict.verdict === "CONFIRMED_ANOMALY"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[11px]">
                    🤖 {aiVerdict.inspector}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-black/30 font-semibold">
                    {Math.round(aiVerdict.confidence * 100)}% Certainty
                  </span>
                </div>
                <p className="font-semibold text-sm">
                  Verdict: {aiVerdict.verdict}
                </p>
                <p className="text-xs text-ink/90 leading-relaxed font-mono">
                  {aiVerdict.reason}
                </p>
                <div className="pt-2 border-t border-hairline/30 text-[11px] text-mute flex justify-between">
                  <span>Sentinel Recommendation:</span>
                  <span className="font-bold text-ink">{aiVerdict.actionRecommended}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-ink text-paper font-semibold text-xs transition-all"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* commit_stage_106_ayush */
