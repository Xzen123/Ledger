const { xpToReachNextLevel } = require("./leveling");
const { isStreakAtRisk, isStreakBroken } = require("./streaks");

const db = require("../db");

function serializeCharacter(user) {
  let purchases = [];
  try {
    purchases = db
      .prepare(
        `SELECT si.id, si.name, si.description, si.type, si.value, p.purchased_at
         FROM purchases p
         JOIN shop_items si ON si.id = p.item_id
         WHERE p.user_id = ?
         ORDER BY p.purchased_at ASC`
      )
      .all(user.id);
  } catch {
    purchases = [];
  }

  const badges = purchases.filter((p) => p.type === "badge");
  const cosmetics = purchases.filter((p) => p.type === "cosmetic");
  const ownedThemes = ["default", ...purchases.filter((p) => p.type === "theme").map((p) => p.value)];
  const hasAura = purchases.some((p) => p.value === "focus-aura");

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    level: user.level,
    xp: user.xp,
    xpToNextLevel: xpToReachNextLevel(user.level),
    gold: user.gold,
    activeTheme: user.active_theme || "default",
    ownedThemes,
    badges,
    cosmetics,
    hasAura,
    streak: {
      current: user.current_streak,
      longest: user.longest_streak,
      lastActiveDate: user.last_active_date,
      atRisk: isStreakAtRisk(user.last_active_date),
      broken: isStreakBroken(user.last_active_date),
    },
    attributes: {
      intellect: user.attr_intellect,
      strength: user.attr_strength,
      discipline: user.attr_discipline,
      creativity: user.attr_creativity,
      vitality: user.attr_vitality,
    },
    flags: user.flags || 0,
    isDisabled: Boolean(user.is_disabled),
    disabledReason: user.disabled_reason || null,
    fullName: user.full_name || "",
    place: user.place || "",
    college: user.college || "",
    age: user.age || null,
    gender: user.gender || "",
  };
}

function serializeTask(task) {
  let aiVerdict = null;
  if (task.ai_verdict) {
    try {
      aiVerdict = JSON.parse(task.ai_verdict);
    } catch {
      aiVerdict = task.ai_verdict;
    }
  }

  return {
    id: task.id,
    title: task.title,
    notes: task.notes || "",
    attribute: task.attribute,
    difficulty: task.difficulty,
    status: task.status,
    createdAt: task.created_at,
    completedAt: task.completed_at,
    completionDurationSeconds: task.completion_duration_seconds,
    flagged: Boolean(task.flagged),
    aiVerdict,
  };
}

module.exports = { serializeCharacter, serializeTask };
