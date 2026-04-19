import { getDailyUsage, getModelStats } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const modelStats = getModelStats();
  const dailyUsage = getDailyUsage();

  const totalCost = modelStats.reduce((sum, m) => sum + m.cost, 0);
  const totalTokens = modelStats.reduce((sum, m) => sum + m.total_tokens, 0);
  const totalRequests = modelStats.reduce((sum, m) => sum + m.requests, 0);

  const initialData = {
    totalCost,
    totalTokens,
    totalRequests,
    activeModels: modelStats.length,
    modelStats,
    dailyUsage,
  };

  return <DashboardClient initialData={initialData} />;
}