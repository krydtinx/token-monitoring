import "server-only";

import Database from "better-sqlite3";
import path from "path";
import type { UsageRecord, DailyUsage, ModelStats, Source } from "./types";
import { getModelCosts } from "./pricing";

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
      source TEXT NOT NULL DEFAULT 'opencode',
      requests INTEGER DEFAULT 0,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      cache_read_tokens INTEGER DEFAULT 0,
      cache_write_tokens INTEGER DEFAULT 0,
      reasoning_tokens INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      UNIQUE(date, model, source)
    );
  `);

  // Migration: drop obsolete model_pricing table (replaced by hardcoded prices)
  getDb().exec(`DROP TABLE IF EXISTS model_pricing`);

  // Migration: add source column if missing (old schema had UNIQUE(date, model))
  const columns = getDb()
    .prepare("PRAGMA table_info(usage_records)")
    .all() as Array<{ name: string }>;
  const colNames = new Set(columns.map((c) => c.name));

  if (!colNames.has("source")) {
    getDb().exec("ALTER TABLE usage_records ADD COLUMN source TEXT NOT NULL DEFAULT 'opencode'");
  }

  // Check if old UNIQUE(date, model) constraint exists and migrate
  const indexes = getDb()
    .prepare("SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name='usage_records'")
    .all() as Array<{ sql: string | null }>;
  const hasOldUnique = indexes.some(
    (i) => i.sql && i.sql.includes("UNIQUE") && i.sql.includes("date, model") && !i.sql.includes("source"),
  );

  if (hasOldUnique) {
    getDb().exec(`
      CREATE TABLE usage_records_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        model TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'opencode',
        requests INTEGER DEFAULT 0,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cache_read_tokens INTEGER DEFAULT 0,
        cache_write_tokens INTEGER DEFAULT 0,
        reasoning_tokens INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        UNIQUE(date, model, source)
      );
      INSERT INTO usage_records_new SELECT * FROM usage_records;
      DROP TABLE usage_records;
      ALTER TABLE usage_records_new RENAME TO usage_records;
    `);
  }
}

export { getDb, initDb };

// ─── Usage Records ────────────────────────────────────────────────────────────

export function upsertUsage(records: UsageRecord[]): void {
  const stmt = getDb().prepare(`
    INSERT INTO usage_records (date, model, source, requests, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, reasoning_tokens, cost)
    VALUES (@date, @model, @source, @requests, @input_tokens, @output_tokens, @cache_read_tokens, @cache_write_tokens, @reasoning_tokens, @cost)
    ON CONFLICT(date, model, source) DO UPDATE SET
      requests = requests + excluded.requests,
      input_tokens = input_tokens + excluded.input_tokens,
      output_tokens = output_tokens + excluded.output_tokens,
      cache_read_tokens = COALESCE(cache_read_tokens, 0) + COALESCE(excluded.cache_read_tokens, 0),
      cache_write_tokens = COALESCE(cache_write_tokens, 0) + COALESCE(excluded.cache_write_tokens, 0),
      reasoning_tokens = COALESCE(reasoning_tokens, 0) + COALESCE(excluded.reasoning_tokens, 0),
      cost = cost + excluded.cost
  `);

  const insertMany = getDb().transaction((recs: UsageRecord[]) => {
    for (const rec of recs) {
      stmt.run(rec);
    }
  });

  insertMany(records);
}

export function replaceUsage(records: UsageRecord[]): void {
  const insertMany = getDb().transaction((recs: UsageRecord[]) => {
    getDb().prepare("DELETE FROM usage_records").run();
    const stmt = getDb().prepare(`
      INSERT INTO usage_records (date, model, source, requests, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, reasoning_tokens, cost)
      VALUES (@date, @model, @source, @requests, @input_tokens, @output_tokens, @cache_read_tokens, @cache_write_tokens, @reasoning_tokens, @cost)
    `);
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
    .prepare(
      "SELECT date, model, source, requests, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, reasoning_tokens, cost FROM usage_records ORDER BY date ASC",
    )
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
    const modelKey = `${row.source}|${row.model}`;
    day.models[modelKey] = {
      source: row.source,
      cost: row.cost,
      input_tokens: row.input_tokens,
      output_tokens: row.output_tokens,
      cache_read_tokens: row.cache_read_tokens ?? 0,
      cache_write_tokens: row.cache_write_tokens ?? 0,
      reasoning_tokens: row.reasoning_tokens ?? 0,
      requests: row.requests,
    };
  }

  return Array.from(map.values());
}

export function getModelStats(): ModelStats[] {
  const rows = getDb()
    .prepare(
      `SELECT model, source, SUM(requests) as requests, SUM(input_tokens) as input_tokens,
              SUM(output_tokens) as output_tokens,
              SUM(COALESCE(cache_read_tokens, 0)) as cache_read_tokens,
              SUM(COALESCE(cache_write_tokens, 0)) as cache_write_tokens,
              SUM(COALESCE(reasoning_tokens, 0)) as reasoning_tokens,
              SUM(cost) as cost
       FROM usage_records GROUP BY model, source ORDER BY cost DESC`,
    )
    .all() as Array<{
    model: string;
    source: Source;
    requests: number;
    input_tokens: number;
    output_tokens: number;
    cache_read_tokens: number;
    cache_write_tokens: number;
    reasoning_tokens: number;
    cost: number;
  }>;

  const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);

  return rows.map((r) => ({
    model: r.model,
    source: r.source,
    requests: r.requests,
    input_tokens: r.input_tokens,
    output_tokens: r.output_tokens,
    total_tokens: r.input_tokens + r.output_tokens,
    cache_read_tokens: r.cache_read_tokens,
    cache_write_tokens: r.cache_write_tokens,
    reasoning_tokens: r.reasoning_tokens,
    cost: r.cost,
    cost_pct: totalCost > 0 ? (r.cost / totalCost) * 100 : 0,
    hasPricing: getModelCosts(r.model) !== null,
  }));
}