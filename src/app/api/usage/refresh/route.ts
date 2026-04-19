import { NextResponse } from "next/server";
import { replaceUsage } from "@/lib/db";
import { fetchUsage } from "@/lib/opencode";

export async function POST() {
  try {
    const records = fetchUsage();
    if (records.length > 0) {
      replaceUsage(records);
    }

    return NextResponse.json({ success: true, recordsCount: records.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to refresh usage" }, { status: 500 });
  }
}