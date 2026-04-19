export type Source = "opencode" | "hermes" | "claude-code";

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

export interface DailySession {
  date: string;
  opencode: number;
  hermes: number;
  claudeCode: number;
}

export interface ToolUsage {
  tool: string;
  count: number;
}

export interface HourlyUsage {
  hour: number;
  count: number;
}

export interface LatencyPoint {
  date: string;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  count: number;
}

export interface TopSession {
  source: Source;
  title: string;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  messageCount: number;
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
  dailySessions: DailySession[];
  toolUsage: ToolUsage[];
  hourlyUsage: HourlyUsage[];
  latency: LatencyPoint[];
  topSessions: TopSession[];
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