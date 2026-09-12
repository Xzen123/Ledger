const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { serializeCharacter } = require("../utils/serialize");

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "Character not found." });
  res.json({ character: serializeCharacter(user) });
});

router.put("/theme", (req, res) => {
  const { theme } = req.body || {};
  if (!theme) return res.status(400).json({ error: "Theme is required." });

  const owned = db
    .prepare(
      `SELECT si.value FROM purchases p
       JOIN shop_items si ON si.id = p.item_id
       WHERE p.user_id = ? AND si.type = 'theme' AND si.value = ?`
    )
    .get(req.userId, theme);
  const isDefault = theme === "default";

  if (!isDefault && !owned) {
    return res.status(403).json({ error: "You don't own that theme yet." });
  }

  db.prepare("UPDATE users SET active_theme = ? WHERE id = ?").run(theme, req.userId);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  res.json({ character: serializeCharacter(user) });
});

module.exports = router;
