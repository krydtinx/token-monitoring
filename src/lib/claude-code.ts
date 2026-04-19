import "server-only";

import fs from "fs";
import path from "path";
import os from "os";
import type { UsageRecord } from "./types";

const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), ".claude", "projects");

// Anthropic API pricing per token (MTok prices / 1,000,000)
interface ModelPricing {
  input: number;
  output: number;
  cacheWrite5m: number;
  cacheWrite1h: number;
  cacheRead: number;
}

const PRICING: Record<string, ModelPricing> = {
  opus: { input: 5 / 1e6, output: 25 / 1e6, cacheWrite5m: 6.25 / 1e6, cacheWrite1h: 10 / 1e6, cacheRead: 0.5 / 1e6 },
  sonnet: { input: 3 / 1e6, output: 15 / 1e6, cacheWrite5m: 3.75 / 1e6, cacheWrite1h: 6 / 1e6, cacheRead: 0.3 / 1e6 },
  haiku: { input: 1 / 1e6, output: 5 / 1e6, cacheWrite5m: 1.25 / 1e6, cacheWrite1h: 2 / 1e6, cacheRead: 0.1 / 1e6 },
};

function getPricing(model: string): ModelPricing {
  const lower = model.toLowerCase();
  if (lower.includes("opus")) return PRICING.opus;
  if (lower.includes("haiku")) return PRICING.haiku;
  return PRICING.sonnet;
}

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

function computeCost(usage: {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
  cache_creation?: {
    ephemeral_1h_input_tokens?: number;
    ephemeral_5m_input_tokens?: number;
  };
}, pricing: ModelPricing): number {
  let cost = usage.input_tokens * pricing.input;
  cost += usage.output_tokens * pricing.output;
  cost += usage.cache_read_input_tokens * pricing.cacheRead;

  const cacheCreation = usage.cache_creation;
  if (cacheCreation?.ephemeral_1h_input_tokens && cacheCreation.ephemeral_1h_input_tokens > 0) {
    cost += cacheCreation.ephemeral_1h_input_tokens * pricing.cacheWrite1h;
  } else if (cacheCreation?.ephemeral_5m_input_tokens && cacheCreation.ephemeral_5m_input_tokens > 0) {
    cost += cacheCreation.ephemeral_5m_input_tokens * pricing.cacheWrite5m;
  } else {
    // Fallback: use cache_creation_input_tokens with 5m rate
    cost += usage.cache_creation_input_tokens * pricing.cacheWrite5m;
  }

  return cost;
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
            cache_creation?: {
              ephemeral_1h_input_tokens?: number;
              ephemeral_5m_input_tokens?: number;
            };
          };
        };
      };

      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }

      if (entry.type !== "assistant" || !entry.message?.usage || !entry.timestamp) continue;

      const date = entry.timestamp.slice(0, 10);
      const model = entry.message.model || "unknown";
      const usage = entry.message.usage;
      const pricing = getPricing(model);
      const cost = computeCost(usage, pricing);
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
