"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark, ArrowRightIcon, InstagramIcon, TiktokIcon, YoutubeIcon, SparkIcon } from "@/components/icons";

const COLUMNS = [
  {
    title: "Plateforme",
    links: [
      { href: "/decouverte", label: "Découverte & genres" },
      { href: "/morceaux", label: "Tous les morceaux" },
      { href: "/albums", label: "Albums & EP" },
      { href: "/videos", label: "Clips vidéo" },
      { href: "/playlists", label: "Playlists de la rédaction" },
      { href: "/magazine", label: "Magazine culturel" },
      { href: "/contact", label: "Booking & contact" },
    ],
  },
  {
    title: "Le projet",
    links: [
      { href: "/espace-artiste", label: "Espace Artiste" },
      { href: "/importer", label: "Importer vos designs" },
      { href: "/projet", label: "Architecture & base de données" },
      { href: "/projet#script", label: "Script SQL complet" },
      { href: "/connexion", label: "Créer un compte fan" },
      { href: "/compte", label: "Mon compte" },
      { href: "/admin", label: "Back-office" },
    ],
  },
  {
    title: "Artistes",
    links: [
      { href: "/artistes", label: "Annuaire des artistes" },
      { href: "/artistes/aya-koffi", label: "Aya Koffi" },
      { href: "/artistes/dj-kalou-star", label: "DJ Kalou Star" },
      { href: "/artistes/safi-diomande", label: "Safi Diomandé" },
      { href: "/recherche", label: "Recherche globale" },
    ],
  },
  {
    title: "Rédaction",
    links: [
      { href: "/actualites", label: "Toutes les actualités" },
      { href: "/actualites?categorie=Tops+%26+Charts", label: "Tops & charts" },
      { href: "/actualites?categorie=Interview", label: "Interviews" },
      { href: "/actualites?categorie=Industrie", label: "Industrie musicale" },
      { href: "/recherche", label: "Recherche globale" },
    ],
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-ink-900">
      <div className="wax-pattern pointer-events-none absolute inset-0 opacity-[0.18]" />
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-mango-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-baobab-500/12 blur-[120px]" />

      <div className="relative mx-auto max-w-[1500px] px-4 py-16 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-12 w-12" />
              <span>
                <span className="block font-display text-2xl uppercase leading-none text-cream">
                  Maniguade<span className="text-mango-500">baby</span>
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.3em] text-cream-mute">
                  Streaming · Abidjan 225
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-dim">
              La référence de la musique d'Afrique de l'Ouest : Mandingue, Mbalax, Zouglou, Coupé-Décalé, Highlife
              & Afro Trap — réunis au même endroit, avec un lecteur qui ne s'arrête jamais.
            </p>

            <form onSubmit={submit} className="mt-7 max-w-sm">
              <label htmlFor="newsletter-email" className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-cream">
                La sélection du vendredi
              </label>
              <p className="mt-1 text-[12px] text-cream-mute">
                Nouveautés, tops et sorties de clips, une fois par semaine. Zéro spam.
              </p>
              <div className="mt-3 flex overflow-hidden rounded-full border border-white/15 bg-ink-950/60 focus-within:border-mango-500/70">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setState("idle");
                  }}
                  placeholder="votre@email.ci"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-cream outline-none placeholder:text-cream-mute/70"
                />
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="flex items-center gap-2 bg-gradient-to-br from-mango-400 to-mango-600 px-5 text-[12px] font-bold uppercase tracking-wider text-ink-950 transition hover:brightness-110 disabled:opacity-60"
                >
                  {state === "done" ? "Inscrit ✓" : "S'inscrire"}
                  {state !== "done" && <ArrowRightIcon width={15} height={15} />}
                </button>
              </div>
              {state === "done" && (
                <p className="mt-2 text-[12px] text-baobab-400">Merci ! Vous recevrez la prochaine sélection.</p>
              )}
              {state === "error" && (
                <p className="mt-2 text-[12px] text-mango-400">Adresse invalide ou serveur indisponible, réessayez.</p>
              )}
            </form>

            <div className="mt-7 flex items-center gap-3">
              {[
                { Icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
                { Icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com" },
                { Icon: TiktokIcon, label: "TikTok", href: "https://tiktok.com" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-cream-dim transition hover:-translate-y-0.5 hover:border-mango-500/60 hover:text-mango-400"
                  aria-label={label}
                >
                  <Icon width={17} height={17} />
                </a>
              ))}
              <Link
                href="/admin"
                className="ml-2 flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-cream-dim transition hover:border-baobab-500/60 hover:text-baobab-400"
              >
                <SparkIcon width={13} height={13} /> Administration
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="font-heading text-xs font-bold uppercase tracking-[0.24em] text-mango-400">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="group flex items-start gap-2 text-[13px] text-cream-dim transition hover:text-cream"
                      >
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-mango-500/60 transition-all group-hover:w-3" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-cream-mute md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Maniguadebaby — La référence de la musique d&apos;Afrique de l&apos;Ouest. Tous droits réservés.</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Dakar · Bamako · Abidjan · Conakry 🌍</span>
            <span className="hidden h-1 w-1 rounded-full bg-cream-mute/50 md:block" />
            <span>Prochaine étape : Espace Artiste & Mobile Money (V2)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
