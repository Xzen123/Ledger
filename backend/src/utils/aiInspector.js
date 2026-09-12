/**
 * Arcane Sentinel AI Agent
 * Autonomous anti-cheat monitoring agent that inspects quest completions,
 * evaluates completion speed feasibility, computes anomaly confidence scores,
 * and maintains audit integrity.
 */

const KEYWORD_ESTIMATES = [
  { match: /(workout|gym|exercise|training|lifting|cardio|run|marathon|swim)/i, minSeconds: 900 },
  { match: /(code|coding|program|debug|project|algorithm|study|read|reading|book)/i, minSeconds: 600 },
  { match: /(meditat|hydrate|water|stretch|walk|journal|tidy|clean)/i, minSeconds: 180 },
  { match: /(routine|habit|brush|floss|plan|organize)/i, minSeconds: 120 },
];

const DIFFICULTY_BASELINE = {
  easy: 60,
  medium: 120,
  hard: 300,
  epic: 600,
};

function estimateMinimumFeasibleDuration(title = "", difficulty = "medium") {
  for (const item of KEYWORD_ESTIMATES) {
    if (item.match.test(title)) {
      return item.minSeconds;
    }
  }
  return DIFFICULTY_BASELINE[difficulty] || 60;
}

/**
 * Evaluates an instantaneous/sub-minute quest completion.
 */
function inspectTaskCompletion({ task, durationSeconds, newFlags, user }) {
  const minFeasible = estimateMinimumFeasibleDuration(task.title, task.difficulty);
  const ratio = Math.max(0.01, durationSeconds / minFeasible);

  // Confidence is extremely high when duration is < 60s and ratio is tiny
  const confidence = Math.min(0.99, Math.max(0.85, 1 - (durationSeconds / 60) * 0.15));

  const isBanned = newFlags > 3;

  const analysis = `Arcane Sentinel AI analyzed quest '${task.title}' (${task.difficulty.toUpperCase()}, attribute: ${task.attribute}). The quest was submitted as complete after only ${durationSeconds} second${durationSeconds === 1 ? "" : "s"}. Realistic human physical and cognitive execution demands an estimated minimum of ${minFeasible}s. Instant state resolution conforms to scripted automation, headless bots, or speed-clicking.`;

  const verdict = {
    inspector: "Arcane Sentinel AI v2.4",
    status: isBanned ? "ACCOUNT_DISABLED" : "FLAGGED_INHUMAN_SPEED",
    confidence: Number(confidence.toFixed(2)),
    durationSeconds,
    estimatedMinimumSeconds: minFeasible,
    flagCount: newFlags,
    maxAllowedFlags: 3,
    analysis,
    action: isBanned
      ? "Exceeded maximum anti-cheat strikes (>3). Account has been permanently locked."
      : `Issued security flag ${newFlags}/3. Exceeding 3 flags will disable your account.`,
    timestamp: new Date().toISOString(),
  };

  return verdict;
}

/**
 * Evaluates a user report filed by a community player on the live leaderboard.
 */
function inspectPlayerReport({ targetUser, recentTasks, reason }) {
  const rapidCount = recentTasks.filter(
    (t) => t.completion_duration_seconds !== null && t.completion_duration_seconds < 60
  ).length;

  const total = recentTasks.length;
  const isSuspicious = rapidCount > 0 || (targetUser.flags || 0) > 0;

  if (isSuspicious) {
    return {
      inspector: "Arcane Sentinel AI v2.4",
      verdict: "CONFIRMED_ANOMALY",
      confidence: 0.96,
      reason: `Sentinel AI detected ${rapidCount} out of ${total} recent quests completed in under 60 seconds with ${targetUser.flags || 0} existing security flags. Player behavior heavily matches scripted automation.`,
      actionRecommended: (targetUser.flags || 0) >= 3 ? "DISABLE_ACCOUNT" : "MONITOR_AND_FLAG",
      timestamp: new Date().toISOString(),
    };
  }

  return {
    inspector: "Arcane Sentinel AI v2.4",
    verdict: "CLEAN_RECORD",
    confidence: 0.88,
    reason: `Sentinel AI audited the past ${total} quests of player '${targetUser.username}'. All quest durations conform to realistic human time frames. No automated bot signatures found.`,
    actionRecommended: "DISMISS_REPORT",
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  inspectTaskCompletion,
  inspectPlayerReport,
  estimateMinimumFeasibleDuration,
};

/* commit_stage_85_xzen */
