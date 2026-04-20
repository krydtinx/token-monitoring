export const dynamic = "force-dynamic";

import { getDailyUsage, getModelStats } from "@/lib/db";
import { fetchOpenCodeDailySessions, fetchOpenCodeLatency, fetchOpenCodeTopSessions } from "@/lib/opencode";
import { fetchHermesToolUsage, fetchHermesTopSessions, fetchHermesDailySessions } from "@/lib/hermes";
import { fetchClaudeCodeDailySessions, fetchClaudeCodeHourlyUsage, fetchClaudeCodeTopSessions } from "@/lib/claude-code";
import DashboardClient from "@/components/DashboardClient";
import type { Source, DailySession } from "@/lib/types";

function mergeDailySessions(
  oc: { date: string; count: number }[],
  hermes: { date: string; count: number }[],
  cc: { date: string; count: number }[],
): DailySession[] {
  const map = new Map<string, DailySession>();
  for (const r of oc) {
    if (!map.has(r.date)) map.set(r.date, { date: r.date, opencode: 0, hermes: 0, claudeCode: 0 });
    map.get(r.date)!.opencode = r.count;
  }
  for (const r of hermes) {
    if (!map.has(r.date)) map.set(r.date, { date: r.date, opencode: 0, hermes: 0, claudeCode: 0 });
    map.get(r.date)!.hermes = r.count;
  }
  for (const r of cc) {
    if (!map.has(r.date)) map.set(r.date, { date: r.date, opencode: 0, hermes: 0, claudeCode: 0 });
    map.get(r.date)!.claudeCode = r.count;
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export default async function DashboardPage() {
  const modelStats = getModelStats();
  const dailyUsage = getDailyUsage();

  const totalCost = modelStats.reduce((sum, m) => sum + m.cost, 0);
  const totalTokens = modelStats.reduce((sum, m) => sum + m.total_tokens, 0);
  const totalRequests = modelStats.reduce((sum, m) => sum + m.requests, 0);

  const sourceCosts: Record<Source, number> = { opencode: 0, hermes: 0, "claude-code": 0 };
  const sourceTokens: Record<Source, number> = { opencode: 0, hermes: 0, "claude-code": 0 };
  for (const m of modelStats) {
    sourceCosts[m.source] += m.cost;
    sourceTokens[m.source] += m.total_tokens;
  }

  const dailySessions = mergeDailySessions(
    fetchOpenCodeDailySessions(),
    fetchHermesDailySessions(),
    fetchClaudeCodeDailySessions(),
  );
  const toolUsage = fetchHermesToolUsage();
  const hourlyUsage = fetchClaudeCodeHourlyUsage();
  const latency = fetchOpenCodeLatency();
  const topSessions = [
    ...fetchOpenCodeTopSessions(),
    ...fetchHermesTopSessions(),
    ...fetchClaudeCodeTopSessions(),
  ].sort((a, b) => b.cost - a.cost).slice(0, 15);

  const initialData = {
    totalCost,
    totalTokens,
    totalRequests,
    activeModels: modelStats.length,
    modelStats,
    dailyUsage,
    sourceCosts,
    sourceTokens,
    dailySessions,
    toolUsage,
    hourlyUsage,
    latency,
    topSessions,
  };

  return <DashboardClient initialData={initialData} />;
}