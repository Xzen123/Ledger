import { useEffect, useState } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import CharacterPanel from "./CharacterPanel.jsx";
import TutorialModal from "./TutorialModal.jsx";
import AccountDisabledModal from "./AccountDisabledModal.jsx";
import {
  SwordIcon,
  GoldCoinIcon,
  FlameIcon,
  BookIcon,
  VolumeOnIcon,
  VolumeOffIcon,
  TrophyIcon,
  AlertTriangleIcon,
} from "./Icons.jsx";
import { isSoundEnabled, toggleSound } from "../lib/sound.js";

const NAV_LINKS = [
  { to: "/", label: "Overview", end: true },
  { to: "/quests", label: "Quests" },
  { to: "/shop", label: "Shop" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/profile", label: "Profile" },
];

export default function AppShell() {
  const { character, logout } = useAuth();
  const theme = character?.activeTheme || "default";
  const [showTutorial, setShowTutorial] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  // First time login auto-trigger for tutorial
  useEffect(() => {
    const hasSeen = localStorage.getItem("liferpg_tutorial_seen");
    if (!hasSeen) {
      setShowTutorial(true);
      localStorage.setItem("liferpg_tutorial_seen", "true");
    }
  }, []);

  return (
    <div className={`min-h-screen bg-paper text-ink theme-${theme} relative`}>
      {/* Ambient background glow */}
      <div className="ambient-glow absolute inset-0 pointer-events-none h-96 w-full" aria-hidden="true" />

      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      <AccountDisabledModal
        isOpen={Boolean(character?.isDisabled)}
        reason={character?.disabledReason}
        flags={character?.flags || 4}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-ink focus:text-paper focus:px-3 focus:py-2 focus:rounded z-50"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-display text-xl tracking-tight flex items-center gap-2">
              <SwordIcon className="w-5 h-5 text-amber" />
              <span>Ledger</span>
            </span>

            <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
                      isActive
                        ? "bg-ink text-paper shadow-sm"
                        : "text-mute hover:text-ink hover:bg-paper"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Center / Right Quick Stats HUD */}
          <div className="flex items-center gap-3 sm:gap-4">
            {character && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-full bg-paper border border-hairline text-xs">
                <span className="font-medium text-indigo">Lvl {character.level}</span>
                <span className="text-hairline">|</span>
                <span className="font-medium text-amber flex items-center gap-1">
                  <GoldCoinIcon className="w-3.5 h-3.5 text-amber" />
                  <span>{character.gold}g</span>
                </span>
                <span className="text-hairline">|</span>
                <span className="font-medium text-moss flex items-center gap-1">
                  <span className="flame-flicker text-orange-500">
                    <FlameIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>{character.streak?.current || 0}d</span>
                </span>
                {character.flags > 0 && (
                  <>
                    <span className="text-hairline">|</span>
                    <span
                      className="font-bold text-amber-500 flex items-center gap-1 text-[11px]"
                      title={`Sentinel AI Warning: ${character.flags} of 3 strikes before account lock`}
                    >
                      <AlertTriangleIcon className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                      <span>{character.flags}/3 Strikes</span>
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Sound FX Toggle Button */}
            <button
              type="button"
              onClick={() => setSoundOn(toggleSound())}
              className="text-xs flex items-center gap-1 px-2 py-1.5 rounded-md border border-hairline text-mute hover:text-ink bg-surface hover:bg-paper transition-all shadow-2xs"
              title={soundOn ? "Mute RPG Sound FX" : "Unmute RPG Sound FX"}
              aria-label={soundOn ? "Mute audio" : "Unmute audio"}
            >
              {soundOn ? (
                <VolumeOnIcon className="w-3.5 h-3.5 text-indigo" />
              ) : (
                <VolumeOffIcon className="w-3.5 h-3.5 text-mute" />
              )}
            </button>

            {/* How to Play / Guide Button */}
            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline text-mute hover:text-ink bg-surface hover:bg-paper transition-all shadow-2xs"
              title="View the Adventurer's Guide"
            >
              <BookIcon className="w-3.5 h-3.5 text-indigo" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            <div className="flex items-center gap-2 border-l border-hairline pl-3">
              <Link
                to="/profile"
                className="hidden lg:inline text-xs font-medium text-mute hover:text-ink max-w-[120px] truncate transition-colors"
                title="View & Edit Character Profile"
              >
                {character?.fullName || character?.username}
              </Link>
              <button
                onClick={logout}
                className="text-xs text-mute hover:text-clay px-2 py-1.5 rounded-md transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <nav aria-label="Mobile Navigation" className="flex md:hidden border-t border-hairline bg-surface">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex-1 text-center py-2.5 text-xs font-medium ${
                  isActive ? "text-ink border-b-2 border-ink font-semibold" : "text-mute"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 relative z-10">
        <aside aria-label="Character sheet">
          <CharacterPanel onOpenGuide={() => setShowTutorial(true)} />
        </aside>
        <main id="main-content">
          <Outlet context={{ onOpenGuide: () => setShowTutorial(true) }} />
        </main>
      </div>
    </div>
  );
}
