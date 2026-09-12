import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext.jsx";
import { triggerParticles } from "../lib/particles.js";
import { playClick, playCoinClink } from "../lib/sound.js";
import { archetypeFromAttributes } from "../lib/attributes.js";
import {
  MailIcon,
  ShareIcon,
  BuildingIcon,
  ShieldIcon,
  FlameIcon,
  SparklesIcon,
  SwordIcon,
} from "./Icons.jsx";

export default function InviteModal({ isOpen, onClose, character }) {
  const { showSuccess } = useToast();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !character) return null;

  const archetype = archetypeFromAttributes(character.attributes || {});
  const college = character.college || "Independent Realm";
  const username = character.username || "Adventurer";
  const fullName = character.fullName ? ` (${character.fullName})` : "";
  const level = character.level || 1;
  const streak = character.streak?.current || 0;

  // Origin URL for referral link
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ledger-beta-rose.vercel.app";
  const referralUrl = `${origin}/signup?college=${encodeURIComponent(college)}&ref=${encodeURIComponent(username)}`;

  const emailSubject = `⚔️ Challenge from ${username} on Ledger (Life RPG)!`;
  const emailBody = `Greetings Adventurer,

${username}${fullName} has summoned you to conquer commitments and level up together on Ledger Life RPG!

📜 ADVENTURER PASSPORT:
• Adventurer: ${username}${fullName}
• Archetype: ${archetype.name} (Level ${level})
• Campus Guild: ${college}
• Streak Shield: ${streak} Days Active

Join our Campus Guild and compete alongside me on the realm leaderboard:
${referralUrl}

Forge your character, complete real-world quests, and build your legend!`;

  function handleSendEmail() {
    playCoinClink();
    triggerParticles({ count: 18 });
    const mailtoLink = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, "_blank");
    showSuccess("Email Client Opened", "Summoning scroll prepared in your mail app!");
  }

  function handleCopyInvite() {
    playClick();
    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    showSuccess("Challenge Copied", "Invite text and stats copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  }

  function handleCopyLink() {
    playClick();
    navigator.clipboard.writeText(referralUrl);
    showSuccess("Link Copied", "Guild referral URL copied to clipboard!");
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-paper border-2 border-hairline rounded-2xl shadow-2xl p-6 sm:p-7 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-hairline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <MailIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg sm:text-xl text-ink font-semibold">
                  Summon Classmates & Share Stats
                </h3>
                <p className="text-xs text-mute mt-0.5">
                  Challenge peers from <span className="font-medium text-ink">{college}</span> to compete.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-mute hover:text-ink text-sm px-2 py-1 rounded-md transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Visual Adventurer Pass Card Preview */}
          <div className="mt-5 p-4 rounded-xl border border-hairline/80 bg-surface/80 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-mute flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5 text-amber" />
                <span>Realm Adventurer Credential</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo border border-indigo/20">
                <BuildingIcon className="w-3 h-3" />
                <span className="truncate max-w-[140px]">{college}</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-ink text-paper flex items-center justify-center font-display text-lg font-bold shadow-md">
                L{level}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-base font-semibold text-ink truncate">
                    {username}
                  </p>
                  {character.fullName && (
                    <span className="text-xs text-mute truncate">({character.fullName})</span>
                  )}
                </div>
                <p className="text-xs text-indigo font-medium flex items-center gap-1.5 mt-0.5">
                  <ShieldIcon className="w-3.5 h-3.5" />
                  <span>{archetype.name}</span>
                  <span className="text-hairline">•</span>
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <FlameIcon className="w-3 h-3" />
                    {streak} Day Streak
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Recipient Email Input */}
          <div className="mt-5 space-y-2">
            <label className="block text-xs font-medium text-ink">
              Send directly to teammate&apos;s email:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MailIcon className="w-4 h-4 text-mute absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="classmate@college.edu"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-paper border border-hairline rounded-lg text-ink placeholder:text-mute/60 focus:outline-hidden focus:border-indigo"
                />
              </div>
              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-2 bg-ink text-paper rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <MailIcon className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </div>

          {/* Quick Copy Share Options */}
          <div className="mt-5 pt-4 border-t border-hairline grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopyInvite}
              className="w-full py-2.5 px-3 rounded-lg border border-hairline bg-surface hover:bg-paper text-ink text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <ShareIcon className="w-3.5 h-3.5 text-amber" />
              <span>{copied ? "Copied!" : "Copy Challenge Text"}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 px-3 rounded-lg border border-hairline bg-surface hover:bg-paper text-ink text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <SwordIcon className="w-3.5 h-3.5 text-indigo" />
              <span>Copy Guild Link</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
