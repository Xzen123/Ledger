import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { triggerParticles } from "../lib/particles.js";
import {
  SwordIcon,
  QuestScrollIcon,
  LightningIcon,
  GoldCoinIcon,
  BrainIcon,
  ShieldIcon,
  PaletteIcon,
  LeafIcon,
  FlameIcon,
  TrophyIcon,
  RocketIcon,
} from "./Icons.jsx";

const STEPS = [
  {
    step: 1,
    badge: "Chapter I: The Call to Adventure",
    title: "Welcome to Ledger",
    subtitle: "Turn mundane real-world tasks into an epic RPG journey",
    icon: <SwordIcon className="w-7 h-7 text-amber" />,
    content: (
      <div className="space-y-3 text-sm text-mute">
        <p>
          Traditional to-do lists fail because real-world results take months to materialize.
          <strong className="text-ink font-medium"> Ledger bridges this gap </strong> by giving you
          instant feedback loops, celebratory level-ups, and tangible rewards for real achievements.
        </p>
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-paper border border-hairline flex flex-col items-center">
            <QuestScrollIcon className="w-5 h-5 text-amber mb-1" />
            <span className="font-medium text-ink block">Real Quests</span>
            <span className="text-[11px] text-mute">Your daily habits</span>
          </div>
          <div className="p-2.5 rounded-lg bg-paper border border-hairline flex flex-col items-center">
            <LightningIcon className="w-5 h-5 text-indigo mb-1" />
            <span className="font-medium text-ink block">Instant XP</span>
            <span className="text-[11px] text-mute">Non-linear leveling</span>
          </div>
          <div className="p-2.5 rounded-lg bg-paper border border-hairline flex flex-col items-center">
            <GoldCoinIcon className="w-5 h-5 text-amber mb-1" />
            <span className="font-medium text-ink block">Gold & Shop</span>
            <span className="text-[11px] text-mute">Themes & Badges</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 2,
    badge: "Chapter II: The Five Attributes",
    title: "Shape Your Character",
    subtitle: "Every action you take upgrades specific character stats",
    icon: <BrainIcon className="w-7 h-7 text-blue-500" />,
    content: (
      <div className="space-y-2.5 text-sm text-mute">
        <p className="text-xs">
          Categorize your quests to grow your 5 core RPG attributes across progressive tiers:
        </p>
        <div className="grid grid-cols-1 gap-2 pt-1">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-paper border border-hairline text-xs">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
              <BrainIcon className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <span className="font-medium text-ink">Intellect:</span> Study, reading, deep coding, learning
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-paper border border-hairline text-xs">
            <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
              <SwordIcon className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <span className="font-medium text-ink">Strength:</span> Gym, fitness, sports, physical endurance
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-paper border border-hairline text-xs">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShieldIcon className="w-4 h-4 text-amber" />
            </div>
            <div>
              <span className="font-medium text-ink">Discipline:</span> Chores, organization, morning routines
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-paper border border-hairline text-xs">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
              <PaletteIcon className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <span className="font-medium text-ink">Creativity:</span> Art, writing, music, building projects
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-paper border border-hairline text-xs">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
              <LeafIcon className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <span className="font-medium text-ink">Vitality:</span> Rest, hydration, sleep, mental health
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 3,
    badge: "Chapter III: The Streak Flame",
    title: "Protect Your Daily Momentum",
    subtitle: "Complete at least one quest per calendar day to keep the fire burning",
    icon: <FlameIcon className="w-7 h-7 text-orange-500" />,
    content: (
      <div className="space-y-3 text-sm text-mute">
        <p>
          Consistency is the greatest superpower. As long as you complete
          <strong className="text-ink font-medium"> 1 quest every calendar day</strong>, your
          streak continues to grow.
        </p>
        <div className="p-4 rounded-lg bg-paper border border-hairline flex items-center gap-4">
          <span className="flame-flicker text-orange-500 shrink-0">
            <FlameIcon className="w-8 h-8" />
          </span>
          <div className="space-y-0.5 text-xs">
            <p className="font-medium text-ink">At-Risk Warnings</p>
            <p className="text-mute">
              If a day passes without quest activity, your streak enters the at-risk warning state before resetting.
            </p>
          </div>
        </div>
        <p className="text-xs">
          Tip: Create small &quot;Daily Habits&quot; (like drinking water or stretching) as Easy quests to easily maintain your streak!
        </p>
      </div>
    ),
  },
  {
    step: 4,
    badge: "Chapter IV: The Bazaar & Armory",
    title: "Spend Gold on Real Customization",
    subtitle: "Earn currency from quests and customize your sanctuary",
    icon: <GoldCoinIcon className="w-7 h-7 text-amber" />,
    content: (
      <div className="space-y-3 text-sm text-mute">
        <p>
          Completing quests rewards you with gold according to difficulty:
          <span className="text-amber font-medium"> Easy (5g)</span>,
          <span className="text-amber font-medium"> Medium (12g)</span>,
          <span className="text-amber font-medium"> Hard (25g)</span>, or
          <span className="text-amber font-medium"> Epic (55g)</span>.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-lg bg-paper border border-hairline space-y-1">
            <span className="font-medium text-ink flex items-center gap-1.5">
              <PaletteIcon className="w-3.5 h-3.5 text-indigo" />
              <span>Realm Themes</span>
            </span>
            <p className="text-mute text-[11px]">
              Unlock Slate (Cyber Graphite), Forest (Evergreen Sanctuary), and Ember (Dungeon Hearth).
            </p>
          </div>
          <div className="p-3 rounded-lg bg-paper border border-hairline space-y-1">
            <span className="font-medium text-ink flex items-center gap-1.5">
              <TrophyIcon className="w-3.5 h-3.5 text-amber" />
              <span>Trophies & Auras</span>
            </span>
            <p className="text-mute text-[11px]">
              Claim milestone badges and the glowing Focus Aura for your character sheet.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function TutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const data = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      triggerParticles({ count: 45 });
      onClose();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-surface rounded-2xl max-w-lg w-full p-6 sm:p-7 border border-hairline shadow-2xl relative"
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Tag & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-indigo-soft text-indigo">
              {data.badge}
            </span>
            <button
              onClick={onClose}
              aria-label="Close tutorial"
              className="text-mute hover:text-ink text-sm px-2 py-1 rounded"
            >
              Skip
            </button>
          </div>

          {/* Body */}
          <div className="py-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-paper border border-hairline flex items-center justify-center shrink-0 shadow-2xs">
                {data.icon}
              </div>
              <div>
                <h2 id="tutorial-title" className="font-display text-xl text-ink">
                  {data.title}
                </h2>
                <p className="text-xs text-mute mt-0.5">{data.subtitle}</p>
              </div>
            </div>

            <div className="pt-2">{data.content}</div>
          </div>

          {/* Footer Controls & Dots */}
          <div className="pt-4 border-t border-hairline flex items-center justify-between">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5" aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? "w-6 bg-ink" : "w-1.5 bg-hairline hover:bg-mute"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="text-xs px-3 py-1.5 rounded-md border border-hairline text-mute hover:text-ink transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="text-xs px-4 py-2 rounded-md bg-ink text-paper font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5"
              >
                {isLast ? (
                  <>
                    <span>Start My Journey</span>
                    <RocketIcon className="w-3.5 h-3.5 text-amber" />
                  </>
                ) : (
                  "Next Chapter →"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* commit_stage_59_ayush */
