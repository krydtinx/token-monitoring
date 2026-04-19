import { getDailyUsage, getModelStats } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";
import type { Source } from "@/lib/types";

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

  const initialData = {
    totalCost,
    totalTokens,
    totalRequests,
    activeModels: modelStats.length,
    modelStats,
    dailyUsage,
    sourceCosts,
    sourceTokens,
  };

  return <DashboardClient initialData={initialData} />;
}