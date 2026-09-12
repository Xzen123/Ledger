import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SwordIcon,
  ShieldIcon,
  BrainIcon,
  PaletteIcon,
  LeafIcon,
  FlameIcon,
  GoldCoinIcon,
  QuestScrollIcon,
  LightningIcon,
  SparklesIcon,
  TrophyIcon,
  AuraIcon,
  PinIcon,
  TreeIcon,
  VolcanoIcon,
  CastleIcon,
  AlertTriangleIcon,
  LightbulbIcon,
  RocketIcon,
  AttributeIcon,
  BadgeIcon,
} from "../components/Icons.jsx";

const STATS = [
  { key: "intellect", label: "Intellect", color: "bg-blue-500", desc: "Study, reading, deep coding, learning", value: 85 },
  { key: "strength", label: "Strength", color: "bg-red-500", desc: "Gym, fitness, sports, physical endurance", value: 72 },
  { key: "discipline", label: "Discipline", color: "bg-amber-500", desc: "Chores, organization, morning routines", value: 94 },
  { key: "creativity", label: "Creativity", color: "bg-purple-500", desc: "Art, writing, music, building projects", value: 68 },
  { key: "vitality", label: "Vitality", color: "bg-emerald-500", desc: "Rest, hydration, sleep, mental health", value: 78 },
];

const THEMES_PREVIEW = [
  { name: "Slate", desc: "Cyber Graphite & Obsidian", colors: ["#090D14", "#121927", "#38BDF8"] },
  { name: "Forest", desc: "Evergreen Sanctuary & Moss", colors: ["#06110B", "#0E1F16", "#34D399"] },
  { name: "Ember", desc: "Warm Dungeon Hearth & Flame", colors: ["#120907", "#1E120D", "#FB923C"] },
];

const BADGES_PREVIEW = [
  { name: "First Steps", key: "first-steps", status: "Unlocked" },
  { name: "Consistent", key: "consistent", status: "Unlocked" },
  { name: "Polymath", key: "polymath", status: "Mastery" },
  { name: "Focus Aura", key: "focus-aura", status: "Legendary" },
];

export default function Landing() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [activeViewport, setActiveViewport] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isWarping, setIsWarping] = useState(false);
  const [flameIntensity, setFlameIntensity] = useState(1);

  // Track scroll position & update SVG quest path + active biome
  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const progress = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
    setScrollProgress(progress);

    const index = Math.min(4, Math.max(1, Math.round(progress * 3) + 1));
    setActiveViewport(index);

    // Viewport 3 flame intensity calculation
    if (index === 3) {
      setFlameIntensity(1.35);
    } else {
      setFlameIntensity(0.9);
    }
  }

  // Handle CTA Click with Portal Warp Animation
  function handleStartJourney() {
    setIsWarping(true);
    setTimeout(() => {
      navigate("/login");
    }, 850);
  }

  function scrollToSection(index) {
    const el = containerRef.current;
    if (!el) return;
    const sectionHeight = el.clientHeight;
    el.scrollTo({ top: (index - 1) * sectionHeight, behavior: "smooth" });
  }

  // Calculate SVG stroke offset for the quest path (total path length approx 1400)
  const pathTotalLength = 1400;
  const strokeOffset = pathTotalLength - scrollProgress * pathTotalLength;

  // Hero sprite coordinates along map path (normalized vertical position 0% - 92%)
  const spriteTopPercent = Math.min(92, Math.max(4, scrollProgress * 92));

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`scrolly-container relative bg-paper text-ink transition-all ${
        isWarping ? "portal-warp-active" : ""
      }`}
    >
      {/* Top Floating Navigation / Skip Button */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-md border border-hairline/70 shadow-xs">
          <SwordIcon className="w-4 h-4 text-amber" />
          <span className="font-display font-medium text-sm tracking-tight">Ledger</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-soft text-indigo">
            Chapter {activeViewport} of 4
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => scrollToSection(4)}
            className="text-xs font-medium text-mute hover:text-ink px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-md border border-hairline/70 transition-colors shadow-xs"
          >
            Skip to Action →
          </button>
          <Link
            to="/login"
            className="text-xs font-medium bg-ink text-paper px-3.5 py-1.5 rounded-full hover:opacity-90 transition-all shadow-xs"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* --- CONTINUOUS FANTASY PARCHMENT MAP SPINE & SVG QUEST PATH --- */}
      <div className="fixed left-4 sm:left-12 top-0 bottom-0 w-16 sm:w-20 pointer-events-none z-20 flex justify-center">
        {/* Parchment background strip */}
        <div className="w-1.5 sm:w-2 h-full bg-amber-soft/40 border-x border-amber/20 relative">
          <svg className="w-16 sm:w-20 h-full absolute -left-7 sm:-left-9 top-0" preserveAspectRatio="none" viewBox="0 0 100 1000">
            {/* Background dashed ghost trail */}
            <path
              d="M 50,0 Q 80,250 30,500 T 70,750 T 50,1000"
              fill="none"
              stroke="#E5E2DA"
              strokeWidth="4"
              strokeDasharray="6,6"
            />
            {/* Golden glowing drawn quest path */}
            <path
              d="M 50,0 Q 80,250 30,500 T 70,750 T 50,1000"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                strokeDasharray: pathTotalLength,
                strokeDashoffset: strokeOffset,
                filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.85))",
                transition: "stroke-dashoffset 0.1s linear",
              }}
            />
          </svg>

          {/* Walking RPG Hero Character Sprite */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out z-30"
            style={{ top: `${spriteTopPercent}%` }}
          >
            <div className="hero-sprite-walk flex flex-col items-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-surface border-2 border-amber shadow-md flex items-center justify-center text-amber select-none">
                <ShieldIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="w-2 h-1 bg-amber/30 rounded-full blur-[1px] mt-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEWPORT 1 — "Chapter I: The Call to Adventure" */}
      {/* ========================================================================= */}
      <section className="scrolly-section flex items-center justify-center pl-20 sm:pl-36 pr-6 sm:pr-12 relative overflow-hidden bg-gradient-to-b from-amber-soft/20 via-paper to-paper">
        {/* Crossroads Milestone Icon */}
        <div className="absolute left-6 sm:left-14 top-16 sm:top-24 z-20">
          <div className="w-8 h-8 rounded-full bg-amber-soft border border-amber/40 flex items-center justify-center text-amber shadow-xs" title="Crossroads Marker">
            <PinIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="max-w-3xl w-full space-y-7 text-left my-auto py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-amber-soft text-amber border border-amber/30 inline-block">
              Chapter I: The Call to Adventure
            </span>
            <h1 className="font-display text-4xl sm:text-6xl text-ink tracking-tight font-medium leading-none">
              Welcome to Ledger
            </h1>
            <p className="font-display text-lg sm:text-xl text-indigo italic">
              &ldquo;Turn mundane real-world tasks into an epic RPG journey&rdquo;
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-mute leading-relaxed max-w-2xl"
          >
            Traditional to-do lists fail because real-world results take months to materialize.
            <strong className="text-ink font-semibold"> Ledger bridges this gap </strong> by giving
            you instant feedback loops, celebratory level-ups, and tangible rewards for real
            achievements.
          </motion.p>

          {/* 3 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <motion.div
              whileHover={{ y: -3 }}
              className="rpg-glass p-4 rounded-xl border border-hairline shadow-xs space-y-2"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-soft/60 border border-amber/30 flex items-center justify-center text-amber">
                <QuestScrollIcon className="w-5 h-5" />
              </div>
              <h2 className="font-display text-sm font-semibold text-ink">Real Quests</h2>
              <p className="text-xs text-mute">Your daily habits & chores converted into conquerable tasks.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="rpg-glass p-4 rounded-xl border border-hairline shadow-xs space-y-2"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-soft/60 border border-indigo/30 flex items-center justify-center text-indigo">
                <LightningIcon className="w-5 h-5" />
              </div>
              <h2 className="font-display text-sm font-semibold text-ink">Instant XP</h2>
              <p className="text-xs text-mute">Non-linear leveling curve where higher tiers feel truly earned.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="rpg-glass p-4 rounded-xl border border-hairline shadow-xs space-y-2"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-soft/60 border border-amber/30 flex items-center justify-center text-amber">
                <GoldCoinIcon className="w-5 h-5" />
              </div>
              <h2 className="font-display text-sm font-semibold text-ink">Gold & Shop</h2>
              <p className="text-xs text-mute">Spend bounty currency on realm themes, badges, and glowing auras.</p>
            </motion.div>
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs text-mute">
            <span>Scroll down to enter the Enchanted Forest</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* VIEWPORT 2 — "Chapter II: The Five Attributes" */}
      {/* ========================================================================= */}
      <section className="scrolly-section flex items-center justify-center pl-20 sm:pl-36 pr-6 sm:pr-12 relative overflow-hidden bg-gradient-to-b from-paper via-emerald-950/10 to-paper">
        {/* Forest Trail Milestone Marker */}
        <div className="absolute left-6 sm:left-14 top-16 sm:top-24 z-20">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 border border-emerald-500/40 flex items-center justify-center text-emerald-500 shadow-xs" title="Forest Milestone">
            <TreeIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="max-w-3xl w-full space-y-6 text-left my-auto py-16">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-moss-soft text-moss border border-moss/30 inline-block">
              Chapter II: The Five Attributes
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-ink tracking-tight font-medium">
              Shape Your Character
            </h2>
            <p className="font-display text-base sm:text-lg text-moss italic">
              &ldquo;Every action you take upgrades specific character stats&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-mute max-w-xl">
              Categorize your quests to grow your 5 core RPG attributes across progressive tiers:
            </p>
          </div>

          {/* 5 Attribute Stat Cards with Dynamic Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {STATS.map((stat) => (
              <div
                key={stat.key}
                className="rpg-glass p-3.5 rounded-xl border border-hairline shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink flex items-center gap-2">
                    <AttributeIcon name={stat.key} className="w-4 h-4 text-indigo" />
                    <span>{stat.label}</span>
                  </span>
                  <span className="text-[11px] font-medium text-mute tabular-nums">
                    Tier {Math.floor(stat.value / 10)} ({stat.value} pts)
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-hairline/70 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: activeViewport >= 2 ? `${stat.value}%` : "15%" }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>

                <p className="text-[11px] text-mute">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* VIEWPORT 3 — "Chapter III: The Streak Flame" */}
      {/* ========================================================================= */}
      <section className="scrolly-section flex items-center justify-center pl-20 sm:pl-36 pr-6 sm:pr-12 relative overflow-hidden bg-gradient-to-b from-paper via-orange-950/15 to-paper">
        {/* Lava Bridge Milestone Marker */}
        <div className="absolute left-6 sm:left-14 top-16 sm:top-24 z-20">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 border border-orange-500/40 flex items-center justify-center text-orange-500 shadow-xs" title="Lava Bridge">
            <VolcanoIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="max-w-3xl w-full space-y-6 text-left my-auto py-16">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-clay-soft text-clay border border-clay/30 inline-block">
              Chapter III: The Streak Flame
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-ink tracking-tight font-medium">
              Protect Your Daily Momentum
            </h2>
            <p className="font-display text-base sm:text-lg text-clay italic">
              &ldquo;Complete at least one quest per calendar day to keep the fire burning&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-mute max-w-xl">
              Consistency is the greatest superpower. As long as you complete 1 quest every
              calendar day, your streak continues to grow.
            </p>
          </div>

          {/* Central Interactive Flame Display */}
          <div className="rpg-glass p-6 sm:p-8 rounded-2xl border border-hairline text-center relative overflow-hidden">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center text-orange-500 transition-transform duration-300"
              style={{
                transform: `scale(${flameIntensity})`,
                filter: "drop-shadow(0 0 25px rgba(249, 115, 22, 0.8))",
              }}
            >
              <FlameIcon className="w-full h-full" />
            </div>

            <div className="mt-4 max-w-md mx-auto space-y-2">
              <div className="p-3 rounded-lg bg-clay-soft/80 border border-clay/30 text-clay text-xs flex items-start gap-2.5 text-left">
                <AlertTriangleIcon className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">At-Risk Warnings</strong>
                  <span>
                    If a day passes without quest activity, your streak enters the at-risk warning state before resetting.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-paper border border-hairline text-xs text-mute text-left flex items-center gap-2">
                <LightbulbIcon className="w-4 h-4 text-amber shrink-0" />
                <span>
                  <strong>Tip:</strong> Create small &ldquo;Daily Habits&rdquo; (drinking water or stretching) as Easy quests to easily protect your streak!
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* VIEWPORT 4 — "Chapter IV: The Bazaar & Armory" + FINAL CTA */}
      {/* ========================================================================= */}
      <section className="scrolly-section flex items-center justify-center pl-20 sm:pl-36 pr-6 sm:pr-12 relative overflow-hidden bg-gradient-to-b from-paper via-purple-950/15 to-paper">
        {/* Castle Gate Milestone Marker */}
        <div className="absolute left-6 sm:left-14 top-16 sm:top-24 z-20">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-xs" title="Castle Gate">
            <CastleIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="max-w-3xl w-full space-y-6 text-left my-auto py-16">
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-amber-soft text-amber border border-amber/30 inline-block">
              Chapter IV: The Bazaar & Armory
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-ink tracking-tight font-medium">
              Spend Gold on Real Customization
            </h2>
            <p className="font-display text-base sm:text-lg text-amber italic">
              &ldquo;Earn currency from quests and customize your sanctuary&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-mute max-w-xl">
              Completing quests rewards you with gold according to difficulty: Easy (5g), Medium (12g), Hard (25g), or Epic (55g).
            </p>
          </div>

          {/* 2 Shop Preview Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Realm Themes */}
            <div className="rpg-glass p-4 rounded-xl border border-hairline space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <PaletteIcon className="w-4 h-4 text-indigo" />
                  <span>Realm Themes</span>
                </span>
                <span className="text-[10px] text-mute">Instant Palette Switch</span>
              </div>
              <div className="space-y-2">
                {THEMES_PREVIEW.map((th) => (
                  <div key={th.name} className="p-2 rounded-lg bg-paper border border-hairline flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-ink">{th.name} Theme</p>
                      <p className="text-[10px] text-mute">{th.desc}</p>
                    </div>
                    <div className="flex gap-1">
                      {th.colors.map((c, i) => (
                        <span key={i} className="w-3.5 h-3.5 rounded-full border border-hairline shadow-2xs" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trophies & Auras */}
            <div className="rpg-glass p-4 rounded-xl border border-hairline space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <TrophyIcon className="w-4 h-4 text-amber" />
                  <span>Trophies & Auras</span>
                </span>
                <span className="text-[10px] text-indigo font-medium">Display on Profile</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BADGES_PREVIEW.map((b) => (
                  <div key={b.name} className="p-2 rounded-lg bg-paper border border-hairline text-center space-y-1">
                    <div className="w-7 h-7 mx-auto rounded-lg bg-surface border border-hairline flex items-center justify-center text-amber">
                      <BadgeIcon name={b.key} className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-ink truncate">{b.name}</p>
                    <span className="text-[10px] text-moss block font-medium">{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- FINAL CTA SECTION & HERO WITH GLOWING SWORD SLASH ARC --- */}
          <div className="rpg-glass p-6 sm:p-8 rounded-2xl border-2 border-amber/40 shadow-xl text-center space-y-5 relative overflow-hidden bg-gradient-to-t from-amber-500/10 to-transparent">
            {/* RPG Character with continuous glowing sword slash arc */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Central Knight Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-surface border-2 border-amber shadow-lg flex items-center justify-center text-amber z-10">
                <ShieldIcon className="w-9 h-9" />
              </div>

              {/* Glowing animated sword slash arc with light trail */}
              <div className="sword-slash-arc absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-200 to-sky-400 shadow-lg" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-2xl sm:text-3xl text-ink font-semibold">
                Your Legend Awaits
              </h3>
              <p className="text-xs sm:text-sm text-mute max-w-md mx-auto">
                Join thousands transforming everyday discipline into character progression.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => scrollToSection(1)}
                className="text-xs text-mute hover:text-ink px-4 py-2 rounded-xl transition-colors order-2 sm:order-1"
              >
                ← Back to Beginning
              </button>

              <button
                onClick={handleStartJourney}
                className="order-1 sm:order-2 px-7 py-3 rounded-xl bg-ink text-paper font-semibold text-sm tracking-wide shadow-lg hover:opacity-95 transition-all flex items-center gap-2 border-2 border-amber-400/80 hover:border-amber-400"
                style={{
                  boxShadow: "0 0 25px rgba(245, 158, 11, 0.45)",
                }}
              >
                <span>Start My Journey</span>
                <RocketIcon className="w-4 h-4 text-amber" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
