# Token Usage Dashboard — SPEC.md

## 1. Project Overview

- **Name**: Token Usage Dashboard
- **Type**: Local web dashboard (Next.js + TypeScript)
- **Summary**: Track OpenRouter API token usage, costs, and per-model breakdowns stored in SQLite.
- **Target**: maq (personal use, localhost only)

---

## 2. Tech Stack

| Layer       | Choice                                    |
|-------------|-------------------------------------------|
| Framework   | Next.js 14 (App Router) + TypeScript      |
| Database    | SQLite via `better-sqlite3`               |
| Charts      | Recharts                                  |
| Styling     | Tailwind CSS (dark theme)                |
| API Client  | OpenRouter API (`/usage` endpoint)        |
| Fonts       | Geist (Next.js default)                  |

---

## 3. Database Schema

```sql
CREATE TABLE IF NOT EXISTS usage_records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,           -- ISO date: "2026-04-19"
  model       TEXT NOT NULL,           -- e.g. "openrouter/google/gemini-2.0-flash"
  requests    INTEGER DEFAULT 0,
  input_tokens  INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost        REAL DEFAULT 0,           -- USD
  UNIQUE(date, model)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,            -- e.g. "opencode-go"
  key         TEXT NOT NULL,
  is_active   INTEGER DEFAULT 1
);
```

---

## 4. Features & UI

### 4.1 API Key Management
- Page at `/settings` to add/edit/delete OpenRouter API keys
- Only one active key at a time
- Keys stored in SQLite (api_keys table)

### 4.2 Dashboard (Home `/`)
- **Top stat cards**: Total Cost (all time), Total Tokens, Total Requests, Active Models
- **Model Breakdown Table**: sortable table with columns — Model, Total Requests, Input Tokens, Output Tokens, Total Tokens, Total Cost, % of Total Cost
- **Cost Over Time Chart**: Area chart (Recharts) — X: date, Y: cost, stacked/grouped by model
- **Token Over Time Chart**: Line chart — X: date, Y: input/output tokens
- **Refresh button**: fetches fresh data from OpenRouter `/usage` API and upserts into SQLite

### 4.3 Data Fetching Logic
- OpenRouter `GET /v1/usage` with active API key
- Data upserted into SQLite by (date, model) — if exists, update; if not, insert
- Manual refresh only (no auto-polling)

---

## 5. File Structure

```
token-usage/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, dark theme
│   │   ├── page.tsx            # Dashboard home
│   │   ├── settings/
│   │   │   └── page.tsx        # API key management
│   │   └── globals.css
│   ├── components/
│   │   ├── StatCard.tsx
│   │   ├── ModelTable.tsx
│   │   ├── CostChart.tsx
│   │   ├── TokenChart.tsx
│   │   └── ApiKeyForm.tsx
│   ├── lib/
│   │   ├── db.ts               # SQLite setup & queries
│   │   ├── openrouter.ts       # OpenRouter API client
│   │   └── types.ts            # TypeScript types
│   └── scripts/
│       └── seed.ts             # Optional seed script
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── SPEC.md
└── README.md
```

---

## 6. API Endpoints (Next.js Route Handlers)

| Method | Path                    | Description                          |
|--------|-------------------------|--------------------------------------|
| GET    | `/api/usage`            | Return all usage records from SQLite |
| POST   | `/api/usage/refresh`    | Fetch from OpenRouter, upsert to DB  |
| GET    | `/api/keys`             | List all API keys (masked)           |
| POST   | `/api/keys`             | Add new API key                      |
| DELETE | `/api/keys/[id]`        | Delete API key                       |

---

## 7. Styling / Theme

- **Background**: `#0f0f0f` (near-black)
- **Surface**: `#1a1a1a` / `#252525`
- **Border**: `#333333`
- **Primary accent**: `#6366f1` (indigo-500)
- **Text primary**: `#f5f5f5`
- **Text muted**: `#a1a1a1`
- **Chart palette**: indigo, violet, fuchsia, rose, amber轮流

---

## 8. Git Commit Convention

Each task = one commit. Commit message format:
```
<type>: <short description>

<type> ::= init | feat | fix | style | refactor | chore
```

---

## 9. Out of Scope (for now)

- Authentication / password protection
- Auto-refresh / background jobs
- Export to CSV
- Multiple workspaces
