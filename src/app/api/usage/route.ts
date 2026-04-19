import { NextResponse } from "next/server";
import { getDailyUsage, getModelStats } from "@/lib/db";

export async function GET() {
  try {
    const modelStats = getModelStats();
    const dailyUsage = getDailyUsage();

    const totalCost = modelStats.reduce((sum, m) => sum + m.cost, 0);
    const totalTokens = modelStats.reduce((sum, m) => sum + m.total_tokens, 0);
    const totalRequests = modelStats.reduce((sum, m) => sum + m.requests, 0);

    return NextResponse.json({
      totalCost,
      totalTokens,
      totalRequests,
      activeModels: modelStats.length,
      modelStats,
      dailyUsage,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
