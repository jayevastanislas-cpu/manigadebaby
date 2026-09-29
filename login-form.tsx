"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { LogoMark, ArrowRightIcon, SparkIcon } from "@/components/icons";

export function LoginForm({ demoEmail, demoPassword }: { demoEmail: string; demoPassword: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Connexion impossible.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Serveur injoignable, réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_10%,rgba(255,106,26,0.22),transparent_60%),radial-gradient(50%_50%_at_85%_80%,rgba(18,184,119,0.18),transparent_60%)]" />
      <div className="wax-pattern pointer-events-none absolute inset-0 opacity-15" />

      <div className="animate-pop relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <LogoMark className="h-12 w-12" />
          <span>
            <span className="block font-display text-xl uppercase leading-none text-cream">
              Maniguade<span className="text-mango-500">baby</span>
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.28em] text-cream-mute">
              Administration · Version 1
            </span>
          </span>
        </Link>

        <div className="rounded-3xl border border-white/12 bg-ink-900/85 p-7 shadow-[0_40px_120px_-40px_rgba(0,0,0,1)] backdrop-blur-xl">
          <h1 className="font-display text-3xl uppercase leading-none text-cream">Connexion</h1>
          <p className="mt-2 text-sm text-cream-dim">
            Accès réservé à l'équipe éditoriale : gestion du catalogue, des clips et des actualités.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none transition focus:border-mango-500/70"
                placeholder="admin@maniguadebaby.ci"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none transition focus:border-mango-500/70"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-mango-500/40 bg-mango-500/10 px-4 py-3 text-sm text-mango-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-mango-400 to-mango-600 px-5 py-3.5 font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Vérification…" : "Entrer dans le back-office"}
              {!loading && <ArrowRightIcon width={16} height={16} />}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-5">
            <button
              onClick={() => setShowDemo((value) => !value)}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-baobab-400"
            >
              <SparkIcon width={13} height={13} />
              {showDemo ? "Masquer" : "Afficher"} le compte de démonstration
            </button>
            {showDemo && (
              <div className="mt-3 rounded-xl border border-baobab-500/30 bg-baobab-500/8 px-4 py-3 text-[12px] text-cream-dim">
                <p>
                  Email : <span className="font-semibold text-cream">{demoEmail}</span>
                </p>
                <p className="mt-1">
                  Mot de passe :{" "}
                  <button
                    onClick={() => setPassword(demoPassword)}
                    className="font-semibold text-baobab-400 underline decoration-dotted"
                  >
                    {demoPassword} (cliquer pour remplir)
                  </button>
                </p>
                <p className="mt-2 text-[11px] text-cream-mute">
                  À changer en production via les variables ADMIN_EMAIL, ADMIN_PASSWORD et AUTH_SECRET.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[12px] text-cream-mute">
          <Link href="/" className="underline decoration-dotted transition hover:text-mango-400">
            ← Retour au site public
          </Link>
        </p>
      </div>
    </div>
  );
}
