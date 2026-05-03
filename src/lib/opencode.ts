import "server-only";

import fs from "fs";
import Database from "better-sqlite3";
import path from "path";
import os from "os";
import type { OpenCodeMessage, UsageRecord, LatencyPoint, TopSession } from "./types";
import { toLocalDateString } from "./timezone";
import { calculateCost } from "./pricing";

const OPENCODE_DB_PATH = path.join(os.homedir(), ".local/share/opencode/opencode.db");

export function fetchUsage(): UsageRecord[] {
  if (!fs.existsSync(OPENCODE_DB_PATH)) {
    return [];
  }

  const db = new Database(OPENCODE_DB_PATH, { readonly: true });
  try {
    const rows = db
      .prepare(
        `SELECT data FROM message WHERE json_extract(data, '$.role') = 'assistant' AND json_extract(data, '$.tokens') IS NOT NULL`,
      )
      .all() as Array<{ data: string }>;

    const aggregated = new Map<string, UsageRecord>();

    for (const row of rows) {
      const msg: OpenCodeMessage = JSON.parse(row.data);
      if (!msg.tokens || !msg.time?.created) continue;

      const date = toLocalDateString(new Date(msg.time.created));
      const model = msg.modelID || "unknown";
      const cost = calculateCost(
        model,
        msg.tokens.input || 0,
        msg.tokens.output || 0,
        msg.tokens.cache?.write || 0,
        msg.tokens.cache?.read || 0,
      );
      const key = `${date}|${model}`;

      const existing = aggregated.get(key);
      if (existing) {
        existing.requests += 1;
        existing.input_tokens += msg.tokens.input || 0;
        existing.output_tokens += msg.tokens.output || 0;
        existing.cache_read_tokens += msg.tokens.cache?.read || 0;
        existing.cache_write_tokens += msg.tokens.cache?.write || 0;
        existing.reasoning_tokens += msg.tokens.reasoning || 0;
        existing.cost += cost;
      } else {
        aggregated.set(key, {
          date,
          model,
          source: "opencode",
          requests: 1,
          input_tokens: msg.tokens.input || 0,
          output_tokens: msg.tokens.output || 0,
          cache_read_tokens: msg.tokens.cache?.read || 0,
          cache_write_tokens: msg.tokens.cache?.write || 0,
          reasoning_tokens: msg.tokens.reasoning || 0,
          cost,
        });
      }
    }

    return Array.from(aggregated.values());
  } finally {
    db.close();
  }
}

export function fetchOpenCodeDailySessions(): { date: string; count: number }[] {
  if (!fs.existsSync(OPENCODE_DB_PATH)) return [];
  const db = new Database(OPENCODE_DB_PATH, { readonly: true });
  try {
    const rows = db
      .prepare(`SELECT date(time_created / 1000, 'unixepoch', '+7 hours') as d, COUNT(*) as c FROM session GROUP BY d ORDER BY d`)
      .all() as Array<{ d: string; c: number }>;
    return rows.map((r) => ({ date: r.d, count: r.c }));
  } finally {
    db.close();
  }
}

export function fetchOpenCodeLatency(): LatencyPoint[] {
  if (!fs.existsSync(OPENCODE_DB_PATH)) return [];
  const db = new Database(OPENCODE_DB_PATH, { readonly: true });
  try {
    const rows = db
      .prepare(
        `SELECT data FROM message
         WHERE json_extract(data, '$.role') = 'assistant'
           AND json_extract(data, '$.time.created') IS NOT NULL
           AND json_extract(data, '$.time.completed') IS NOT NULL`,
      )
      .all() as Array<{ data: string }>;

    const byDate = new Map<string, number[]>();
    for (const row of rows) {
      const msg: OpenCodeMessage = JSON.parse(row.data);
      if (!msg.time?.created || !msg.time?.completed) continue;
      const ms = msg.time.completed - msg.time.created;
      if (ms < 0) continue;
      const date = toLocalDateString(new Date(msg.time.created));
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)!.push(ms);
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, latencies]) => {
        if (latencies.length === 0) return { date, avgMs: 0, p50Ms: 0, p95Ms: 0, count: 0 };
        latencies.sort((a, b) => a - b);
        const avg = latencies.reduce((s, v) => s + v, 0) / latencies.length;
        const p50 = latencies[Math.floor(latencies.length * 0.5)];
        const p95 = latencies[Math.floor(latencies.length * 0.95)];
        return { date, avgMs: Math.round(avg), p50Ms: p50, p95Ms: p95, count: latencies.length };
      });
  } finally {
    db.close();
  }
}

export function fetchOpenCodeTopSessions(): TopSession[] {
  if (!fs.existsSync(OPENCODE_DB_PATH)) return [];
  const db = new Database(OPENCODE_DB_PATH, { readonly: true });
  try {
    const rows = db
      .prepare(
        `SELECT s.title, s.directory,
                SUM(json_extract(m.data, '$.cost')) as total_cost,
                SUM(json_extract(m.data, '$.tokens.input')) as total_input,
                SUM(json_extract(m.data, '$.tokens.output')) as total_output,
                COUNT(*) as msg_count
         FROM session s
         JOIN message m ON m.session_id = s.id
         WHERE json_extract(m.data, '$.role') = 'assistant'
         GROUP BY s.id
         HAVING total_cost > 0 OR total_input > 0
         ORDER BY total_cost DESC
         LIMIT 5`,
      )
      .all() as Array<{
      title: string;
      directory: string;
      total_cost: number | null;
      total_input: number | null;
      total_output: number | null;
      msg_count: number;
    }>;

    return rows.map((r) => ({
      source: "opencode" as const,
      title: r.title || r.directory || "Untitled",
      cost: r.total_cost || 0,
      inputTokens: r.total_input || 0,
      outputTokens: r.total_output || 0,
      messageCount: r.msg_count,
    }));
  } finally {
    db.close();
  }
}