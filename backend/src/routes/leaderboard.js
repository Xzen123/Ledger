const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { inspectPlayerReport } = require("../utils/aiInspector");

const router = express.Router();

function getTopAttribute(u) {
  const attrs = {
    intellect: u.attr_intellect || 0,
    strength: u.attr_strength || 0,
    discipline: u.attr_discipline || 0,
    creativity: u.attr_creativity || 0,
    vitality: u.attr_vitality || 0,
  };
  let maxAttr = "discipline";
  let maxVal = -1;
  for (const [k, v] of Object.entries(attrs)) {
    if (v > maxVal) {
      maxVal = v;
      maxAttr = k;
    }
  }
  return maxAttr;
}

// GET /api/leaderboard?period=daily|all-time
router.get("/", (req, res) => {
  const period = req.query.period === "all-time" ? "all-time" : "daily";
  const today = new Date().toISOString().slice(0, 10);

  let players = [];

  if (period === "daily") {
    const rows = db
      .prepare(`
        SELECT 
          u.id, u.username, u.level, u.xp, u.gold, u.current_streak, u.active_theme,
          u.attr_intellect, u.attr_strength, u.attr_discipline, u.attr_creativity, u.attr_vitality,
          u.flags, u.is_disabled,
          COUNT(t.id) as quests_today,
          SUM(CASE WHEN t.flagged = 1 THEN 1 ELSE 0 END) as flagged_today
        FROM users u
        LEFT JOIN tasks t ON t.user_id = u.id AND t.status = 'completed' AND substr(t.completed_at, 1, 10) = ?
        GROUP BY u.id
        ORDER BY quests_today DESC, u.level DESC, u.xp DESC
        LIMIT 50
      `)
      .all(today);

    players = rows.map((r, idx) => ({
      rank: idx + 1,
      id: r.id,
      username: r.username,
      level: r.level,
      xp: r.xp,
      gold: r.gold,
      streak: r.current_streak,
      theme: r.active_theme || "default",
      topAttribute: getTopAttribute(r),
      score: r.quests_today,
      scoreLabel: `${r.quests_today} quest${r.quests_today === 1 ? "" : "s"} today`,
      flags: r.flags || 0,
      isDisabled: Boolean(r.is_disabled),
      securityStatus: r.is_disabled
        ? "banned"
        : r.flags > 0
        ? "flagged"
        : "verified",
      statusLabel: r.is_disabled
        ? "Banned (Sentinel)"
        : r.flags > 0
        ? `⚠️ Flagged (${r.flags}/3)`
        : "Verified Human",
    }));
  } else {
    const rows = db
      .prepare(`
        SELECT 
          u.id, u.username, u.level, u.xp, u.gold, u.current_streak, u.longest_streak, u.active_theme,
          u.attr_intellect, u.attr_strength, u.attr_discipline, u.attr_creativity, u.attr_vitality,
          u.flags, u.is_disabled,
          COUNT(t.id) as total_quests,
          SUM(CASE WHEN t.flagged = 1 THEN 1 ELSE 0 END) as total_flagged
        FROM users u
        LEFT JOIN tasks t ON t.user_id = u.id AND t.status = 'completed'
        GROUP BY u.id
        ORDER BY u.level DESC, u.xp DESC, total_quests DESC
        LIMIT 50
      `)
      .all();

    players = rows.map((r, idx) => ({
      rank: idx + 1,
      id: r.id,
      username: r.username,
      level: r.level,
      xp: r.xp,
      gold: r.gold,
      streak: r.current_streak,
      longestStreak: r.longest_streak,
      theme: r.active_theme || "default",
      topAttribute: getTopAttribute(r),
      score: r.total_quests,
      scoreLabel: `Lvl ${r.level} • ${r.total_quests} quests`,
      flags: r.flags || 0,
      isDisabled: Boolean(r.is_disabled),
      securityStatus: r.is_disabled
        ? "banned"
        : r.flags > 0
        ? "flagged"
        : "verified",
      statusLabel: r.is_disabled
        ? "Banned (Sentinel)"
        : r.flags > 0
        ? `⚠️ Flagged (${r.flags}/3)`
        : "Verified Human",
    }));
  }

  res.json({ period, players, totalPlayers: players.length });
});

// GET /api/leaderboard/audit-logs
router.get("/audit-logs", (req, res) => {
  const reports = db
    .prepare(`
      SELECT br.*, u.username as target_username
      FROM bot_reports br
      JOIN users u ON u.id = br.target_user_id
      ORDER BY br.created_at DESC
      LIMIT 15
    `)
    .all();

  res.json({
    reports: reports.map((r) => {
      let parsedVerdict = null;
      try {
        parsedVerdict = JSON.parse(r.ai_verdict);
      } catch {
        parsedVerdict = r.ai_verdict;
      }
      return {
        id: r.id,
        targetUsername: r.target_username,
        reason: r.reason,
        aiVerdict: parsedVerdict,
        aiConfidence: r.ai_confidence,
        createdAt: r.created_at,
      };
    }),
  });
});

// POST /api/leaderboard/report
router.post("/report", requireAuth, (req, res) => {
  const { targetUserId, reason } = req.body || {};
  if (!targetUserId || !reason) {
    return res.status(400).json({ error: "Target player and report reason are required." });
  }

  const targetUser = db.prepare("SELECT * FROM users WHERE id = ?").get(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: "Player not found." });
  }

  const recentTasks = db
    .prepare(
      "SELECT id, title, completion_duration_seconds, flagged, completed_at FROM tasks WHERE user_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 10"
    )
    .all(targetUserId);

  const aiAudit = inspectPlayerReport({ targetUser, recentTasks, reason });

  const result = db
    .prepare(
      "INSERT INTO bot_reports (reporter_id, target_user_id, task_id, reason, ai_verdict, ai_confidence) VALUES (?, ?, NULL, ?, ?, ?)"
    )
    .run(req.userId, targetUserId, reason, JSON.stringify(aiAudit), aiAudit.confidence);

  res.status(201).json({
    reportId: result.lastInsertRowid,
    targetUsername: targetUser.username,
    aiAgent: aiAudit,
    message: `Report filed successfully. Arcane Sentinel AI reviewed player '${targetUser.username}'.`,
  });
});

// GET /api/leaderboard/college
router.get("/college", (req, res) => {
  const targetCollege = (req.query.college || "").trim();

  // 1. All Colleges aggregated ranking
  const collegeRows = db
    .prepare(`
      SELECT 
        u.college,
        COUNT(DISTINCT u.id) as member_count,
        ROUND(AVG(u.level), 1) as avg_level,
        COUNT(t.id) as total_quests
      FROM users u
      LEFT JOIN tasks t ON t.user_id = u.id AND t.status = 'completed'
      WHERE u.college IS NOT NULL AND TRIM(u.college) != ''
      GROUP BY LOWER(TRIM(u.college))
      ORDER BY total_quests DESC, member_count DESC, avg_level DESC
      LIMIT 50
    `)
    .all();

  const collegeGuilds = collegeRows.map((r, idx) => ({
    rank: idx + 1,
    college: r.college,
    memberCount: r.member_count,
    avgLevel: r.avg_level || 1.0,
    totalQuests: r.total_quests || 0,
  }));

  // 2. Intra-college member roster if a college is specified
  let campusMembers = [];
  if (targetCollege) {
    const memberRows = db
      .prepare(`
        SELECT 
          u.id, u.username, u.full_name, u.college, u.place, u.level, u.xp, u.gold, u.current_streak, u.active_theme,
          u.attr_intellect, u.attr_strength, u.attr_discipline, u.attr_creativity, u.attr_vitality,
          u.flags, u.is_disabled,
          COUNT(t.id) as quests_completed
        FROM users u
        LEFT JOIN tasks t ON t.user_id = u.id AND t.status = 'completed'
        WHERE LOWER(TRIM(u.college)) = LOWER(TRIM(?))
        GROUP BY u.id
        ORDER BY quests_completed DESC, u.level DESC, u.xp DESC
        LIMIT 50
      `)
      .all(targetCollege);

    campusMembers = memberRows.map((r, idx) => ({
      rank: idx + 1,
      id: r.id,
      username: r.username,
      fullName: r.full_name || "",
      place: r.place || "",
      college: r.college,
      level: r.level,
      xp: r.xp,
      gold: r.gold,
      streak: r.current_streak,
      theme: r.active_theme || "default",
      topAttribute: getTopAttribute(r),
      score: r.quests_completed,
      scoreLabel: `${r.quests_completed} quest${r.quests_completed === 1 ? "" : "s"}`,
      flags: r.flags || 0,
      isDisabled: Boolean(r.is_disabled),
      securityStatus: r.is_disabled ? "banned" : r.flags > 0 ? "flagged" : "verified",
      statusLabel: r.is_disabled ? "Banned" : r.flags > 0 ? `⚠️ Flagged (${r.flags}/3)` : "Verified Human",
    }));
  }

  res.json({
    collegeGuilds,
    campusCollege: targetCollege || null,
    campusMembers,
  });
});

module.exports = router;
