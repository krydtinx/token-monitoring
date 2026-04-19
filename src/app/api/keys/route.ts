import { NextResponse } from "next/server";
import { getApiKeys, addApiKey } from "@/lib/db";

export async function GET() {
  try {
    const keys = getApiKeys();
    return NextResponse.json(keys);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, key } = body;

    if (!name || !key) {
      return NextResponse.json({ error: "name and key are required" }, { status: 400 });
    }

    const id = addApiKey(name, key);
    return NextResponse.json({ id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add key" }, { status: 500 });
  }
}
