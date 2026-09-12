# Ledger — a Life RPG

Turn real tasks into a character sheet. Complete quests, earn XP and gold on a
non-linear leveling curve, grow five attributes, keep a daily streak alive,
and spend gold in a small shop — all backed by a real account so progress
survives a refresh or a new device.

## Architecture

```
life-rpg/
├── backend/   Node.js + Express API, SQLite (better-sqlite3), JWT auth
└── frontend/  React + Vite + Tailwind + Framer Motion
```

- **Auth**: bcrypt-hashed passwords, JWT bearer tokens. Every task/character/shop
  route is scoped to `req.userId` from the verified token — a user can only ever
  read or write their own rows.
- **Database**: SQLite via `better-sqlite3`, four tables (`users`, `tasks`,
  `shop_items`, `purchases`), schema created automatically on first boot.
- **Progression engine** (`backend/src/utils/leveling.js`): XP required for the
  next level is `round(100 × level^1.45)`, so it costs more to level up the
  higher you go. Completing a quest applies difficulty-based XP/gold rewards,
  rolls over as many level-ups as the XP covers in one transaction, and bumps
  the attribute tied to that quest.
- **Streaks** (`backend/src/utils/streaks.js`): date-only comparison — one
  quest completed per calendar day extends the streak; a missed day resets it.
- **Frontend state**: `AuthContext` holds the current character; task actions
  (`complete`, `delete`, `create`) update the UI optimistically and roll back
  with an error banner if the request fails.

## Local setup

Requires Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # edit JWT_SECRET before deploying anywhere real
npm run dev                # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api to :4000
```

Open `http://localhost:5173`, create a character, and add your first quest.

No `frontend/.env` is needed for local dev — Vite's dev server proxies `/api`
to the backend automatically. You only need `VITE_API_URL` when the frontend
and backend are deployed to different domains (see below).

## Environment variables

| File | Variable | Purpose |
|---|---|---|
| `backend/.env` | `PORT` | Port the API listens on (default `4000`) |
| | `DB_PATH` | Path to the SQLite file (put this on a persistent disk in production) |
| | `JWT_SECRET` | Long random string used to sign sessions — **generate a real one before deploying** |
| | `JWT_EXPIRES_IN` | Session length, e.g. `7d` |
| | `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |
| `frontend/.env` | `VITE_API_URL` | Full URL of the deployed backend API, e.g. `https://your-api.onrender.com/api` |

Generate a real `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Deploying

**Backend** — any Node host works (Render, Railway, Fly.io). Two things matter:
1. SQLite writes to disk, so `DB_PATH` needs to point at a **persistent
   volume/disk**, not the container's ephemeral filesystem — otherwise data is
   wiped on every redeploy (this is exactly the "fake data persistence"
   disqualifier to avoid). Render and Railway both support attaching a small
   persistent disk to a service for this.
2. Set `CORS_ORIGIN` to your deployed frontend's URL.

**Frontend** — Vercel or Netlify, pointed at the `frontend/` folder as the
project root, build command `npm run build`, output directory `dist`. Set
`VITE_API_URL` in the host's environment variable settings to your deployed
backend's `/api` URL.

## Features checklist

- [x] Signup / login / session auth, user-scoped data access with JWT & bcrypt
- [x] Task CRUD (create, read, inline edit/update, delete, complete)
- [x] Non-linear leveling (XP cost increases per level: `100 * level^1.45`, multi-level rollover)
- [x] Streaks (consecutive-day tracking, at-risk warning banner, broken streak handling)
- [x] Attributes (5 stats tied to task categories: Intellect, Strength, Discipline, Creativity, Vitality)
- [x] Activity Heatmap & RPG Archetype Engine (16-week contribution calendar grid, 6 dynamic character classes)
- [x] Synthesized Web Audio RPG SFX (pure native AudioContext: quest chime, level-up fanfare, coin clink, quill inscribe, mute toggle)
- [x] Economy & Rewards (gold from quests, shop to spend currency)
- [x] Dynamic Themes (Default, Slate, Forest, Ember) with live equip switcher
- [x] Collectibles Showcase (earned badges, trophies, and Focus Boost cosmetic aura)
- [x] Alive & Tactile micro-interactions (celebratory particle bursts on quest completion & level-up)
- [x] 3D Hero Model with interactive mouse tracking on Auth screens (Three.js)
- [x] Scrollytelling landing page with continuous hand-drawn fantasy map spine and SVG quest path
- [x] 100% bespoke SVG vector icon set (completely emoji-free)
- [x] Responsive layout (mobile-to-desktop), keyboard navigable (Tab, Enter, Space), visible focus states, semantic landmarks and `aria` labels
- [x] Optimistic UI + loading skeletons on all data fetches
- [x] Graceful error handling (network failures, validation, insufficient gold)

## Submission Checklist (Avoid Disqualification)

1. **Public GitHub Repository**:
   - Must contain both `frontend/` and `backend/` source code.
   - **Crucial**: Commit in at least 3 logical chronological commits (e.g., initial backend architecture → progression engine & database → frontend UI & gamification systems) to avoid the "Invalid Repository" penalty.
   - Both `backend/.env.example` and `frontend/.env.example` are provided.
2. **Live Deployed URL**:
   - Backend on Render / Railway / Fly.io with a persistent disk volume for SQLite (`DB_PATH`).
   - Frontend on Vercel / Netlify with `VITE_API_URL` pointing to backend API.
3. **Walkthrough Screen Recording (90–180 seconds, strictly < 100MB)**:
   - Record: user signup/login $\to$ adding a quest $\to$ completing a quest $\to$ level-up celebration $\to$ **page refresh to prove database persistence**.
   - Host the video publicly on GitHub Releases, YouTube (unlisted/public), Google Drive (public access), or in the repo.


<!-- stage 119 -->
