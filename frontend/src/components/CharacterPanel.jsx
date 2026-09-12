import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import ProgressBar from "./ProgressBar.jsx";
import { ATTRIBUTE_META, attributeTier } from "../lib/attributes.js";
import CharacterPanelSkeleton from "./Skeletons.jsx";
import { triggerParticles } from "../lib/particles.js";
import {
  CrossedSwordsIcon,
  ShieldIcon,
  GoldCoinIcon,
  FlameIcon,
  LightningIcon,
  TrophyIcon,
  BookIcon,
  AlertTriangleIcon,
  AttributeIcon,
  BadgeIcon,
} from "./Icons.jsx";

export default function CharacterPanel({ onOpenGuide }) {
  const { character, setCharacter } = useAuth();
  if (!character) return <CharacterPanelSkeleton />;

  const {
    username,
    level,
    xp,
    xpToNextLevel,
    gold,
    streak,
    attributes,
    badges,
    hasAura,
    ownedThemes,
    activeTheme,
  } = character;

  async function handleQuickTheme(theme) {
    if (theme === activeTheme) return;
    try {
      const data = await api.setTheme(theme);
      setCharacter(data.character);
      triggerParticles({ count: 18 });
    } catch (err) {
      console.error(err);
    }
  }

  const xpPercent = Math.min(100, Math.round((xp / (xpToNextLevel || 100)) * 100));

  return (
    <div className="space-y-5">
      {/* Hero Card & Level HUD */}
      <div
        className={`rpg-glass rounded-2xl p-5 sm:p-6 transition-all relative overflow-hidden ${
          hasAura ? "cosmetic-focus-aura" : ""
        }`}
      >
        {/* Subtle decorative crest backdrop */}
        <div
          className="absolute -right-6 -bottom-6 w-32 h-32 opacity-5 select-none pointer-events-none text-ink flex items-center justify-center"
          aria-hidden="true"
        >
          <CrossedSwordsIcon className="w-28 h-28" />
        </div>

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-soft/80 border border-indigo/20 flex items-center justify-center text-indigo shadow-xs">
              <ShieldIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-base text-ink font-semibold leading-tight truncate max-w-[130px]">
                {username}
              </p>
              <p className="text-[11px] text-mute uppercase tracking-wider font-medium mt-0.5">
                Level {level} Hero
              </p>
            </div>
          </div>

          {hasAura && (
            <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-soft text-amber font-semibold border border-amber/30">
              Focus Aura
            </span>
          )}
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink flex items-center gap-1">
              <span>XP Progress</span>
              <span className="text-mute font-normal">({xpPercent}%)</span>
            </span>
            <span className="text-mute tabular-nums text-[11px]">
              {xp} / {xpToNextLevel} XP
            </span>
          </div>
          <ProgressBar value={xp} max={xpToNextLevel} />
          <p className="text-[11px] text-mute text-right">
            {xpToNextLevel - xp} XP needed for Level {level + 1}
          </p>
        </div>
      </div>

      {/* Gold & Streak Dual Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Treasury Card */}
        <div className="rpg-glass rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-mute font-medium uppercase tracking-wider">Treasury</span>
            <GoldCoinIcon className="w-4 h-4 text-amber" />
          </div>
          <div className="mt-2">
            <p className="font-display text-2xl text-amber tabular-nums font-semibold leading-none">
              {gold}
              <span className="text-xs font-sans text-amber/80 font-normal ml-0.5">g</span>
            </p>
            <p className="text-[10px] text-mute mt-1.5">Gold to spend in shop</p>
          </div>
        </div>

        {/* Streak Flame Card */}
        <div className="rpg-glass rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-mute font-medium uppercase tracking-wider">Streak</span>
            <span className="flame-flicker text-orange-500">
              <FlameIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <p className="font-display text-2xl text-moss tabular-nums font-semibold leading-none">
              {streak.current}
              <span className="text-xs font-sans text-mute font-normal ml-1">
                day{streak.current === 1 ? "" : "s"}
              </span>
            </p>
            {streak.atRisk ? (
              <p className="text-[10px] text-clay mt-1.5 font-medium leading-tight flex items-center gap-1">
                <AlertTriangleIcon className="w-3 h-3 text-clay shrink-0" />
                <span>At risk! Complete quest today.</span>
              </p>
            ) : (
              <p className="text-[10px] text-mute mt-1.5">Record: {streak.longest || 0}d</p>
            )}
          </div>
        </div>
      </div>

      {/* Attributes Skill Tree */}
      <div className="rpg-glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-ink">
            <LightningIcon className="w-4 h-4 text-amber" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Core Attributes
            </h3>
          </div>
          <span className="text-[10px] text-mute">10 pts = 1 Tier</span>
        </div>

        <ul className="space-y-3.5">
          {Object.entries(ATTRIBUTE_META).map(([key, meta]) => {
            const points = attributes[key] ?? 0;
            const { tier, progress } = attributeTier(points);

            return (
              <li key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AttributeIcon name={key} className="w-4 h-4 text-indigo" />
                    <span className="font-medium text-ink">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-medium px-1.5 py-0.2 rounded bg-paper border border-hairline text-ink tabular-nums">
                      Tier {tier}
                    </span>
                    <span className="text-mute tabular-nums">({points} pts)</span>
                  </div>
                </div>
                <ProgressBar
                  value={progress}
                  max={1}
                  colorClass="bg-indigo"
                  trackClass="bg-hairline/60"
                />
              </li>
            );
          })}
        </ul>
      </div>

      {/* Badges & Achievements */}
      <div className="rpg-glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-ink">
            <TrophyIcon className="w-4 h-4 text-amber" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Trophies & Badges
            </h3>
          </div>
          <span className="text-[10px] text-indigo font-medium tabular-nums">
            {badges?.length || 0} unlocked
          </span>
        </div>

        {badges && badges.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {badges.map((b) => (
              <div
                key={b.id || b.value}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-paper/70 border border-hairline hover:border-indigo/30 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-surface border border-hairline flex items-center justify-center text-amber shrink-0">
                  <BadgeIcon name={b.value} className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate text-ink">{b.name}</p>
                  <p className="text-[10px] text-mute truncate">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-paper/50 border border-dashed border-hairline text-center">
            <p className="text-xs text-mute">No trophies claimed yet.</p>
            <p className="text-[10px] text-mute mt-0.5">Visit the Bazaar to unlock your first badge!</p>
          </div>
        )}
      </div>

      {/* Realm Theme Switcher */}
      {ownedThemes && ownedThemes.length > 1 && (
        <div className="rpg-glass rounded-xl p-4 space-y-2">
          <p className="text-[11px] text-mute font-medium uppercase tracking-wider">
            Active Realm Theme
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ownedThemes.map((th) => (
              <button
                key={th}
                onClick={() => handleQuickTheme(th)}
                className={`text-xs px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                  activeTheme === th
                    ? "bg-ink text-paper shadow-xs"
                    : "bg-paper border border-hairline text-mute hover:text-ink"
                }`}
              >
                {th}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Guide button at bottom of sheet */}
      {onOpenGuide && (
        <button
          onClick={onOpenGuide}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-hairline bg-surface/60 hover:bg-surface text-xs font-medium text-mute hover:text-ink transition-all shadow-2xs"
        >
          <BookIcon className="w-3.5 h-3.5 text-indigo" />
          <span>Open Adventurer&apos;s Guide</span>
        </button>
      )}
    </div>
  );
}

/* commit_stage_35_ayush */
