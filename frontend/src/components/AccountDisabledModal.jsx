import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangleIcon, ShieldIcon } from "./Icons.jsx";
import { playAccountLocked } from "../lib/sound.js";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

export default function AccountDisabledModal({ isOpen, reason, flags = 4, onRestored }) {
  const { logout, setCharacter } = useAuth();

  useEffect(() => {
    if (isOpen) {
      playAccountLocked();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleAppealReset() {
    try {
      const data = await api.appealReset();
      setCharacter(data.character);
      if (onRestored) onRestored(data.character);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-lg w-full rounded-2xl border-2 border-rose-500/80 bg-surface p-6 sm:p-8 shadow-2xl shadow-rose-950/50 space-y-6 text-center"
        >
          {/* Pulsing Lock Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20 animate-pulse">
            <AlertTriangleIcon className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
              Sentinel Anti-Cheat Enforcement
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold tracking-tight">
              Account Suspended
            </h2>
            <p className="text-xs sm:text-sm text-mute leading-relaxed">
              Your adventurer account has been locked by the Arcane Sentinel AI after exceeding the maximum limit of 3 security strikes.
            </p>
          </div>

          {/* Audit Breakdown Box */}
          <div className="p-4 rounded-xl bg-paper border border-rose-500/30 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-mute">
              <span>Security Infractions:</span>
              <span className="font-mono font-bold text-rose-400">
                {flags} / 3 Strikes (Limit Exceeded)
              </span>
            </div>
            <div className="flex items-center justify-between text-mute">
              <span>Primary Violation:</span>
              <span className="text-ink font-medium">Sub-minute task completion (&lt;60s)</span>
            </div>
            <div className="pt-2 border-t border-hairline text-mute">
              <span className="font-semibold text-ink block mb-0.5">Sentinel AI Statement:</span>
              <p className="font-mono text-[11px] text-mute/90 leading-relaxed">
                {reason || "Multiple rapid sequential task resolutions detected. Inhuman execution speed confirms automated macro script."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAppealReset}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ink font-semibold text-xs transition-all shadow-md shadow-amber-500/20"
            >
              Request Sentinel Appeal (Reset Strikes)
            </button>
            <button
              onClick={logout}
              className="px-5 py-2.5 rounded-xl border border-hairline bg-paper text-mute hover:text-ink text-xs font-medium transition-all"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* commit_stage_97_ayush */
