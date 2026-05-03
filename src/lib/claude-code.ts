import "server-only";

import fs from "fs";
import path from "path";
import os from "os";
import type { UsageRecord, HourlyUsage, TopSession } from "./types";
import { toLocalDateString } from "./timezone";
import { calculateCost } from "./pricing";

const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");

function findJsonlFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsonlFiles(fullPath));
    } else if (entry.name.endsWith(".jsonl")) {
      results.push(fullPath);
    }
  }
  return results;
}

export function fetchClaudeCodeUsage(): UsageRecord[] {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) {
    return [];
  }

  const files = findJsonlFiles(CLAUDE_PROJECTS_DIR);
  const aggregated = new Map<string, UsageRecord>();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      let entry: {
        type?: string;
        timestamp?: string;
        message?: {
          model?: string;
          usage?: {
            input_tokens: number;
            output_tokens: number;
            cache_read_input_tokens: number;
            cache_creation_input_tokens: number;
          };
        };
      };

      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }

      if (entry.type !== "assistant" || !entry.message?.usage || !entry.timestamp) continue;

      const date = toLocalDateString(new Date(entry.timestamp));
      const model = entry.message.model || "unknown";
      const usage = entry.message.usage;
      const cost = calculateCost(
        model,
        usage.input_tokens || 0,
        usage.output_tokens || 0,
        usage.cache_creation_input_tokens || 0,
        usage.cache_read_input_tokens || 0,
      );
      const key = `${date}|${model}`;

      const existing = aggregated.get(key);
      if (existing) {
        existing.requests += 1;
        existing.input_tokens += usage.input_tokens || 0;
        existing.output_tokens += usage.output_tokens || 0;
        existing.cache_read_tokens += usage.cache_read_input_tokens || 0;
        existing.cache_write_tokens += usage.cache_creation_input_tokens || 0;
        existing.cost += cost;
      } else {
        aggregated.set(key, {
          date,
          model,
          source: "claude-code",
          requests: 1,
          input_tokens: usage.input_tokens || 0,
          output_tokens: usage.output_tokens || 0,
          cache_read_tokens: usage.cache_read_input_tokens || 0,
          cache_write_tokens: usage.cache_creation_input_tokens || 0,
          reasoning_tokens: 0,
          cost,
        });
      }
    }
  }

  return Array.from(aggregated.values());
}

export function fetchClaudeCodeDailySessions(): { date: string; count: number }[] {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) return [];
  const files = findJsonlFiles(CLAUDE_PROJECTS_DIR);
  const dateSessions = new Map<string, Set<string>>();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      let entry: { timestamp?: string; sessionId?: string };
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      if (!entry.timestamp || !entry.sessionId) continue;
      const date = toLocalDateString(new Date(entry.timestamp));
      if (!dateSessions.has(date)) dateSessions.set(date, new Set());
      dateSessions.get(date)!.add(entry.sessionId);
    }
  }

  return Array.from(dateSessions.entries())
    .map(([date, sessions]) => ({ date, count: sessions.size }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function fetchClaudeCodeHourlyUsage(): HourlyUsage[] {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) return [];
  const files = findJsonlFiles(CLAUDE_PROJECTS_DIR);
  const today = toLocalDateString(new Date());
  const hourCounts: Record<number, number> = {};

  for (let h = 0; h < 24; h++) {
    hourCounts[h] = 0;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      let entry: { timestamp?: string; type?: string };
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      if (!entry.timestamp || entry.type !== "assistant") continue;
      const entryDate = toLocalDateString(new Date(entry.timestamp));
      if (entryDate !== today) continue;
      const hour = new Date(entry.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  }

  const result: HourlyUsage[] = [];
  for (let h = 0; h < 24; h++) {
    result.push({ hour: h, count: hourCounts[h] || 0 });
  }
  return result;
}

export function fetchClaudeCodeTopSessions(): TopSession[] {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) return [];
  const files = findJsonlFiles(CLAUDE_PROJECTS_DIR);
  interface SessionAcc {
    cost: number;
    inputTokens: number;
    outputTokens: number;
    messageCount: number;
  }
  const sessions = new Map<string, SessionAcc>();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      let entry: {
        type?: string;
        sessionId?: string;
        timestamp?: string;
        message?: {
          model?: string;
          usage?: {
            input_tokens: number;
            output_tokens: number;
            cache_read_input_tokens: number;
            cache_creation_input_tokens: number;
          };
        };
      };
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      if (entry.type !== "assistant" || !entry.message?.usage || !entry.sessionId) continue;
      const usage = entry.message.usage;
      const model = entry.message.model || "unknown";
      const cost = calculateCost(
        model,
        usage.input_tokens || 0,
        usage.output_tokens || 0,
        usage.cache_creation_input_tokens || 0,
        usage.cache_read_input_tokens || 0,
      );

      const acc = sessions.get(entry.sessionId);
      if (acc) {
        acc.cost += cost;
        acc.inputTokens += usage.input_tokens || 0;
        acc.outputTokens += usage.output_tokens || 0;
        acc.messageCount += 1;
      } else {
        sessions.set(entry.sessionId, {
          cost,
          inputTokens: usage.input_tokens || 0,
          outputTokens: usage.output_tokens || 0,
          messageCount: 1,
        });
      }
    }
  }

  // Find session titles from multiple sources:
  // 1. ~/.claude/sessions/*.json  – has the user-renamed "name" field
  // 2. sessions-index.json        – fallback to firstPrompt
  const titles = new Map<string, string>();

  // 1. Read renamed session names from ~/.claude/sessions/*.json
  const SESSIONS_DIR = path.join(os.homedir(), ".claude", "sessions");
  if (fs.existsSync(SESSIONS_DIR)) {
    for (const file of fs.readdirSync(SESSIONS_DIR)) {
      if (!file.endsWith(".json")) continue;
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, file), "utf-8"));
        if (meta.sessionId && meta.name) {
          titles.set(meta.sessionId, meta.name);
        }
      } catch {
        continue;
      }
    }
  }

  // 2. Fallback: read firstPrompt from sessions-index.json files
  const indexDirs = fs.readdirSync(CLAUDE_PROJECTS_DIR, { withFileTypes: true });
  for (const dir of indexDirs) {
    if (!dir.isDirectory()) continue;
    const indexPath = path.join(CLAUDE_PROJECTS_DIR, dir.name, "sessions-index.json");
    if (!fs.existsSync(indexPath)) continue;
    try {
      const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      for (const entry of index.entries || []) {
        if (entry.sessionId && entry.firstPrompt && !titles.has(entry.sessionId)) {
          titles.set(entry.sessionId, entry.firstPrompt);
        }
      }
    } catch {
      continue;
    }
  }

  return Array.from(sessions.entries())
    .map(([sessionId, acc]) => ({
      source: "claude-code" as const,
      title: titles.get(sessionId) || sessionId.slice(0, 8),
      cost: acc.cost,
      inputTokens: acc.inputTokens,
      outputTokens: acc.outputTokens,
      messageCount: acc.messageCount,
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);
}
