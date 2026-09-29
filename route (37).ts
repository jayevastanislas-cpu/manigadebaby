import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { playEvents } from "@/db/schema";
import { VISITOR_COOKIE, getProfile } from "@/lib/auth";
import { incrementTrackPlay } from "@/lib/queries";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { trackId?: string; seconds?: number; source?: string };
  const trackId = String(body.trackId ?? "");
  if (!UUID_REGEX.test(trackId)) {
    return NextResponse.json({ error: "trackId invalide." }, { status: 400 });
  }

  const store = await cookies();
  const profile = await getProfile();
  const visitorId = profile ? null : store.get(VISITOR_COOKIE)?.value ?? null;

  await incrementTrackPlay(trackId).catch(() => undefined);

  await db
    .insert(playEvents)
    .values({
      userId: profile?.id ?? null,
      visitorId,
      trackId,
      seconds: Math.max(0, Number(body.seconds ?? 0) || 0),
      source: body.source === "mobile" ? "mobile" : "web",
    })
    .catch(() => undefined);

  return NextResponse.json({ ok: true });
}
