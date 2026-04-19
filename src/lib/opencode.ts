import "server-only";

import Database from "better-sqlite3";
import path from "path";
import os from "os";
import type { OpenCodeMessage, UsageRecord } from "./types";

const OPENCODE_DB_PATH = path.join(os.homedir(), ".local/share/opencode/opencode.db");

export function fetchUsage(): UsageRecord[] {
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

      const date = new Date(msg.time.created).toISOString().split("T")[0];
      const model = msg.modelID || "unknown";
      const key = `${date}|${model}`;

      const existing = aggregated.get(key);
      if (existing) {
        existing.requests += 1;
        existing.input_tokens += msg.tokens.input || 0;
        existing.output_tokens += msg.tokens.output || 0;
        existing.cache_read_tokens += msg.tokens.cache?.read || 0;
        existing.cache_write_tokens += msg.tokens.cache?.write || 0;
        existing.reasoning_tokens += msg.tokens.reasoning || 0;
        existing.cost += msg.cost || 0;
      } else {
        aggregated.set(key, {
          date,
          model,
          requests: 1,
          input_tokens: msg.tokens.input || 0,
          output_tokens: msg.tokens.output || 0,
          cache_read_tokens: msg.tokens.cache?.read || 0,
          cache_write_tokens: msg.tokens.cache?.write || 0,
          reasoning_tokens: msg.tokens.reasoning || 0,
          cost: msg.cost || 0,
        });
      }
    }

    return Array.from(aggregated.values());
  } finally {
    db.close();
  }
}