import Database from "better-sqlite3";
import path from "path";
import type { UsageRecord, ApiKey, MaskedApiKey, DailyUsage, ModelStats } from "./types";

const DB_PATH = path.join(process.cwd(), "token-usage.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initDb();
  }
  return db;
}

function initDb(): void {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS usage_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      model TEXT NOT NULL,
      requests INTEGER DEFAULT 0,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      UNIQUE(date, model)
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      key TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );
  `);
}

export { getDb, initDb };

// ─── Usage Records ────────────────────────────────────────────────────────────

export function upsertUsage(records: UsageRecord[]): void {
  const stmt = getDb().prepare(`
    INSERT INTO usage_records (date, model, requests, input_tokens, output_tokens, cost)
    VALUES (@date, @model, @requests, @input_tokens, @output_tokens, @cost)
    ON CONFLICT(date, model) DO UPDATE SET
      requests = requests + excluded.requests,
      input_tokens = input_tokens + excluded.input_tokens,
      output_tokens = output_tokens + excluded.output_tokens,
      cost = cost + excluded.cost
  `);

  const insertMany = getDb().transaction((recs: UsageRecord[]) => {
    for (const rec of recs) {
      stmt.run(rec);
    }
  });

  insertMany(records);
}

export function getAllUsage(): UsageRecord[] {
  return getDb()
    .prepare("SELECT * FROM usage_records ORDER BY date DESC, model ASC")
    .all() as UsageRecord[];
}

export function getDailyUsage(): DailyUsage[] {
  const rows = getDb()
    .prepare("SELECT date, model, requests, input_tokens, output_tokens, cost FROM usage_records ORDER BY date ASC")
    .all() as UsageRecord[];

  const map = new Map<string, DailyUsage>();

  for (const row of rows) {
    if (!map.has(row.date)) {
      map.set(row.date, {
        date: row.date,
        total_cost: 0,
        total_tokens: 0,
        total_requests: 0,
        models: {},
      });
    }
    const day = map.get(row.date)!;
    day.total_cost += row.cost;
    day.total_tokens += row.input_tokens + row.output_tokens;
    day.total_requests += row.requests;
    day.models[row.model] = {
      cost: row.cost,
      input_tokens: row.input_tokens,
      output_tokens: row.output_tokens,
      requests: row.requests,
    };
  }

  return Array.from(map.values());
}

export function getModelStats(): ModelStats[] {
  const rows = getDb()
    .prepare(
      `SELECT model, SUM(requests) as requests, SUM(input_tokens) as input_tokens,
              SUM(output_tokens) as output_tokens, SUM(cost) as cost
       FROM usage_records GROUP BY model ORDER BY cost DESC`
    )
    .all() as Array<{
      model: string;
      requests: number;
      input_tokens: number;
      output_tokens: number;
      cost: number;
    }>;

  const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);

  return rows.map((r) => ({
    model: r.model,
    requests: r.requests,
    input_tokens: r.input_tokens,
    output_tokens: r.output_tokens,
    total_tokens: r.input_tokens + r.output_tokens,
    cost: r.cost,
    cost_pct: totalCost > 0 ? (r.cost / totalCost) * 100 : 0,
  }));
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export function getApiKeys(): MaskedApiKey[] {
  const rows = getDb()
    .prepare("SELECT id, name, key, is_active FROM api_keys ORDER BY id DESC")
    .all() as ApiKey[];

  return rows.map((r) => ({
    id: r.id!,
    name: r.name,
    masked_key: maskKey(r.key),
    is_active: r.is_active,
  }));
}

export function getActiveApiKey(): ApiKey | null {
  return (
    (getDb()
      .prepare("SELECT * FROM api_keys WHERE is_active = 1 LIMIT 1")
      .get() as ApiKey | undefined) ?? null
  );
}

export function addApiKey(name: string, key: string): number {
  const result = getDb()
    .prepare("INSERT INTO api_keys (name, key, is_active) VALUES (?, ?, 1)")
    .run(name, key);

  // Deactivate all others
  getDb()
    .prepare("UPDATE api_keys SET is_active = 0 WHERE id != ?")
    .run(result.lastInsertRowid);

  return Number(result.lastInsertRowid);
}

export function deleteApiKey(id: number): void {
  getDb().prepare("DELETE FROM api_keys WHERE id = ?").run(id);
}

export function setActiveApiKey(id: number): void {
  getDb().transaction(() => {
    getDb().prepare("UPDATE api_keys SET is_active = 0").run();
    getDb().prepare("UPDATE api_keys SET is_active = 1 WHERE id = ?").run(id);
  })();
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 6) + "****" + key.slice(-4);
}
