import { NextResponse } from "next/server";
import { replaceUsage } from "@/lib/db";
import { fetchUsage } from "@/lib/opencode";
import { fetchHermesUsage } from "@/lib/hermes";

export async function POST() {
  try {
    const opencodeRecords = fetchUsage();
    const hermesRecords = fetchHermesUsage();
    const allRecords = [...opencodeRecords, ...hermesRecords];

    if (allRecords.length > 0) {
      replaceUsage(allRecords);
    }

    return NextResponse.json({
      success: true,
      opencodeCount: opencodeRecords.length,
      hermesCount: hermesRecords.length,
      totalCount: allRecords.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to refresh usage" }, { status: 500 });
  }
}
