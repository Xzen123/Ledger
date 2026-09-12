require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./db"); // initializes schema + seed data on boot

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const characterRoutes = require("./routes/character");
const shopRoutes = require("./routes/shop");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/character", characterRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// 404 fallback
app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

// Central error handler — never leak stack traces to the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Life RPG API listening on port ${PORT}`);
});

/* commit_stage_100_xzen */
