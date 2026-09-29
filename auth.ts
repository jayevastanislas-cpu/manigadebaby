import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

const SECRET = process.env.AUTH_SECRET || "maniguadebaby-secret-change-me-2026";

export const SESSION_COOKIE = "mgb_session";
export const PROFILE_COOKIE = "mgb_profile";
export const VISITOR_COOKIE = "mgb_visitor";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const ADMIN_ROLES = ["admin", "superadmin"];

/* --------------------------- mots de passe ------------------------------ */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, derived] = stored.split(":");
  if (!salt || !derived) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(derived, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* ------------------------------- jetons ---------------------------------- */

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function createToken(subject: string): string {
  const payload = `${subject}.${Date.now() + SESSION_TTL_MS}`;
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(payload)}`;
}

function readToken(token?: string | null): { subject: string; expiresAt: number } | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (sign(payload) !== signature) return null;
  const separator = payload.lastIndexOf(".");
  const subject = payload.slice(0, separator);
  const expiresAt = Number(payload.slice(separator + 1));
  if (!subject || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  return { subject, expiresAt };
}

export const createSessionToken = createToken;
export const createProfileToken = createToken;
export const readSessionToken = readToken;
export const readProfileToken = readToken;

/* ------------------------------- sessions -------------------------------- */

export type SessionUser = { id: string; email: string; name: string; role: string };

async function findProfile(id: string) {
  const rows = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      displayName: profiles.displayName,
      role: profiles.role,
      avatarUrl: profiles.avatarUrl,
      city: profiles.city,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Session administrateur : un profil `profiles` dont le rôle est admin. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = readToken(store.get(SESSION_COOKIE)?.value);
  if (!token) return null;
  const profile = await findProfile(token.subject);
  if (!profile || !ADMIN_ROLES.includes(profile.role)) return null;
  return { id: profile.id, email: profile.email, name: profile.displayName, role: profile.role };
}

export type SessionProfile = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string;
  city: string;
  createdAt: Date;
};

/** Session fan (tout rôle confondu). */
export async function getProfile(): Promise<SessionProfile | null> {
  const store = await cookies();
  const token = readToken(store.get(PROFILE_COOKIE)?.value);
  if (!token) return null;
  const profile = await findProfile(token.subject);
  return profile;
}

/* ------------------------------- visiteurs ------------------------------- */

export function generateVisitorId(): string {
  return `v_${randomBytes(12).toString("base64url")}`;
}

export function newId(): string {
  return randomUUID();
}

export { inArray };
