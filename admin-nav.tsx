"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark, ArrowUpRightIcon, DashboardIcon, DiscIcon, LogoutIcon } from "@/components/icons";
import { ENTITY_CONFIGS, ENTITY_KEYS } from "@/lib/admin-config";

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-ink-900/80 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <LogoMark className="h-10 w-10" />
        <span>
          <span className="block font-display text-base uppercase leading-none text-cream">
            Maniguade<span className="text-mango-500">baby</span>
          </span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-baobab-400">
            Back-office V1
          </span>
        </span>
      </Link>

      <nav className="hide-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <Link
          href="/admin"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold transition ${
            pathname === "/admin" ? "bg-mango-500/15 text-mango-400" : "text-cream-dim hover:bg-white/5 hover:text-cream"
          }`}
        >
          <DashboardIcon width={17} height={17} /> Tableau de bord
        </Link>

        <Link
          href="/admin/publier"
          className={`mt-4 flex items-center gap-3 rounded-xl border px-3 py-2.5 font-heading text-sm font-bold transition ${
            pathname === "/admin/publier"
              ? "border-mango-500 bg-mango-500/15 text-mango-400"
              : "border-mango-500/30 text-mango-400 hover:bg-mango-500/10"
          }`}
        >
          <DiscIcon width={17} height={17} /> Publier un morceau
        </Link>

        <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-cream-mute">Contenus</p>
        <ul className="mt-2 space-y-1">
          {ENTITY_KEYS.map((key) => {
            const config = ENTITY_CONFIGS[key];
            const active = pathname === `/admin/${key}`;
            return (
              <li key={key}>
                <Link
                  href={`/admin/${key}`}
                  className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 font-heading text-sm font-semibold transition ${
                    active ? "bg-mango-500/15 text-mango-400" : "text-cream-dim hover:bg-white/5 hover:text-cream"
                  }`}
                >
                  {config.labelPlural}
                  <span className={`text-[10px] uppercase tracking-widest ${active ? "text-mango-500" : "text-cream-mute"}`}>
                    {config.key}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-cream-mute">Site public</p>
        <ul className="mt-2 space-y-1">
          {[
            { href: "/", label: "Accueil" },
            { href: "/decouverte", label: "Découverte" },
            { href: "/actualites", label: "Actualités" },
          ].map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 font-heading text-sm font-semibold text-cream-dim transition hover:bg-white/5 hover:text-cream"
              >
                {item.label}
                <ArrowUpRightIcon width={14} height={14} />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate font-heading text-sm font-bold text-cream">{userName}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-cream-mute">Administrateur</p>
        <button
          onClick={logout}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400 disabled:opacity-50"
        >
          <LogoutIcon width={15} height={15} />
          {busy ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </div>
    </aside>
  );
}
