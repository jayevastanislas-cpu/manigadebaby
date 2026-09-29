import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSignups } from "@/db/schema";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  await db
    .insert(newsletterSignups)
    .values({ email })
    .onConflictDoNothing({ target: newsletterSignups.email });
  return NextResponse.json({ ok: true, message: "Inscription enregistrée." });
}
