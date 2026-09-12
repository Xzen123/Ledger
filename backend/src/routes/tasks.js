const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { applyXp, rewardsForDifficulty, DIFFICULTY_REWARDS } = require("../utils/leveling");
const { registerActivity } = require("../utils/streaks");
const { serializeTask, serializeCharacter } = require("../utils/serialize");

const router = express.Router();
router.use(requireAuth);

const ATTRIBUTES = ["intellect", "strength", "discipline", "creativity", "vitality"];
const DIFFICULTIES = Object.keys(DIFFICULTY_REWARDS);

function attrColumn(attribute) {
  return `attr_${attribute}`;
}

function validateTaskInput(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (!body.title || !String(body.title).trim()) errors.push("Title is required.");
    if (body.title && String(body.title).length > 140) errors.push("Title must be 140 characters or fewer.");
  }
  if (body.attribute !== undefined && !ATTRIBUTES.includes(body.attribute)) {
    errors.push(`Attribute must be one of: ${ATTRIBUTES.join(", ")}.`);
  }
  if (body.difficulty !== undefined && !DIFFICULTIES.includes(body.difficulty)) {
    errors.push(`Difficulty must be one of: ${DIFFICULTIES.join(", ")}.`);
  }
  return errors;
}

router.get("/", (req, res) => {
  const status = req.query.status;
  let rows;
  if (status === "pending" || status === "completed") {
    rows = db
      .prepare("SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC")
      .all(req.userId, status);
  } else {
    rows = db
      .prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC")
      .all(req.userId);
  }
  res.json({ tasks: rows.map(serializeTask) });
});

const ARCHETYPES = {
  intellect: {
    key: "intellect",
    title: "Grand Magus",
    subtitle: "Master of Arcane Lore & Deep Focus",
    description: "Your relentless pursuit of knowledge, coding, and problem-solving shapes your destiny.",
    color: "indigo",
  },
  strength: {
    key: "strength",
    title: "Titan Warlord",
    subtitle: "Iron Vanguard of Might & Resilience",
    description: "Forged in intense physical training and unrelenting exertion, your raw power commands respect.",
    color: "rose",
  },
  discipline: {
    key: "discipline",
    title: "Order Sentinel",
    subtitle: "Grand Justiciar of Routine & Habit",
    description: "Unshakable consistency and precision allow you to conquer chaos one daily duty at a time.",
    color: "amber",
  },
  creativity: {
    key: "creativity",
    title: "Mythic Artisan",
    subtitle: "Weaver of Visions & Innovation",
    description: "You bend reality to your imagination, manifesting novel ideas, design, and inspiring artistry.",
    color: "purple",
  },
  vitality: {
    key: "vitality",
    title: "Wild Warden",
    subtitle: "Phoenix Champion of Health & Endurance",
    description: "Attuned to vitality, hydration, and restorative sleep, your endurance outlasts all adversity.",
    color: "emerald",
  },
  polymath: {
    key: "polymath",
    title: "Polymath Ascendant",
    subtitle: "Harmonious Sovereign of All Arts",
    description: "A balanced soul advancing mind, body, spirit, and craft equally across every questing path.",
    color: "amber",
  },
};

function determineArchetype(attributes) {
  const entries = Object.entries(attributes);
  const maxVal = Math.max(...entries.map(([, v]) => v));
  if (maxVal === 0) return ARCHETYPES.polymath;

  const topEntries = entries.filter(([, v]) => v === maxVal);
  if (topEntries.length > 1) {
    return ARCHETYPES.polymath;
  }
  return ARCHETYPES[topEntries[0][0]] || ARCHETYPES.polymath;
}

router.get("/analytics", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const completedTasks = db
    .prepare(
      "SELECT id, attribute, difficulty, completed_at FROM tasks WHERE user_id = ? AND status = 'completed' AND completed_at IS NOT NULL ORDER BY completed_at ASC"
    )
    .all(req.userId);

  const countMap = {};
  const attributeTaskCounts = {
    intellect: 0,
    strength: 0,
    discipline: 0,
    creativity: 0,
    vitality: 0,
  };

  completedTasks.forEach((t) => {
    const day = (t.completed_at || "").slice(0, 10);
    if (day) {
      countMap[day] = (countMap[day] || 0) + 1;
    }
    if (attributeTaskCounts[t.attribute] !== undefined) {
      attributeTaskCounts[t.attribute] += 1;
    }
  });

  const attributes = {
    intellect: user.attr_intellect,
    strength: user.attr_strength,
    discipline: user.attr_discipline,
    creativity: user.attr_creativity,
    vitality: user.attr_vitality,
  };

  const archetype = determineArchetype(attributes);

  // Generate heatmap grid for the past 112 days (16 weeks x 7 days)
  const heatmapDays = [];
  const today = new Date();
  const NUM_DAYS = 112;
  for (let i = NUM_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = countMap[dateStr] || 0;
    heatmapDays.push({
      date: dateStr,
      count,
      level: count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4,
    });
  }

  const activeDays = heatmapDays.filter((d) => d.count > 0).length;

  res.json({
    totalCompleted: completedTasks.length,
    activeDaysPast16Weeks: activeDays,
    streak: {
      current: user.current_streak,
      longest: user.longest_streak,
      lastActiveDate: user.last_active_date,
    },
    attributes,
    attributeTaskCounts,
    archetype,
    heatmap: heatmapDays,
  });
});

router.post("/", (req, res) => {
  const body = req.body || {};
  const errors = validateTaskInput(body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  const attribute = body.attribute || "discipline";
  const difficulty = body.difficulty || "medium";
  const result = db
    .prepare(
      "INSERT INTO tasks (user_id, title, notes, attribute, difficulty) VALUES (?, ?, ?, ?, ?)"
    )
    .run(req.userId, String(body.title).trim(), body.notes || null, attribute, difficulty);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ task: serializeTask(task) });
});

router.put("/:id", (req, res) => {
  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.userId);
  if (!task) return res.status(404).json({ error: "Quest not found." });
  if (task.status === "completed") {
    return res.status(409).json({ error: "Completed quests can't be edited." });
  }

  const body = req.body || {};
  const errors = validateTaskInput(body, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  db.prepare(
    "UPDATE tasks SET title = ?, notes = ?, attribute = ?, difficulty = ? WHERE id = ?"
  ).run(
    body.title !== undefined ? String(body.title).trim() : task.title,
    body.notes !== undefined ? body.notes : task.notes,
    body.attribute !== undefined ? body.attribute : task.attribute,
    body.difficulty !== undefined ? body.difficulty : task.difficulty,
    task.id
  );

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(task.id);
  res.json({ task: serializeTask(updated) });
});

router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.userId);
  if (result.changes === 0) return res.status(404).json({ error: "Quest not found." });
  res.status(204).end();
});

// Completing a quest is the core reward loop: XP, gold, an attribute
// Completing a quest is the core reward loop: XP, gold, an attribute
// bump, and a streak update all happen atomically.
const { inspectTaskCompletion } = require("../utils/aiInspector");

router.post("/:id/complete", (req, res) => {
  const complete = db.transaction(() => {
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.userId);
    if (!task) return { status: 404, error: "Quest not found." };
    if (task.status === "completed") return { status: 409, error: "Quest already completed." };

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
    if (user.is_disabled) {
      return {
        status: 403,
        error: user.disabled_reason || "Account suspended by Arcane Sentinel AI.",
      };
    }

    const rewards = rewardsForDifficulty(task.difficulty);
    const { level, xp, levelsGained } = applyXp(user.level, user.xp, rewards.xp);
    const streak = registerActivity({
      lastActiveDate: user.last_active_date,
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
    });
    const col = attrColumn(task.attribute);

    // Anti-Cheat: calculate seconds between task creation and now
    let durationSeconds = 60;
    if (task.created_at) {
      const createdStr = task.created_at.includes("T")
        ? task.created_at
        : task.created_at.replace(" ", "T") + "Z";
      const createdMs = new Date(createdStr).getTime();
      const nowMs = Date.now();
      durationSeconds = Math.max(0, Math.round((nowMs - createdMs) / 1000));
    }

    const isTooFast = durationSeconds < 60;
    let newFlags = user.flags || 0;
    let isDisabled = user.is_disabled === 1;
    let disabledReason = user.disabled_reason || null;
    let aiVerdict = null;

    if (isTooFast) {
      newFlags += 1;
      aiVerdict = inspectTaskCompletion({
        task,
        durationSeconds,
        newFlags,
        user,
      });

      if (newFlags > 3) {
        isDisabled = true;
        disabledReason = `Account locked by Arcane Sentinel AI: Exceeded 3 anti-cheat violations (${newFlags} strikes). Quest '${task.title}' was resolved in ${durationSeconds}s (<60s threshold).`;
      }

      try {
        db.prepare(
          "INSERT INTO bot_reports (reporter_id, target_user_id, task_id, reason, ai_verdict, ai_confidence) VALUES (NULL, ?, ?, ?, ?, ?)"
        ).run(
          user.id,
          task.id,
          `Quest '${task.title}' completed in ${durationSeconds}s (sub-minute threshold)`,
          JSON.stringify(aiVerdict),
          aiVerdict.confidence
        );
      } catch {}
    }

    db.prepare(
      `UPDATE users SET level = ?, xp = ?, gold = gold + ?, ${col} = ${col} + 1,
       current_streak = ?, longest_streak = ?, last_active_date = ?,
       flags = ?, is_disabled = ?, disabled_reason = ? WHERE id = ?`
    ).run(
      level,
      xp,
      rewards.gold,
      streak.currentStreak,
      streak.longestStreak,
      streak.lastActiveDate,
      newFlags,
      isDisabled ? 1 : 0,
      disabledReason,
      user.id
    );

    db.prepare(
      "UPDATE tasks SET status = 'completed', completed_at = datetime('now'), completion_duration_seconds = ?, flagged = ?, ai_verdict = ? WHERE id = ?"
    ).run(durationSeconds, isTooFast ? 1 : 0, aiVerdict ? JSON.stringify(aiVerdict) : null, task.id);

    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(task.id);

    return {
      status: 200,
      task: serializeTask(updatedTask),
      character: serializeCharacter(updatedUser),
      rewards: { xp: rewards.xp, gold: rewards.gold, levelsGained },
      antiCheat: {
        durationSeconds,
        flagged: isTooFast,
        flags: newFlags,
        maxFlags: 3,
        isDisabled,
        disabledReason,
        aiAgent: aiVerdict,
      },
    };
  });

  const result = complete();
  if (result.error) return res.status(result.status).json({ error: result.error, isDisabled: Boolean(result.error && result.status === 403) });
  res.status(result.status).json(result);
});

// Appeal / Admin Reset for Local Testing
router.post("/appeal-reset", (req, res) => {
  db.prepare("UPDATE users SET flags = 0, is_disabled = 0, disabled_reason = NULL WHERE id = ?").run(req.userId);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  res.json({ character: serializeCharacter(user), message: "Account restored and flags cleared by Sentinel Appeal." });
});

module.exports = router;

/* commit_stage_87_xzen */
