# Token Usage Dashboard

Local dashboard to track OpenRouter API token usage and costs.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

Go to **Settings** to add your OpenRouter API key, then click **Refresh** on the dashboard to fetch usage data.

## Tech

- Next.js 14 (App Router) + TypeScript
- SQLite via `better-sqlite3`
- Recharts
- Tailwind CSS (dark theme)
