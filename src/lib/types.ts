export type Source = "opencode" | "hermes";

export interface UsageRecord {
  id?: number;
  date: string;
  model: string;
  source: Source;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  reasoning_tokens: number;
  cost: number;
}

export interface DailyUsage {
  date: string;
  total_cost: number;
  total_tokens: number;
  total_requests: number;
  models: Record<
    string,
    {
      source: Source;
      cost: number;
      input_tokens: number;
      output_tokens: number;
      cache_read_tokens: number;
      cache_write_tokens: number;
      reasoning_tokens: number;
      requests: number;
    }
  >;
}

export interface ModelStats {
  model: string;
  source: Source;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  reasoning_tokens: number;
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
  sourceCosts: Record<Source, number>;
  sourceTokens: Record<Source, number>;
}

export interface OpenCodeMessage {
  role: string;
  modelID?: string;
  providerID?: string;
  cost?: number;
  tokens?: {
    total: number;
    input: number;
    output: number;
    reasoning: number;
    cache: {
      write: number;
      read: number;
    };
  };
  time?: {
    created?: number;
    completed?: number;
  };
  finish?: string;
}