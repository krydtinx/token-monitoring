import "server-only";

import fs from "fs";
import Database from "better-sqlite3";
import path from "path";
import os from "os";
import type { UsageRecord } from "./types";

const HERMES_DB_PATH = path.join(os.homedir(), ".hermes", "state.db");

export function fetchHermesUsage(): UsageRecord[] {
  if (!fs.existsSync(HERMES_DB_PATH)) {
    return [];
  }

  const db = new Database(HERMES_DB_PATH, { readonly: true });
  try {
    const rows = db
      .prepare(
        `SELECT model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, reasoning_tokens, estimated_cost_usd, started_at
         FROM sessions WHERE input_tokens > 0`,
      )
      .all() as Array<{
      model: string;
      input_tokens: number;
      output_tokens: number;
      cache_read_tokens: number;
      cache_write_tokens: number;
      reasoning_tokens: number;
      estimated_cost_usd: number | null;
      started_at: number;
    }>;

    const aggregated = new Map<string, UsageRecord>();

    for (const row of rows) {
      const date = new Date(row.started_at * 1000).toISOString().split("T")[0];
      const model = row.model || "unknown";
      const key = `${date}|${model}`;

      const existing = aggregated.get(key);
      if (existing) {
        existing.requests += 1;
        existing.input_tokens += row.input_tokens || 0;
        existing.output_tokens += row.output_tokens || 0;
        existing.cache_read_tokens += row.cache_read_tokens || 0;
        existing.cache_write_tokens += row.cache_write_tokens || 0;
        existing.reasoning_tokens += row.reasoning_tokens || 0;
        existing.cost += row.estimated_cost_usd || 0;
      } else {
        aggregated.set(key, {
          date,
          model,
          source: "hermes",
          requests: 1,
          input_tokens: row.input_tokens || 0,
          output_tokens: row.output_tokens || 0,
          cache_read_tokens: row.cache_read_tokens || 0,
          cache_write_tokens: row.cache_write_tokens || 0,
          reasoning_tokens: row.reasoning_tokens || 0,
          cost: row.estimated_cost_usd || 0,
        });
      }
    }

    return Array.from(aggregated.values());
  } finally {
    db.close();
  }
}
