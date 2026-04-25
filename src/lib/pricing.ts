import "server-only";

import { getDb } from "./db";

const LITELLM_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface LiteLLMEntry {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  cache_creation_input_token_cost?: number;
  cache_read_input_token_cost?: number;
}

interface ModelCosts {
  inputCostPerToken: number;
  outputCostPerToken: number;
  cacheWriteCostPerToken: number;
  cacheReadCostPerToken: number;
}

type PricingRow = {
  model: string;
  input_cost_per_token: number | null;
  output_cost_per_token: number | null;
  cache_write_cost_per_token: number | null;
  cache_read_cost_per_token: number | null;
  created_date: number | null;
  updated_date: number | null;
};

const VALIDATION_MODELS = ["claude-opus-4-6", "gpt-4o"];

let pricingLoaded = false;

export async function ensurePricingLoaded(): Promise<void> {
  if (pricingLoaded) return;

  const db = getDb();
  const rows = db.prepare("SELECT COUNT(*) as count FROM model_pricing").get() as { count: number };
  
  if (rows.count === 0) {
    await fetchAndPatchPricing();
    pricingLoaded = true;
    return;
  }

  const oldest = db.prepare("SELECT MIN(updated_date) as oldest FROM model_pricing").get() as { oldest: number | null };
  if (!oldest.oldest || Date.now() - oldest.oldest > CACHE_TTL_MS) {
    await fetchAndPatchPricing();
  }
  
  pricingLoaded = true;
}

export async function fetchLiteLLM(): Promise<Record<string, LiteLLMEntry>> {
  const response = await fetch(LITELLM_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<Record<string, LiteLLMEntry>>;
}

export function validatePricing(data: Record<string, LiteLLMEntry>): boolean {
  for (const model of VALIDATION_MODELS) {
    const entry = data[model] || data[`anthropic/${model}`];
    if (!entry || entry.input_cost_per_token === undefined || entry.output_cost_per_token === undefined) {
      return false;
    }
  }
  return true;
}

export async function fetchAndPatchPricing(): Promise<{ success: boolean; validated: boolean; patched: number }> {
  const data = await fetchLiteLLM();
  
  if (!validatePricing(data)) {
    return { success: true, validated: false, patched: 0 };
  }

  const db = getDb();
  let patched = 0;
  const now = Date.now();

  for (const [name, entry] of Object.entries(data)) {
    const modelKey = name.replace(/^[^/]+\//, "");
    
    const existing = db.prepare("SELECT * FROM model_pricing WHERE model = ?").get(modelKey) as PricingRow | undefined;
    
    const inputCost = entry.input_cost_per_token ?? null;
    const outputCost = entry.output_cost_per_token ?? null;
    const cacheWriteCost = entry.cache_creation_input_token_cost ?? null;
    const cacheReadCost = entry.cache_read_input_token_cost ?? null;

    if (!existing) {
      db.prepare(`
        INSERT INTO model_pricing (model, input_cost_per_token, output_cost_per_token, cache_write_cost_per_token, cache_read_cost_per_token, created_date, updated_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(modelKey, inputCost, outputCost, cacheWriteCost, cacheReadCost, now, now);
      patched++;
    } else {
      const updates: string[] = [];
      const values: (number | string | null)[] = [];

      if (inputCost !== null && inputCost !== existing.input_cost_per_token) {
        updates.push("input_cost_per_token = ?");
        values.push(inputCost);
      }
      if (outputCost !== null && outputCost !== existing.output_cost_per_token) {
        updates.push("output_cost_per_token = ?");
        values.push(outputCost);
      }
      if (cacheWriteCost !== null && cacheWriteCost !== existing.cache_write_cost_per_token) {
        updates.push("cache_write_cost_per_token = ?");
        values.push(cacheWriteCost);
      }
      if (cacheReadCost !== null && cacheReadCost !== existing.cache_read_cost_per_token) {
        updates.push("cache_read_cost_per_token = ?");
        values.push(cacheReadCost);
      }

      if (updates.length > 0) {
        updates.push("updated_date = ?");
        values.push(now);
        values.push(modelKey);
        
        db.prepare(`UPDATE model_pricing SET ${updates.join(", ")} WHERE model = ?`).run(...values);
        patched++;
      }
    }
  }

  return { success: true, validated: true, patched };
}

export function getModelCosts(model: string): ModelCosts | null {
  const canonical = model
    .replace(/@.*$/, "")
    .replace(/-\d{8}$/, "")
    .replace(/^[^/]+\//, "");

  const db = getDb();
  const row = db.prepare(`
    SELECT input_cost_per_token, output_cost_per_token, cache_write_cost_per_token, cache_read_cost_per_token
    FROM model_pricing
    WHERE model = ?
  `).get(canonical) as {
    input_cost_per_token: number | null;
    output_cost_per_token: number | null;
    cache_write_cost_per_token: number | null;
    cache_read_cost_per_token: number | null;
  } | undefined;

  if (!row || row.input_cost_per_token === null || row.output_cost_per_token === null) {
    return null;
  }

  return {
    inputCostPerToken: row.input_cost_per_token,
    outputCostPerToken: row.output_cost_per_token,
    cacheWriteCostPerToken: row.cache_write_cost_per_token ?? row.input_cost_per_token * 1.25,
    cacheReadCostPerToken: row.cache_read_cost_per_token ?? row.input_cost_per_token * 0.1,
  };
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheWriteTokens: number = 0,
  cacheReadTokens: number = 0,
): number {
  const costs = getModelCosts(model);
  if (!costs) return 0;

  return (
    inputTokens * costs.inputCostPerToken +
    outputTokens * costs.outputCostPerToken +
    cacheWriteTokens * costs.cacheWriteCostPerToken +
    cacheReadTokens * costs.cacheReadCostPerToken
  );
}