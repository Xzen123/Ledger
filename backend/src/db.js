const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const defaultDbPath = path.resolve(__dirname, "..", "data", "liferpg.db");
const DB_PATH = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : defaultDbPath;
const resolvedPath = path.resolve(DB_PATH);
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const db = new Database(resolvedPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    google_id TEXT UNIQUE,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 25,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    attr_intellect INTEGER NOT NULL DEFAULT 0,
    attr_strength INTEGER NOT NULL DEFAULT 0,
    attr_discipline INTEGER NOT NULL DEFAULT 0,
    attr_creativity INTEGER NOT NULL DEFAULT 0,
    attr_vitality INTEGER NOT NULL DEFAULT 0,
    active_theme TEXT NOT NULL DEFAULT 'default',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    attribute TEXT NOT NULL DEFAULT 'discipline',
    difficulty TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    cost INTEGER NOT NULL,
    type TEXT NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, item_id)
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
`);

// Safe migration for existing databases
try {
  db.exec("ALTER TABLE users ADD COLUMN google_id TEXT;");
} catch {}
try {
  db.exec("ALTER TABLE users ADD COLUMN flags INTEGER NOT NULL DEFAULT 0;");
} catch {}
try {
  db.exec("ALTER TABLE users ADD COLUMN is_disabled INTEGER NOT NULL DEFAULT 0;");
} catch {}
try {
  db.exec("ALTER TABLE users ADD COLUMN disabled_reason TEXT;");
} catch {}

try {
  db.exec("ALTER TABLE tasks ADD COLUMN completion_duration_seconds INTEGER;");
} catch {}
try {
  db.exec("ALTER TABLE tasks ADD COLUMN ai_verdict TEXT;");
} catch {}
try {
  db.exec("ALTER TABLE tasks ADD COLUMN flagged INTEGER NOT NULL DEFAULT 0;");
} catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS bot_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER REFERENCES users(id),
    target_user_id INTEGER NOT NULL REFERENCES users(id),
    task_id INTEGER REFERENCES tasks(id),
    reason TEXT NOT NULL,
    ai_verdict TEXT,
    ai_confidence REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_bot_reports_target ON bot_reports(target_user_id);
`);

db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);");

// Seed the shop once, if empty.
const itemCount = db.prepare("SELECT COUNT(*) AS n FROM shop_items").get().n;
if (itemCount === 0) {
  const insert = db.prepare(
    "INSERT INTO shop_items (name, description, cost, type, value) VALUES (?, ?, ?, ?, ?)"
  );
  const seed = db.transaction((items) => {
    for (const item of items) insert.run(...item);
  });
  seed([
    ["Slate Theme", "A cool graphite accent for your dashboard.", 40, "theme", "slate"],
    ["Forest Theme", "A muted green accent for your dashboard.", 40, "theme", "forest"],
    ["Ember Theme", "A warm amber accent for your dashboard.", 40, "theme", "ember"],
    ["First Steps", "Badge: complete your very first quest.", 0, "badge", "first-steps"],
    ["Consistent", "Badge for reaching a 7-day streak.", 60, "badge", "consistent"],
    ["Polymath", "Badge for raising all five attributes above 10.", 120, "badge", "polymath"],
    ["Focus Boost", "Cosmetic aura shown on your profile card.", 90, "cosmetic", "focus-aura"],
  ]);
}

module.exports = db;


/* commit_stage_15_xzen */
