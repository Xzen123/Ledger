import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { TrophyIcon, ShieldIcon, FlameIcon } from "./Icons.jsx";

export default function LiveLeaderboardWidget() {
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLeaderboard("daily")
      .then((data) => setTopPlayers((data.players || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-hairline bg-surface/70 backdrop-blur-md p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-amber" />
          <h3 className="font-display text-base font-semibold text-ink">
            Live Daily Champions
          </h3>
        </div>
        <Link
          to="/leaderboard"
          className="text-xs font-medium text-indigo hover:text-ink transition-colors flex items-center gap-1"
        >
          <span>Full Leaderboard</span>
          <span>→</span>
        </Link>
      </div>

      {loading && (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 skeleton rounded-lg" />
          ))}
        </div>
      )}

      {!loading && topPlayers.length === 0 && (
        <p className="text-xs text-mute py-4 text-center">
          No quests completed today yet. Be the first to claim #1!
        </p>
      )}

      {!loading && topPlayers.length > 0 && (
        <div className="space-y-2">
          {topPlayers.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-hairline/80 bg-paper/50 hover:bg-paper transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs w-5 text-center text-mute">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </span>
                <span className="font-semibold text-ink truncate max-w-[130px]">
                  {player.username}
                </span>
                <span className="text-[10px] text-indigo font-medium px-1.5 py-0.2 rounded bg-indigo-soft">
                  Lvl {player.level}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-ink">
                  {player.score} {player.score === 1 ? "quest" : "quests"}
                </span>
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                    player.securityStatus === "banned"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : player.securityStatus === "flagged"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {player.securityStatus === "flagged" ? "⚠️ Flagged" : player.securityStatus === "banned" ? "Banned" : "Verified"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* commit_stage_107_ayush */
