import { NextResponse } from "next/server";
import { getActiveApiKey, upsertUsage } from "@/lib/db";
import { fetchUsage } from "@/lib/openrouter";

export async function POST() {
  try {
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: "No active API key configured" }, { status: 400 });
    }

    const records = await fetchUsage(apiKey.key);
    if (records.length > 0) {
      upsertUsage(records);
    }

    return NextResponse.json({ success: true, recordsCount: records.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to refresh usage" }, { status: 500 });
  }
}
