import "server-only";

import fs from "fs";
import Database from "better-sqlite3";
import path from "path";
import os from "os";
import type { UsageRecord, ToolUsage, TopSession } from "./types";
import { toLocalDateString } from "./timezone";
import { ensurePricingLoaded, calculateCost } from "./pricing";

const HERMES_DB_PATH = path.join(os.homedir(), ".hermes", "state.db");

export function fetchHermesUsage(): UsageRecord[] {
  ensurePricingLoaded();

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
      const date = toLocalDateString(new Date(row.started_at * 1000));
      const model = row.model || "unknown";
      const cost = calculateCost(
        model,
        row.input_tokens || 0,
        row.output_tokens || 0,
        row.cache_write_tokens || 0,
        row.cache_read_tokens || 0,
      );
      const key = `${date}|${model}`;

      const existing = aggregated.get(key);
      if (existing) {
        existing.requests += 1;
        existing.input_tokens += row.input_tokens || 0;
        existing.output_tokens += row.output_tokens || 0;
        existing.cache_read_tokens += row.cache_read_tokens || 0;
        existing.cache_write_tokens += row.cache_write_tokens || 0;
        existing.reasoning_tokens += row.reasoning_tokens || 0;
        existing.cost += cost;
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
          cost,
        });
      }
    }

    return Array.from(aggregated.values());
  } finally {
    db.close();
  }
}

export function fetchHermesDailySessions(): { date: string; count: number }[] {
  if (!fs.existsSync(HERMES_DB_PATH)) return [];
  const db = new Database(HERMES_DB_PATH, { readonly: true });
  try {
    const rows = db
      .prepare(
        `SELECT date(started_at, 'unixepoch', '+7 hours') as d, COUNT(*) as c FROM sessions GROUP BY d ORDER BY d`,
      )
      .all() as Array<{ d: string; c: number }>;
    return rows.map((r) => ({ date: r.d, count: r.c }));
  } finally {
    db.close();
  }
}

export function fetchHermesToolUsage(): ToolUsage[] {
  if (!fs.existsSync(HERMES_DB_PATH)) return [];
  const db = new Database(HERMES_DB_PATH, { readonly: true });
  try {
    const rows = db
      .prepare(
        `SELECT tool_calls FROM messages WHERE tool_calls IS NOT NULL AND tool_calls != ''`,
      )
      .all() as Array<{ tool_calls: string }>;

    const counts = new Map<string, number>();
    for (const row of rows) {
      try {
        const calls = JSON.parse(row.tool_calls);
        if (Array.isArray(calls)) {
          for (const call of calls) {
            const name = call?.function?.name;
            if (name) counts.set(name, (counts.get(name) || 0) + 1);
          }
        }
      } catch {
        continue;
      }
    }

    return Array.from(counts.entries())
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  } finally {
    db.close();
  }
}

export function fetchHermesTopSessions(): TopSession[] {
  if (!fs.existsSync(HERMES_DB_PATH)) return [];
  const db = new Database(HERMES_DB_PATH, { readonly: true });
  try {
    const rows = db
      .prepare(
        `SELECT COALESCE(title, id) as title,
                COALESCE(estimated_cost_usd, 0) as cost,
                COALESCE(input_tokens, 0) as input_tokens,
                COALESCE(output_tokens, 0) as output_tokens,
                COALESCE(message_count, 0) as message_count
         FROM sessions
         WHERE estimated_cost_usd > 0 OR input_tokens > 0
         ORDER BY estimated_cost_usd DESC
         LIMIT 5`,
      )
      .all() as Array<{
      title: string;
      cost: number;
      input_tokens: number;
      output_tokens: number;
      message_count: number;
    }>;

    return rows.map((r) => ({
      source: "hermes" as const,
      title: r.title || "Untitled",
      cost: r.cost,
      inputTokens: r.input_tokens,
      outputTokens: r.output_tokens,
      messageCount: r.message_count,
    }));
  } finally {
    db.close();
  }
}
