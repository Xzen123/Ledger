// Streak logic is date-only (no time-of-day component) so a user only
// needs to complete one task per calendar day to keep their streak alive.
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(isoA, isoB) {
  const a = new Date(isoA + "T00:00:00Z");
  const b = new Date(isoB + "T00:00:00Z");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// Given the user's stored streak state, returns the updated state after
// an activity (task completion) happens right now.
function registerActivity({ lastActiveDate, currentStreak, longestStreak }) {
  const today = todayISO();

  if (lastActiveDate === today) {
    // Already active today — streak unchanged.
    return { lastActiveDate: today, currentStreak, longestStreak };
  }

  let nextStreak;
  if (!lastActiveDate) {
    nextStreak = 1;
  } else {
    const gap = daysBetween(lastActiveDate, today);
    nextStreak = gap === 1 ? currentStreak + 1 : 1;
  }

  return {
    lastActiveDate: today,
    currentStreak: nextStreak,
    longestStreak: Math.max(longestStreak, nextStreak),
  };
}

// A streak is "at risk" if the user was active yesterday but not yet today —
// useful for the frontend to show a warning.
function isStreakAtRisk(lastActiveDate) {
  if (!lastActiveDate) return false;
  const today = todayISO();
  if (lastActiveDate === today) return false;
  return daysBetween(lastActiveDate, today) === 1;
}

// A streak is broken if more than one day has passed with no activity.
function isStreakBroken(lastActiveDate) {
  if (!lastActiveDate) return false;
  const today = todayISO();
  return daysBetween(lastActiveDate, today) > 1;
}

module.exports = { todayISO, registerActivity, isStreakAtRisk, isStreakBroken };

/* commit_stage_81_xzen */
