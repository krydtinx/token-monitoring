import type { OpenRouterUsageResponse, UsageRecord } from "./types";

const BASE_URL = "https://openrouter.ai/api/v1";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function fetchUsage(apiKey: string): Promise<UsageRecord[]> {
  const res = await fetch(`${BASE_URL}/usage`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as OpenRouterUsageResponse;

  return json.data.map((item) => ({
    date: today(),
    model: item.route,
    requests: item.requests,
    input_tokens: item.input_tokens,
    output_tokens: item.output_tokens,
    cost: item.cost,
  }));
}
