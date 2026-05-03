// ─── Hardcoded Model Pricing ──────────────────────────────────────────────────
//
// Prices are per-token (not per-million).
// Source: Anthropic API docs, Fireworks AI, DeepInfra
//
// When you see "N/A" in the dashboard for a model, tell the developer the
// model name and they'll search for pricing and add it here.
//
// ─── Anthropic Models (direct API pricing) ────────────────────────────────────

const HARDCODED_PRICES: Record<string, ModelCosts> = {
  // ── Current Generation ──
  // Opus 4.7
  "claude-opus-4-7": {
    inputCostPerToken: 5 / 1_000_000,
    outputCostPerToken: 25 / 1_000_000,
    cacheWriteCostPerToken: 6.25 / 1_000_000,
    cacheReadCostPerToken: 0.5 / 1_000_000,
  },
  "claude-opus-4-7-latest": {
    inputCostPerToken: 5 / 1_000_000,
    outputCostPerToken: 25 / 1_000_000,
    cacheWriteCostPerToken: 6.25 / 1_000_000,
    cacheReadCostPerToken: 0.5 / 1_000_000,
  },
  "claude-opus-4-7-20250101": {
    inputCostPerToken: 5 / 1_000_000,
    outputCostPerToken: 25 / 1_000_000,
    cacheWriteCostPerToken: 6.25 / 1_000_000,
    cacheReadCostPerToken: 0.5 / 1_000_000,
  },
  // Sonnet 4.6
  "claude-sonnet-4-6": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-sonnet-4-6-latest": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-sonnet-4-6-20250101": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  // Haiku 4.5
  "claude-haiku-4-5": {
    inputCostPerToken: 1 / 1_000_000,
    outputCostPerToken: 5 / 1_000_000,
    cacheWriteCostPerToken: 1.25 / 1_000_000,
    cacheReadCostPerToken: 0.1 / 1_000_000,
  },
  "claude-haiku-4-5-latest": {
    inputCostPerToken: 1 / 1_000_000,
    outputCostPerToken: 5 / 1_000_000,
    cacheWriteCostPerToken: 1.25 / 1_000_000,
    cacheReadCostPerToken: 0.1 / 1_000_000,
  },
  "claude-haiku-4-5-20250101": {
    inputCostPerToken: 1 / 1_000_000,
    outputCostPerToken: 5 / 1_000_000,
    cacheWriteCostPerToken: 1.25 / 1_000_000,
    cacheReadCostPerToken: 0.1 / 1_000_000,
  },

  // ── Legacy Anthropic Models ──
  "claude-opus-4-6": {
    inputCostPerToken: 5 / 1_000_000,
    outputCostPerToken: 25 / 1_000_000,
    cacheWriteCostPerToken: 6.25 / 1_000_000,
    cacheReadCostPerToken: 0.5 / 1_000_000,
  },
  "claude-opus-4-6-latest": {
    inputCostPerToken: 5 / 1_000_000,
    outputCostPerToken: 25 / 1_000_000,
    cacheWriteCostPerToken: 6.25 / 1_000_000,
    cacheReadCostPerToken: 0.5 / 1_000_000,
  },
  "claude-sonnet-4-5": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-sonnet-4-5-latest": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-opus-4-5": {
    inputCostPerToken: 5 / 1_000_000,
    outputCostPerToken: 25 / 1_000_000,
    cacheWriteCostPerToken: 6.25 / 1_000_000,
    cacheReadCostPerToken: 0.5 / 1_000_000,
  },
  "claude-opus-4-5-latest": {
    inputCostPerToken: 5 / 1_000_000,
    outputCostPerToken: 25 / 1_000_000,
    cacheWriteCostPerToken: 6.25 / 1_000_000,
    cacheReadCostPerToken: 0.5 / 1_000_000,
  },
  "claude-opus-4-1": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 75 / 1_000_000,
    cacheWriteCostPerToken: 18.75 / 1_000_000,
    cacheReadCostPerToken: 1.5 / 1_000_000,
  },
  "claude-opus-4-1-latest": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 75 / 1_000_000,
    cacheWriteCostPerToken: 18.75 / 1_000_000,
    cacheReadCostPerToken: 1.5 / 1_000_000,
  },
  "claude-sonnet-4": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-sonnet-4-latest": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-opus-4": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 75 / 1_000_000,
    cacheWriteCostPerToken: 18.75 / 1_000_000,
    cacheReadCostPerToken: 1.5 / 1_000_000,
  },
  "claude-opus-4-latest": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 75 / 1_000_000,
    cacheWriteCostPerToken: 18.75 / 1_000_000,
    cacheReadCostPerToken: 1.5 / 1_000_000,
  },

  // ── Claude 3.x Series (past year) ──
  "claude-3-7-sonnet": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-7-sonnet-latest": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-7-sonnet-20250219": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-5-sonnet": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-5-sonnet-latest": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-5-sonnet-20241022": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-5-sonnet-20240620": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-5-haiku": {
    inputCostPerToken: 0.8 / 1_000_000,
    outputCostPerToken: 4 / 1_000_000,
    cacheWriteCostPerToken: 1 / 1_000_000,
    cacheReadCostPerToken: 0.08 / 1_000_000,
  },
  "claude-3-5-haiku-latest": {
    inputCostPerToken: 0.8 / 1_000_000,
    outputCostPerToken: 4 / 1_000_000,
    cacheWriteCostPerToken: 1 / 1_000_000,
    cacheReadCostPerToken: 0.08 / 1_000_000,
  },
  "claude-3-5-haiku-20241022": {
    inputCostPerToken: 0.8 / 1_000_000,
    outputCostPerToken: 4 / 1_000_000,
    cacheWriteCostPerToken: 1 / 1_000_000,
    cacheReadCostPerToken: 0.08 / 1_000_000,
  },
  "claude-3-opus": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 75 / 1_000_000,
    cacheWriteCostPerToken: 18.75 / 1_000_000,
    cacheReadCostPerToken: 1.5 / 1_000_000,
  },
  "claude-3-opus-latest": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 75 / 1_000_000,
    cacheWriteCostPerToken: 18.75 / 1_000_000,
    cacheReadCostPerToken: 1.5 / 1_000_000,
  },
  "claude-3-opus-20240229": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 75 / 1_000_000,
    cacheWriteCostPerToken: 18.75 / 1_000_000,
    cacheReadCostPerToken: 1.5 / 1_000_000,
  },
  "claude-3-sonnet": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-sonnet-latest": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-sonnet-20240229": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },
  "claude-3-haiku": {
    inputCostPerToken: 0.25 / 1_000_000,
    outputCostPerToken: 1.25 / 1_000_000,
    cacheWriteCostPerToken: 0.3125 / 1_000_000,
    cacheReadCostPerToken: 0.025 / 1_000_000,
  },
  "claude-3-haiku-latest": {
    inputCostPerToken: 0.25 / 1_000_000,
    outputCostPerToken: 1.25 / 1_000_000,
    cacheWriteCostPerToken: 0.3125 / 1_000_000,
    cacheReadCostPerToken: 0.025 / 1_000_000,
  },
  "claude-3-haiku-20240307": {
    inputCostPerToken: 0.25 / 1_000_000,
    outputCostPerToken: 1.25 / 1_000_000,
    cacheWriteCostPerToken: 0.3125 / 1_000_000,
    cacheReadCostPerToken: 0.025 / 1_000_000,
  },

  // ── Other Anthropic aliases ──
  "claude-4-opus": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 75 / 1_000_000,
    cacheWriteCostPerToken: 18.75 / 1_000_000,
    cacheReadCostPerToken: 1.5 / 1_000_000,
  },
  "claude-4-sonnet": {
    inputCostPerToken: 3 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 3.75 / 1_000_000,
    cacheReadCostPerToken: 0.3 / 1_000_000,
  },

  // ─── User-Requested Models ───────────────────────────────────────────────────

  // GLM (Z.ai / Fireworks AI)
  "glm-5.1": {
    inputCostPerToken: 1.4 / 1_000_000,
    outputCostPerToken: 4.4 / 1_000_000,
    cacheWriteCostPerToken: 1.4 / 1_000_000,
    cacheReadCostPerToken: 0.26 / 1_000_000,
  },
  "glm-5": {
    inputCostPerToken: 1.0 / 1_000_000,
    outputCostPerToken: 3.2 / 1_000_000,
    cacheWriteCostPerToken: 1.0 / 1_000_000,
    cacheReadCostPerToken: 0.2 / 1_000_000,
  },

  // Kimi (Moonshot AI / Fireworks AI)
  "kimi-k2.5": {
    inputCostPerToken: 0.6 / 1_000_000,
    outputCostPerToken: 3.0 / 1_000_000,
    cacheWriteCostPerToken: 0.6 / 1_000_000,
    cacheReadCostPerToken: 0.1 / 1_000_000,
  },
  "kimi-k2.6": {
    inputCostPerToken: 0.95 / 1_000_000,
    outputCostPerToken: 4.0 / 1_000_000,
    cacheWriteCostPerToken: 0.95 / 1_000_000,
    cacheReadCostPerToken: 0.16 / 1_000_000,
  },

  // MiniMax (Fireworks AI)
  "minimax-m2.5": {
    inputCostPerToken: 0.3 / 1_000_000,
    outputCostPerToken: 1.2 / 1_000_000,
    cacheWriteCostPerToken: 0.3 / 1_000_000,
    cacheReadCostPerToken: 0.03 / 1_000_000,
  },
  "minimax-m2.7": {
    inputCostPerToken: 0.3 / 1_000_000,
    outputCostPerToken: 1.2 / 1_000_000,
    cacheWriteCostPerToken: 0.3 / 1_000_000,
    cacheReadCostPerToken: 0.06 / 1_000_000,
  },

  // DeepSeek (Fireworks AI / DeepInfra)
  "deepseek-v4-pro": {
    inputCostPerToken: 1.74 / 1_000_000,
    outputCostPerToken: 3.48 / 1_000_000,
    cacheWriteCostPerToken: 1.74 / 1_000_000,
    cacheReadCostPerToken: 0.145 / 1_000_000,
  },

  // ─── Explicitly Free Models (cost = 0) ────────────────────────────────────────
  "big-pickle": {
    inputCostPerToken: 0,
    outputCostPerToken: 0,
    cacheWriteCostPerToken: 0,
    cacheReadCostPerToken: 0,
  },
  "hy3-preview-free": {
    inputCostPerToken: 0,
    outputCostPerToken: 0,
    cacheWriteCostPerToken: 0,
    cacheReadCostPerToken: 0,
  },
  "minimax-m2.5-free": {
    inputCostPerToken: 0,
    outputCostPerToken: 0,
    cacheWriteCostPerToken: 0,
    cacheReadCostPerToken: 0,
  },
  "nemotron-3-super-free": {
    inputCostPerToken: 0,
    outputCostPerToken: 0,
    cacheWriteCostPerToken: 0,
    cacheReadCostPerToken: 0,
  },

  // ─── Common OpenAI / GPT Models ──────────────────────────────────────────────
  "gpt-4o": {
    inputCostPerToken: 2.5 / 1_000_000,
    outputCostPerToken: 10 / 1_000_000,
    cacheWriteCostPerToken: 2.5 / 1_000_000,
    cacheReadCostPerToken: 1.25 / 1_000_000,
  },
  "gpt-4o-latest": {
    inputCostPerToken: 2.5 / 1_000_000,
    outputCostPerToken: 10 / 1_000_000,
    cacheWriteCostPerToken: 2.5 / 1_000_000,
    cacheReadCostPerToken: 1.25 / 1_000_000,
  },
  "gpt-4o-2024-08-06": {
    inputCostPerToken: 2.5 / 1_000_000,
    outputCostPerToken: 10 / 1_000_000,
    cacheWriteCostPerToken: 2.5 / 1_000_000,
    cacheReadCostPerToken: 1.25 / 1_000_000,
  },
  "gpt-4o-2024-05-13": {
    inputCostPerToken: 5 / 1_000_000,
    outputCostPerToken: 15 / 1_000_000,
    cacheWriteCostPerToken: 5 / 1_000_000,
    cacheReadCostPerToken: 2.5 / 1_000_000,
  },
  "gpt-4o-mini": {
    inputCostPerToken: 0.15 / 1_000_000,
    outputCostPerToken: 0.6 / 1_000_000,
    cacheWriteCostPerToken: 0.15 / 1_000_000,
    cacheReadCostPerToken: 0.075 / 1_000_000,
  },
  "gpt-4o-mini-latest": {
    inputCostPerToken: 0.15 / 1_000_000,
    outputCostPerToken: 0.6 / 1_000_000,
    cacheWriteCostPerToken: 0.15 / 1_000_000,
    cacheReadCostPerToken: 0.075 / 1_000_000,
  },
  "gpt-4.1": {
    inputCostPerToken: 2 / 1_000_000,
    outputCostPerToken: 8 / 1_000_000,
    cacheWriteCostPerToken: 2 / 1_000_000,
    cacheReadCostPerToken: 1 / 1_000_000,
  },
  "gpt-4.1-mini": {
    inputCostPerToken: 0.4 / 1_000_000,
    outputCostPerToken: 1.6 / 1_000_000,
    cacheWriteCostPerToken: 0.4 / 1_000_000,
    cacheReadCostPerToken: 0.2 / 1_000_000,
  },
  "gpt-4.1-nano": {
    inputCostPerToken: 0.1 / 1_000_000,
    outputCostPerToken: 0.4 / 1_000_000,
    cacheWriteCostPerToken: 0.1 / 1_000_000,
    cacheReadCostPerToken: 0.05 / 1_000_000,
  },
  "o3": {
    inputCostPerToken: 10 / 1_000_000,
    outputCostPerToken: 40 / 1_000_000,
    cacheWriteCostPerToken: 10 / 1_000_000,
    cacheReadCostPerToken: 2.5 / 1_000_000,
  },
  "o3-mini": {
    inputCostPerToken: 1.1 / 1_000_000,
    outputCostPerToken: 4.4 / 1_000_000,
    cacheWriteCostPerToken: 1.1 / 1_000_000,
    cacheReadCostPerToken: 0.275 / 1_000_000,
  },
  "o1": {
    inputCostPerToken: 15 / 1_000_000,
    outputCostPerToken: 60 / 1_000_000,
    cacheWriteCostPerToken: 15 / 1_000_000,
    cacheReadCostPerToken: 7.5 / 1_000_000,
  },
  "o1-mini": {
    inputCostPerToken: 1.1 / 1_000_000,
    outputCostPerToken: 4.4 / 1_000_000,
    cacheWriteCostPerToken: 1.1 / 1_000_000,
    cacheReadCostPerToken: 0.55 / 1_000_000,
  },

  // ─── Common Google Models ────────────────────────────────────────────────────
  "gemini-2.5-pro": {
    inputCostPerToken: 1.25 / 1_000_000,
    outputCostPerToken: 10 / 1_000_000,
    cacheWriteCostPerToken: 1.25 / 1_000_000,
    cacheReadCostPerToken: 0.3125 / 1_000_000,
  },
  "gemini-2.5-flash": {
    inputCostPerToken: 0.3 / 1_000_000,
    outputCostPerToken: 2.5 / 1_000_000,
    cacheWriteCostPerToken: 0.3 / 1_000_000,
    cacheReadCostPerToken: 0.075 / 1_000_000,
  },
  "gemini-2.0-flash": {
    inputCostPerToken: 0.1 / 1_000_000,
    outputCostPerToken: 0.4 / 1_000_000,
    cacheWriteCostPerToken: 0.1 / 1_000_000,
    cacheReadCostPerToken: 0.025 / 1_000_000,
  },
  "gemini-2.0-flash-lite": {
    inputCostPerToken: 0.075 / 1_000_000,
    outputCostPerToken: 0.3 / 1_000_000,
    cacheWriteCostPerToken: 0.075 / 1_000_000,
    cacheReadCostPerToken: 0.01875 / 1_000_000,
  },
  "gemini-1.5-pro": {
    inputCostPerToken: 1.25 / 1_000_000,
    outputCostPerToken: 5 / 1_000_000,
    cacheWriteCostPerToken: 1.25 / 1_000_000,
    cacheReadCostPerToken: 0.3125 / 1_000_000,
  },
  "gemini-1.5-flash": {
    inputCostPerToken: 0.075 / 1_000_000,
    outputCostPerToken: 0.3 / 1_000_000,
    cacheWriteCostPerToken: 0.075 / 1_000_000,
    cacheReadCostPerToken: 0.01875 / 1_000_000,
  },

  // ─── Common DeepSeek Models ──────────────────────────────────────────────────
  "deepseek-v3": {
    inputCostPerToken: 0.27 / 1_000_000,
    outputCostPerToken: 1.1 / 1_000_000,
    cacheWriteCostPerToken: 0.27 / 1_000_000,
    cacheReadCostPerToken: 0.07 / 1_000_000,
  },
  "deepseek-chat": {
    inputCostPerToken: 0.27 / 1_000_000,
    outputCostPerToken: 1.1 / 1_000_000,
    cacheWriteCostPerToken: 0.27 / 1_000_000,
    cacheReadCostPerToken: 0.07 / 1_000_000,
  },
  "deepseek-reasoner": {
    inputCostPerToken: 0.55 / 1_000_000,
    outputCostPerToken: 2.19 / 1_000_000,
    cacheWriteCostPerToken: 0.55 / 1_000_000,
    cacheReadCostPerToken: 0.14 / 1_000_000,
  },
  "deepseek-r1": {
    inputCostPerToken: 0.55 / 1_000_000,
    outputCostPerToken: 2.19 / 1_000_000,
    cacheWriteCostPerToken: 0.55 / 1_000_000,
    cacheReadCostPerToken: 0.14 / 1_000_000,
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModelCosts {
  inputCostPerToken: number;
  outputCostPerToken: number;
  cacheWriteCostPerToken: number;
  cacheReadCostPerToken: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function canonicalizeModel(model: string): string {
  return model
    .replace(/@.*$/, "")
    .replace(/-\d{8}$/, "")
    .replace(/^[^/]+\//, "")
    .toLowerCase()
    .trim();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get pricing for a model. Returns null if the model is not in the hardcoded
 * list — the caller should treat this as "N/A" (unknown pricing, not free).
 */
export function getModelCosts(model: string): ModelCosts | null {
  const canonical = canonicalizeModel(model);
  return HARDCODED_PRICES[canonical] ?? null;
}

/**
 * Calculate cost for a single request. Returns 0 when pricing is unknown.
 * Token counts are still recorded in the DB; only cost shows as 0 / N/A.
 */
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

/**
 * @deprecated Pricing is now fully hardcoded. No-op.
 */
export async function ensurePricingLoaded(): Promise<void> {
  // No-op — prices are hardcoded in HARDCODED_PRICES.
}

/**
 * @deprecated Pricing is now fully hardcoded. Returns empty result.
 */
export async function fetchLiteLLM(): Promise<Record<string, unknown>> {
  return {};
}

/**
 * @deprecated Pricing is now fully hardcoded. Returns empty result.
 */
export function validatePricing(_data: Record<string, unknown>): boolean {
  return true;
}

/**
 * @deprecated Pricing is now fully hardcoded. Returns empty result.
 */
export async function fetchAndPatchPricing(): Promise<{
  success: boolean;
  validated: boolean;
  patched: number;
}> {
  return { success: true, validated: true, patched: 0 };
}
