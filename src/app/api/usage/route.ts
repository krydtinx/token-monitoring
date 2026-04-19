import { NextResponse } from "next/server";
import { getDailyUsage, getModelStats } from "@/lib/db";
import type { Source } from "@/lib/types";

export async function GET() {
  try {
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

    return NextResponse.json({
      totalCost,
      totalTokens,
      totalRequests,
      activeModels: modelStats.length,
      modelStats,
      dailyUsage,
      sourceCosts,
      sourceTokens,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
