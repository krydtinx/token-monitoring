# Token Usage Dashboard — SPEC.md

## 1. Project Overview

- **Name**: Token Usage Dashboard
- **Type**: Local web dashboard (Next.js + TypeScript)
- **Summary**: Track opencode-go token usage, costs, and per-model breakdowns by reading from the local opencode database.
- **Target**: maq (personal use, localhost only)

---

## 2. Tech Stack

| Layer       | Choice                                    |
|-------------|-------------------------------------------|
| Framework   | Next.js 16 (App Router) + TypeScript      |
| Database    | SQLite via `better-sqlite3`               |
| Charts      | Recharts                                  |
| Styling     | Tailwind CSS (dark theme)                |
| Data Source | opencode-go local DB (`~/.local/share/opencode/opencode.db`) |
| Fonts       | Geist (Next.js default)                  |

---

## 3. Database Schema

The dashboard maintains its own local SQLite database (`token-usage.db`) with aggregated data synced from opencode-go's database.

```sql
CREATE TABLE IF NOT EXISTS usage_records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL,           -- ISO date: "2026-04-19"
  model       TEXT NOT NULL,           -- e.g. "minimax-m2.5-free", "glm-5.1"
  requests    INTEGER DEFAULT 0,
  input_tokens  INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cache_read_tokens INTEGER DEFAULT 0,
  cache_write_tokens INTEGER DEFAULT 0,
  reasoning_tokens INTEGER DEFAULT 0,
  cost        REAL DEFAULT 0,           -- USD
  UNIQUE(date, model)
);
```

The source data is read from opencode-go's `message` table where each assistant message contains a `data` JSON field with token usage, cost, and model information.

---

## 4. Features & UI

### 4.1 Dashboard (Home `/`)
- **Top stat cards**: Total Cost (all time), Total Tokens, Total Requests, Active Models
- **Model Breakdown Table**: sortable table with columns — Model, Requests, Input, Output, Cache Read, Cache Write, Reasoning, Cost, % Cost
- **Cost Over Time Chart**: Area chart (Recharts) — X: date, Y: cost, stacked/grouped by model
- **Token Over Time Chart**: Line chart — X: date, Y: input/output/cache read/reasoning tokens
- **Refresh button**: reads fresh data from opencode-go's local database and replaces data in the dashboard DB

### 4.2 Data Fetching Logic
- Reads from opencode-go's SQLite database at `~/.local/share/opencode/opencode.db`
- Parses the `message` table, filtering for assistant messages with token data
- Aggregates by (date, model) and upserts into the dashboard's own SQLite database
- Manual refresh only (no auto-polling)

---

## 5. File Structure

```
token-usage/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, dark theme
│   │   ├── page.tsx            # Dashboard home
│   │   ├── api/
│   │   │   ├── usage/
│   │   │   │   ├── route.ts    # GET usage data
│   │   │   │   └── refresh/
│   │   │   │       └── route.ts # POST refresh from opencode DB
│   │   │   └── globals.css
│   ├── components/
│   │   ├── StatCard.tsx
│   │   ├── ModelTable.tsx
│   │   ├── CostChart.tsx
│   │   ├── TokenChart.tsx
│   │   └── DashboardClient.tsx
│   ├── lib/
│   │   ├── db.ts               # SQLite setup & queries (dashboard DB)
│   │   ├── opencode.ts         # Reads from opencode-go's local DB
│   │   └── types.ts            # TypeScript types
├── token-usage.db              # Dashboard's local database
├── package.json
├── next.config.ts
├── tsconfig.json
└── SPEC.md
```

---

## 6. API Endpoints (Next.js Route Handlers)

| Method | Path                    | Description                                      |
|--------|-------------------------|--------------------------------------------------|
| GET    | `/api/usage`            | Return aggregated usage records from dashboard DB |
| POST   | `/api/usage/refresh`    | Read from opencode DB, replace data in dashboard DB |

---

## 7. Styling / Theme

- **Background**: `#0f0f0f` (near-black)
- **Surface**: `#1a1a1a` / `#252525`
- **Border**: `#333333`
- **Primary accent**: `#6366f1` (indigo-500)
- **Text primary**: `#f5f5f5`
- **Text muted**: `#a1a1a1`
- **Chart palette**: indigo, violet, fuchsia, rose, amber

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