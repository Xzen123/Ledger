const jwt = require("jsonwebtoken");
const db = require("../db");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing or invalid authorization header." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;

    const user = db.prepare("SELECT is_disabled, disabled_reason, flags FROM users WHERE id = ?").get(req.userId);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    if (user.is_disabled && !req.path.includes("appeal-reset")) {
      return res.status(403).json({
        error: user.disabled_reason || "Account suspended by Arcane Sentinel AI.",
        isDisabled: true,
        flags: user.flags,
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
}

module.exports = { requireAuth };

/* commit_stage_16_xzen */
