"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark, ArrowRightIcon, SparkIcon, UserIcon } from "@/components/icons";

type Mode = "login" | "register";

export function FanForm({ demo }: { demo: { email: string; password: string } }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/fan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, email, password, displayName, city }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Opération impossible.");
        setLoading(false);
        return;
      }
      router.push("/compte");
      router.refresh();
    } catch {
      setError("Serveur injoignable, réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_25%_10%,rgba(255,106,26,0.22),transparent_60%),radial-gradient(50%_50%_at_80%_85%,rgba(18,184,119,0.18),transparent_60%)]" />
      <div className="wax-pattern pointer-events-none absolute inset-0 opacity-15" />

      <div className="animate-pop relative w-full max-w-md">
        <Link href="/" className="mb-7 flex items-center gap-3">
          <LogoMark className="h-11 w-11" />
          <span>
            <span className="block font-display text-lg uppercase leading-none text-cream">
              Maniguade<span className="text-mango-500">baby</span>
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.26em] text-cream-mute">
              Compte fan · Gratuit
            </span>
          </span>
        </Link>

        <div className="rounded-3xl border border-white/12 bg-ink-900/85 p-7 shadow-[0_40px_120px_-40px_rgba(0,0,0,1)] backdrop-blur-xl">
          <div className="flex rounded-full border border-white/12 p-1">
            {(["login", "register"] as Mode[]).map((value) => (
              <button
                key={value}
                onClick={() => {
                  setMode(value);
                  setError(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] transition ${
                  mode === value ? "bg-mango-500 text-ink-950" : "text-cream-dim hover:text-cream"
                }`}
              >
                {value === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <h1 className="mt-6 font-display text-3xl uppercase leading-none text-cream">
            {mode === "login" ? "Bon retour" : "Rejoins le mouvement"}
          </h1>
          <p className="mt-2 text-sm text-cream-dim">
            {mode === "login"
              ? "Connectez-vous pour retrouver vos favoris sur tous vos appareils."
              : "Créez votre compte fan : favoris synchronisés, historique d'écoute et accès aux avant-premières."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="displayName" className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                    Pseudo
                  </label>
                  <input
                    id="displayName"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none transition focus:border-mango-500/70"
                    placeholder="Kouassi"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                    Ville
                  </label>
                  <input
                    id="city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none transition focus:border-mango-500/70"
                    placeholder="Abidjan"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fan-email" className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                Email
              </label>
              <input
                id="fan-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none transition focus:border-mango-500/70"
                placeholder="vous@email.ci"
              />
            </div>

            <div>
              <label htmlFor="fan-password" className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                Mot de passe
              </label>
              <input
                id="fan-password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none transition focus:border-mango-500/70"
                placeholder="6 caractères minimum"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-mango-500/40 bg-mango-500/10 px-4 py-3 text-sm text-mango-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-mango-400 to-mango-600 px-5 py-3.5 font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
              {!loading && <ArrowRightIcon width={16} height={16} />}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-baobab-500/30 bg-baobab-500/8 px-4 py-3 text-[12px] text-cream-dim">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-baobab-400">
              <SparkIcon width={12} height={12} /> Compte de démonstration
            </p>
            <p className="mt-1.5">
              {demo.email} ·{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setEmail(demo.email);
                  setPassword(demo.password);
                }}
                className="font-semibold text-baobab-400 underline decoration-dotted"
              >
                remplir le formulaire
              </button>
            </p>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[12px] text-cream-mute">
          <UserIcon width={13} height={13} />
          Vous êtes l'équipe ?{" "}
          <Link href="/admin/login" className="underline decoration-dotted transition hover:text-mango-400">
            Back-office administrateur
          </Link>
        </p>
      </div>
    </div>
  );
}
