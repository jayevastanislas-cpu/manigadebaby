"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRightIcon, HeartIcon, LogoutIcon, SparkIcon, UserIcon } from "@/components/icons";

type Profile = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  city: string;
  avatarUrl?: string;
  bio?: string;
};

type Stats = { favorites: number; plays: number; minutes: number };

export function AccountPanel({
  profile,
  stats,
  favoritesSection,
  historySection,
}: {
  profile: Profile;
  stats: Stats;
  favoritesSection: ReactNode;
  historySection: ReactNode;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"favorites" | "history" | "settings">("favorites");
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [city, setCity] = useState(profile.city);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: "ok" | "error" } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = profile.displayName
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/fan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, city, bio, avatarUrl }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage({ text: data.error ?? "Enregistrement impossible.", kind: "error" });
      } else {
        setMessage({ text: "Profil mis à jour.", kind: "ok" });
        router.refresh();
      }
    } catch {
      setMessage({ text: "Erreur réseau.", kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/fan", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  const tabs = [
    { key: "favorites" as const, label: "Favoris", count: stats.favorites },
    { key: "history" as const, label: "Historique", count: stats.plays },
    { key: "settings" as const, label: "Paramètres", count: null },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-12 md:px-6 md:py-16">
      <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-ink-900/70 p-6 md:flex-row md:items-center md:p-8">
        <div className="relative shrink-0">
          <div className="absolute -inset-2 rounded-full bg-mango-600/25 blur-2xl" />
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="relative h-20 w-20 rounded-full object-cover ring-2 ring-white/15" />
          ) : (
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-mango-400 to-gold-400 font-display text-2xl text-ink-950 ring-2 ring-white/15">
              {initials || <UserIcon width={26} height={26} />}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em] text-mango-400">
            <SparkIcon width={13} height={13} /> Compte {profile.role === "admin" ? "administrateur" : "fan"}
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,4.6vw,3rem)] uppercase leading-none text-cream">
            {profile.displayName}
          </h1>
          <p className="mt-2 text-sm text-cream-dim">
            {profile.email}
            {profile.city ? ` · ${profile.city}` : ""} · Côte d'Ivoire
          </p>
          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
            {[
              { label: "Favoris", value: stats.favorites, Icon: HeartIcon },
              { label: "Écoutes", value: stats.plays, Icon: SparkIcon },
              { label: "Minutes écoutées", value: stats.minutes, Icon: UserIcon },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.Icon width={15} height={15} className="text-mango-500" />
                <span className="font-display text-xl leading-none text-cream">{stat.value}</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-cream-mute">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Link
            href="/favoris"
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
          >
            Bibliothèque complète <ArrowUpRightIcon width={14} height={14} />
          </Link>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400 disabled:opacity-60"
          >
            <LogoutIcon width={14} height={14} /> {loggingOut ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </header>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-heading text-[12px] font-bold uppercase tracking-[0.14em] transition ${
              tab === item.key ? "bg-mango-500/15 text-mango-400 ring-1 ring-mango-500/40" : "text-cream-dim hover:text-cream"
            }`}
          >
            {item.label}
            {item.count !== null && <span className="text-[11px] text-cream-mute">{item.count}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "favorites" && favoritesSection}
        {tab === "history" && historySection}
        {tab === "settings" && (
          <form onSubmit={saveSettings} className="max-w-2xl rounded-3xl border border-white/10 bg-ink-900/60 p-6 md:p-8">
            <h2 className="font-heading text-xl font-extrabold text-cream">Mon profil</h2>
            <p className="mt-1 text-sm text-cream-dim">Ces informations sont visibles uniquement par vous.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="displayName" className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                  Pseudo
                </label>
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/70"
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
                  className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/70"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="avatarUrl" className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                  Photo (URL)
                </label>
                <input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://…"
                  className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none focus:border-mango-500/70"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bio" className="text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute">
                  Bio courte
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm leading-relaxed text-cream outline-none focus:border-mango-500/70"
                />
              </div>
            </div>

            {message && (
              <p
                className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                  message.kind === "ok"
                    ? "border-baobab-500/40 bg-baobab-500/10 text-baobab-400"
                    : "border-mango-500/40 bg-mango-500/10 text-mango-400"
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.02] disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <p className="text-[12px] text-cream-mute">
                Version 2 : rattachement d'un numéro Mobile Money pour les abonnements Premium.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
