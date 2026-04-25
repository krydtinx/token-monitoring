import { NextResponse } from "next/server";
import { fetchAndPatchPricing } from "@/lib/pricing";

export async function POST() {
  try {
    const result = await fetchAndPatchPricing();
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to refresh pricing", success: false, validated: false, patched: 0 }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await fetchAndPatchPricing();
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to refresh pricing", success: false, validated: false, patched: 0 }, { status: 500 });
  }
}