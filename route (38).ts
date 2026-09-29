import { NextResponse } from "next/server";
import { searchAll } from "@/lib/queries";
import { ensureSeeded } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "6") || 6, 20);
  await ensureSeeded();
  const results = await searchAll(q, limit);
  return NextResponse.json(results);
}
