export interface UsageRecord {
  id?: number;
  date: string; // "2026-04-19"
  model: string; // e.g. "openrouter/google/gemini-2.0-flash"
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cost: number; // USD
}

export interface ApiKey {
  id?: number;
  name: string; // e.g. "opencode-go"
  key: string; // the actual API key
  is_active: number; // 1 = active, 0 = inactive
}

export interface MaskedApiKey {
  id: number;
  name: string;
  masked_key: string; // "sk_or_****xxxx"
  is_active: number;
}

export interface DailyUsage {
  date: string;
  total_cost: number;
  total_tokens: number;
  total_requests: number;
  models: Record<string, {
    cost: number;
    input_tokens: number;
    output_tokens: number;
    requests: number;
  }>;
}

export interface ModelStats {
  model: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  cost_pct: number;
}

export interface DashboardData {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  activeModels: number;
  modelStats: ModelStats[];
  dailyUsage: DailyUsage[];
}

export interface OpenRouterUsageResponse {
  data: Array<{
    route: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost: number;
    requests: number;
  }>;
}
