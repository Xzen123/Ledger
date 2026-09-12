const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { serializeCharacter } = require("../utils/serialize");

const router = express.Router();
router.use(requireAuth);

router.get("/items", (req, res) => {
  const items = db.prepare("SELECT * FROM shop_items ORDER BY cost ASC").all();
  const ownedIds = new Set(
    db
      .prepare("SELECT item_id FROM purchases WHERE user_id = ?")
      .all(req.userId)
      .map((r) => r.item_id)
  );
  res.json({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      cost: item.cost,
      type: item.type,
      value: item.value,
      owned: ownedIds.has(item.id),
    })),
  });
});

router.post("/buy/:itemId", (req, res) => {
  const buy = db.transaction(() => {
    const item = db.prepare("SELECT * FROM shop_items WHERE id = ?").get(req.params.itemId);
    if (!item) return { status: 404, error: "Item not found." };

    const alreadyOwned = db
      .prepare("SELECT 1 FROM purchases WHERE user_id = ? AND item_id = ?")
      .get(req.userId, item.id);
    if (alreadyOwned) return { status: 409, error: "You already own this item." };

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
    if (user.gold < item.cost) return { status: 402, error: "Not enough gold." };

    db.prepare("UPDATE users SET gold = gold - ? WHERE id = ?").run(item.cost, user.id);
    db.prepare("INSERT INTO purchases (user_id, item_id) VALUES (?, ?)").run(user.id, item.id);

    const updatedUser = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    return { status: 200, character: serializeCharacter(updatedUser), item };
  });

  const result = buy();
  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json(result);
});

module.exports = router;

/* commit_stage_54_xzen */
