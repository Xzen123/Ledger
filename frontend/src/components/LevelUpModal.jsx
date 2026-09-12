import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function LevelUpModal({ newLevel, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (newLevel) closeRef.current?.focus();
  }, [newLevel]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {newLevel && (
        <motion.div
          className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="levelup-heading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-surface rounded-xl px-8 py-10 text-center max-w-sm w-full border border-hairline"
            initial={{ scale: 0.85, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-mute tracking-wide mb-2">Level up</p>
            <motion.p
              className="font-display text-7xl tabular-nums"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            >
              {newLevel}
            </motion.p>
            <p className="text-sm text-mute mt-3">Your character grows stronger.</p>
            <button
              ref={closeRef}
              onClick={onClose}
              className="mt-6 bg-ink text-paper rounded-md px-4 py-2 text-sm font-medium"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* commit_stage_52_ayush */
