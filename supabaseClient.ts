/**
 * lib/supabaseClient.ts
 * ------------------------------------------------------------------
 * Client Supabase de Maniguadebaby (authentification + base).
 *
 *  · API conforme à votre extrait : `signInWithEmail(email, password)`
 *  · Si NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY sont
 *    renseignés, Supabase Auth devient la source de vérité.
 *  · Sinon, l'application bascule automatiquement sur l'authentification
 *    locale (table `profiles`, mot de passe haché scrypt) : le site reste
 *    entièrement fonctionnel en développement et en préproduction.
 */

import { createClient, type SupabaseClient, type User, type Session } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Vrai lorsque Supabase est configuré (variables NEXT_PUBLIC_* présentes). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let browserClient: SupabaseClient | null = null;

/** Client Supabase partagé (null si non configuré). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
      },
    });
  }
  return browserClient;
}

type AuthResult = { data: { user: User | null; session: Session | null }; error: Error | null };

/** Connexion par email + mot de passe (Supabase Auth). */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: { user: null, session: null }, error: new Error("Supabase non configuré.") };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data: { user: data?.user ?? null, session: data?.session ?? null }, error };
}

/** Création d'un compte fan (Supabase Auth + déclencheur `handle_new_user`). */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: Record<string, string> = {},
): Promise<AuthResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: { user: null, session: null }, error: new Error("Supabase non configuré.") };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  return { data: { user: data?.user ?? null, session: data?.session ?? null }, error };
}

/** Déconnexion Supabase. */
export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

/** Session Supabase en cours, si elle existe. */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

/**
 * Vérifie un couple email/mot de passe côté serveur (API Routes Node).
 * Retourne l'email validé ou null — utilisé par `/api/auth/fan`.
 */
export async function verifyCredentials(email: string, password: string): Promise<{ email: string; userId: string } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  return { email: data.user.email ?? email, userId: data.user.id };
}

/** Crée un compte Supabase depuis le serveur, pour l'inscription fan. */
export async function createSupabaseUser(
  email: string,
  password: string,
  metadata: Record<string, string> = {},
): Promise<{ email: string; userId: string } | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error || !data.user) return null;
  return { email: data.user.email ?? email, userId: data.user.id };
}

export type { User, Session };
export { createClient };
