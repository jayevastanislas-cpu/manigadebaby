"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon, SparkIcon } from "@/components/icons";
import { useFavorites } from "@/components/favorites-provider";
import { formatCompactNumber } from "@/lib/format";

/* Intitulés de navigation conformes à la maquette Maniguadebaby */
export const NAV_ITEMS = [
  { href: "/", label: "Accueil" },
  { href: "/artistes", label: "Artistes" },
  { href: "/morceaux", label: "Musique" },
  { href: "/videos", label: "Vidéos" },
  { href: "/actualites", label: "Fil d'Actualité" },
  { href: "/decouverte", label: "Guide Culturel" },
  { href: "/contact", label: "Booking" },
  { href: "/magazine", label: "Magazine" },
  { href: "/contact#contact", label: "Contact" },
];

type QuickResults = {
  tracks: { id: string; title: string; slug: string; coverUrl: string; artistName: string; artistSlug: string }[];
  artists: { id: string; name: string; slug: string; coverUrl: string; followers: number }[];
  articles: { id: string; title: string; slug: string; category: string }[];
};

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<QuickResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTerm("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults({
            tracks: (data.tracks ?? []).map((t: Record<string, unknown>) => ({
              id: t.id as string,
              title: t.title as string,
              slug: t.slug as string,
              coverUrl: t.coverUrl as string,
              artistName: t.artistName as string,
              artistSlug: t.artistSlug as string,
            })),
            artists: (data.artists ?? []).map((a: Record<string, unknown>) => ({
              id: a.id as string,
              name: a.name as string,
              slug: a.slug as string,
              coverUrl: a.coverUrl as string,
              followers: a.followers as number,
            })),
            articles: (data.articles ?? []).map((a: Record<string, unknown>) => ({
              id: a.id as string,
              title: a.title as string,
              slug: a.slug as string,
              category: a.category as string,
            })),
          });
        }
      } catch {
        /* silencieux */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [term]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm" onClick={onClose} aria-label="Fermer la recherche" />
      <div className="animate-pop relative w-full max-w-2xl overflow-hidden rounded-2xl border border-mango-500/20 bg-ink-900 shadow-[0_40px_120px_-30px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <SearchIcon width={18} height={18} className="text-mango-400" />
          <input
            ref={inputRef}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Un artiste, un titre, un article…"
            className="flex-1 bg-transparent font-heading text-base text-cream outline-none placeholder:text-cream-mute"
          />
          <kbd className="hidden rounded border border-white/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-cream-mute sm:block">
            échap
          </kbd>
        </div>
        <div className="hide-scrollbar max-h-[52vh] overflow-y-auto">
          {term.trim().length < 2 && (
            <div className="px-5 py-8 text-center">
              <p className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-cream-mute">Recherche instantanée</p>
              <p className="mt-2 text-[13px] text-cream-mute/80">
                Tapez au moins deux lettres : titres, artistes, albums, clips et articles.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Mbalax", "Mandingue", "Coupé-Décalé", "Teranga"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTerm(s)}
                    className="rounded-full border border-white/12 px-3 py-1 text-xs text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {loading && <p className="px-5 py-6 text-sm text-cream-mute">Recherche en cours…</p>}
          {!loading && results && (
            <div className="divide-y divide-white/5">
              {results.artists.length > 0 && (
                <section className="p-2">
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cream-mute">Artistes</p>
                  {results.artists.map((artist) => (
                    <Link key={artist.id} href={`/artistes/${artist.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={artist.coverUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-heading text-sm font-bold text-cream">{artist.name}</span>
                        <span className="block text-[11px] text-cream-mute">{formatCompactNumber(artist.followers)} abonnés</span>
                      </span>
                    </Link>
                  ))}
                </section>
              )}
              {results.tracks.length > 0 && (
                <section className="p-2">
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cream-mute">Morceaux</p>
                  {results.tracks.map((track) => (
                    <Link key={track.id} href={`/morceaux/${track.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={track.coverUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-heading text-sm font-bold text-cream">{track.title}</span>
                        <span className="block truncate text-[11px] text-cream-mute">{track.artistName}</span>
                      </span>
                    </Link>
                  ))}
                </section>
              )}
              {results.articles.length > 0 && (
                <section className="p-2">
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cream-mute">Actualités</p>
                  {results.articles.map((article) => (
                    <Link key={article.id} href={`/actualites/${article.slug}`} onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-white/5">
                      <span className="rounded bg-mango-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-mango-400">
                        {article.category}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-cream">{article.title}</span>
                    </Link>
                  ))}
                </section>
              )}
              {results.tracks.length === 0 && results.artists.length === 0 && results.articles.length === 0 && (
                <p className="px-5 py-8 text-center text-sm text-cream-mute">
                  Aucun résultat pour « {term} ». Essayez « mbalax », « kora » ou « Dakar ».
                </p>
              )}
              <Link
                href={`/recherche?q=${encodeURIComponent(term)}`}
                onClick={onClose}
                className="flex items-center justify-between px-5 py-3 text-xs font-bold uppercase tracking-widest text-mango-400 transition hover:bg-white/5"
              >
                Voir tous les résultats
                <SearchIcon width={15} height={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [profile, setProfile] = useState<{ displayName: string } | null>(null);
  const { count } = useFavorites();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, window.scrollY / height) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/fan", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as { profile?: { displayName: string } | null };
        if (!cancelled && data.profile) setProfile(data.profile);
      } catch {
        /* anonyme */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-all duration-500 ${
          scrolled ? "border-b border-mango-500/15 bg-ink-950/92 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1560px] items-center gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <svg viewBox="0 0 120 140" className="h-9 w-9 transition-transform duration-500 group-hover:-rotate-3" aria-hidden="true">
              <defs>
                <linearGradient id="mgbGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFE9B3" />
                  <stop offset="45%" stopColor="#F2B705" />
                  <stop offset="100%" stopColor="#C9930A" />
                </linearGradient>
              </defs>
              <g stroke="url(#mgbGold)" strokeWidth="3" strokeLinecap="round">
                <path d="M60 44 10 32M60 44 20 26M60 44 32 20M60 44 44 15M60 44 58 12M60 44 72 15M60 44 86 20M60 44 100 26M60 44 110 32" />
              </g>
              <rect x="52" y="40" width="16" height="16" rx="5" fill="url(#mgbGold)" />
              <ellipse cx="60" cy="92" rx="34" ry="34" fill="url(#mgbGold)" />
              <ellipse cx="48" cy="80" rx="12" ry="8" fill="#FFF3D2" opacity="0.45" />
            </svg>
            <span>
              <span className="block font-display text-[15px] font-extrabold uppercase leading-none tracking-[0.08em] text-mango-400 md:text-[17px]">
                Maniguadebaby
              </span>
              <span className="mt-1 block text-[8.5px] font-bold uppercase tracking-[0.28em] text-cream-mute">
                Musique d&apos;Afrique de l&apos;Ouest
              </span>
            </span>
          </Link>

          <nav className="ml-3 hidden items-center gap-0.5 2xl:flex">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("#")[0]);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative rounded-full px-2.5 py-2 text-[12.5px] font-semibold transition ${
                    active ? "text-mango-400" : "text-cream-dim hover:text-mango-300"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-mango-500 transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full p-2 text-cream-dim transition hover:text-mango-400"
              aria-label="Ouvrir la recherche"
            >
              <SearchIcon width={18} height={18} />
            </button>
            <Link
              href="/favoris"
              className="relative rounded-full p-2 text-cream-dim transition hover:text-mango-400"
              aria-label="Mes favoris"
            >
              <HeartIcon width={18} height={18} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mango-500 px-1 text-[10px] font-bold text-ink-950">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href={profile ? "/compte" : "/connexion"}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-[12.5px] font-semibold text-cream transition hover:text-mango-400"
            >
              <UserIcon width={16} height={16} />
              <span className="hidden lg:block">{profile ? profile.displayName.split(" ")[0] : "Connexion"}</span>
            </Link>
            <Link
              href="/espace-artiste"
              className="hidden items-center gap-2 rounded-full border border-mango-500/70 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-mango-400 transition hover:bg-mango-500 hover:text-ink-950 md:flex"
            >
              <SparkIcon width={13} height={13} />
              Espace Artiste
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2 text-cream-dim transition hover:text-cream 2xl:hidden"
              aria-label="Ouvrir le menu"
            >
              <MenuIcon width={20} height={20} />
            </button>
          </div>
        </div>
        <div className="h-[2px] w-full bg-transparent">
          <div
            className="h-full bg-gradient-to-r from-mango-500 via-gold-300 to-mango-600 transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      {menuOpen && (
        <div className="fixed inset-0 z-[75] 2xl:hidden">
          <button className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" />
          <nav className="animate-pop relative ml-auto flex h-full w-[min(380px,88vw)] flex-col gap-1 overflow-y-auto border-l border-mango-500/20 bg-ink-900 px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-extrabold uppercase tracking-[0.12em] text-mango-400">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="rounded-full border border-white/12 p-2 text-cream-dim" aria-label="Fermer">
                <CloseIcon width={16} height={16} />
              </button>
            </div>
            {NAV_ITEMS.map((item, index) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("#")[0]);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className={`animate-pop flex items-center justify-between rounded-xl border px-4 py-3 font-heading text-base font-bold transition ${
                    active ? "border-mango-500/50 bg-mango-500/12 text-mango-400" : "border-white/8 text-cream hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                  <span className="font-display text-xs text-cream-mute">{String(index + 1).padStart(2, "0")}</span>
                </Link>
              );
            })}
            <Link
              href="/espace-artiste"
              className="mt-3 rounded-xl border border-mango-500/60 px-4 py-3 text-center font-heading text-sm font-bold uppercase tracking-widest text-mango-400 transition hover:bg-mango-500/10"
            >
              Espace Artiste
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-white/12 px-4 py-3 text-center font-heading text-sm font-bold uppercase tracking-widest text-cream-dim transition hover:border-white/25"
            >
              Administration
            </Link>
            <div className="mt-auto pt-6 text-[11px] uppercase tracking-[0.2em] text-cream-mute">
              Maniguadebaby · Sénégal · Mali · Côte d&apos;Ivoire · Guinée
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
