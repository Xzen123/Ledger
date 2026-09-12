// Non-linear progression curve.
// Each level costs more XP than the last, so early levels feel fast
// and higher levels feel earned. Tuned so lvl 1->2 = 100xp, lvl 10->11 = ~1300xp.
function xpToReachNextLevel(level) {
  return Math.round(100 * Math.pow(level, 1.45));
}

// Applies an XP gain to a {level, xp} pair, rolling over as many
// level-ups as the gain covers. Returns the new state plus how many
// levels were gained (for the frontend to animate).
function applyXp(currentLevel, currentXp, xpGained) {
  let level = currentLevel;
  let xp = currentXp + xpGained;
  let levelsGained = 0;

  while (xp >= xpToReachNextLevel(level)) {
    xp -= xpToReachNextLevel(level);
    level += 1;
    levelsGained += 1;
  }

  return { level, xp, levelsGained };
}

// Difficulty multipliers drive both XP and gold rewards for a task.
const DIFFICULTY_REWARDS = {
  easy: { xp: 15, gold: 5 },
  medium: { xp: 35, gold: 12 },
  hard: { xp: 70, gold: 25 },
  epic: { xp: 140, gold: 55 },
};

function rewardsForDifficulty(difficulty) {
  return DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.medium;
}

module.exports = { xpToReachNextLevel, applyXp, rewardsForDifficulty, DIFFICULTY_REWARDS };

/* commit_stage_10_xzen */
