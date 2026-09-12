const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { serializeCharacter } = require("../utils/serialize");

const router = express.Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

router.post("/signup", (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !USERNAME_RE.test(username)) {
    return res.status(400).json({ error: "Username must be 3-20 characters: letters, numbers, underscores." });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
    .get(username, email);
  if (existing) {
    return res.status(409).json({ error: "Username or email is already taken." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
    .run(username, email, passwordHash);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  const token = signToken(user.id);
  res.status(201).json({ token, character: serializeCharacter(user) });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
    .get(username, username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  if (user.is_disabled) {
    return res.status(403).json({
      error: user.disabled_reason || "Account locked by Arcane Sentinel AI: Exceeded 3 anti-cheat strikes.",
      isDisabled: true,
      flags: user.flags,
    });
  }

  const token = signToken(user.id);
  res.json({ token, character: serializeCharacter(user) });
});

router.post("/google", async (req, res) => {
  const { credential } = req.body || {};

  if (!credential) {
    return res.status(400).json({ error: "Google credential token is required." });
  }

  let googleId, email, name;

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!response.ok) {
      return res.status(401).json({ error: "Invalid or expired Google token." });
    }
    const payload = await response.json();
    googleId = payload.sub;
    email = payload.email;
    name = payload.name;
  } catch (err) {
    console.error("Google token verification failed:", err);
    return res.status(500).json({ error: "Could not verify Google account with server." });
  }

  if (!email) {
    return res.status(400).json({ error: "Google account does not provide an email address." });
  }

  // 1. Check if user already exists by google_id
  let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId);

  // 2. If not found by google_id, check if existing account has matching email
  if (!user) {
    user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user) {
      // Link Google ID to existing account
      db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(googleId, user.id);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    }
  }

  // 3. If new user, create a character
  if (!user) {
    const crypto = require("crypto");
    let base = (name ? name.replace(/[^a-zA-Z0-9_]/g, "_") : email.split("@")[0]).slice(0, 14);
    if (base.length < 3) base = `hero_${base}`;
    let username = base;
    let suffix = 1;
    while (db.prepare("SELECT id FROM users WHERE username = ?").get(username)) {
      username = `${base.slice(0, 13)}_${suffix++}`;
    }

    const oauthPlaceholderHash = `$oauth$google$${crypto.randomBytes(16).toString("hex")}`;
    const result = db
      .prepare("INSERT INTO users (username, email, password_hash, google_id) VALUES (?, ?, ?, ?)")
      .run(username, email, oauthPlaceholderHash, googleId);

    user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  }

  const token = signToken(user.id);
  res.json({ token, character: serializeCharacter(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ character: serializeCharacter(user) });
});

module.exports = router;


/* commit_stage_17_xzen */
