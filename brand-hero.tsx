"use client";

import Link from "next/link";
import { usePlayer } from "@/components/player/player-provider";
import { EqualizerBars, PauseIcon, PlayIcon, VideoIcon, UserIcon, MicIcon } from "@/components/icons";
import type { GenreDTO, TrackDTO } from "@/lib/types";

export function LogoCalabash({ className = "h-28 w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="calabashGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF2CF" />
          <stop offset="38%" stopColor="#F5C542" />
          <stop offset="72%" stopColor="#E0A100" />
          <stop offset="100%" stopColor="#B9820B" />
        </linearGradient>
        <radialGradient id="calabashShine" cx="0.34" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FFF8E2" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFF8E2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cordes en éventail */}
      <g stroke="url(#calabashGold)" strokeWidth="2.6" strokeLinecap="round" opacity="0.95">
        <path d="M60 46 8 33M60 46 19 26M60 46 31 20M60 46 43 15M60 46 55 12M60 46 67 12M60 46 79 15M60 46 91 20M60 46 103 26M60 46 112 33" />
      </g>

      {/* Col */}
      <rect x="51" y="41" width="18" height="17" rx="6" fill="url(#calabashGold)" />

      {/* Corps */}
      <ellipse cx="60" cy="93" rx="35" ry="35" fill="url(#calabashGold)" />
      <ellipse cx="60" cy="93" rx="35" ry="35" fill="url(#calabashShine)" />
      <path d="M25 93c0-6 15-11 35-11s35 5 35 11" fill="none" stroke="#8C6408" strokeOpacity="0.35" strokeWidth="1.6" />
      <ellipse cx="46" cy="80" rx="11" ry="7" fill="#FFF8E2" opacity="0.5" />
    </svg>
  );
}

function GoldButton({
  href,
  onClick,
  children,
  icon,
  variant = "solid",
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "solid" | "outline" | "dark";
}) {
  const styles =
    variant === "solid"
      ? "bg-gradient-to-b from-[#FFE9B3] via-[#F2B705] to-[#D99B00] text-[#241900] shadow-[0_16px_44px_-16px_rgba(242,183,5,0.85)] hover:brightness-110"
      : variant === "outline"
        ? "border border-mango-500/60 text-mango-400 hover:bg-mango-500/12"
        : "border border-white/15 bg-white/[0.04] text-cream hover:border-white/35";
  const className = `group flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${styles}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={className}>
      {icon}
      {children}
    </button>
  );
}

export function BrandHero({ track, genres }: { track: TrackDTO | null; genres: GenreDTO[] }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const isCurrent = track && currentTrack?.id === track.id;
  const playing = Boolean(isCurrent && isPlaying);

  return (
    <section className="relative isolate overflow-hidden">
      {/* Fond : noir chaud + halo doré */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(75%_55%_at_50%_28%,rgba(242,183,5,0.22)_0%,rgba(242,183,5,0.06)_38%,transparent_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#120D06_0%,#0B0906_62%,#0B0906_100%)]" />
        <div className="absolute inset-0 grain opacity-50" />
        <div className="wax-pattern absolute inset-0 opacity-[0.10]" />
      </div>

      <div className="mx-auto flex max-w-[1100px] flex-col items-center px-4 pb-16 pt-16 text-center md:pt-20">
        {/* Marque */}
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-mango-500/25 blur-3xl animate-pulse-glow" />
          <LogoCalabash className="relative h-28 w-28 animate-float drop-shadow-[0_18px_40px_rgba(242,183,5,0.35)] md:h-36 md:w-36" />
        </div>

        {/* Mot-symbole */}
        <h1 className="mt-8 font-display text-[clamp(2.4rem,9vw,6.4rem)] font-extrabold uppercase leading-[0.92] tracking-[0.02em]">
          <span className="gold-text">Maniguadebaby</span>
        </h1>

        <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-cream md:text-xl">
          La référence de la musique d&apos;Afrique de l&apos;Ouest —{" "}
          <span className="text-mango-400">Mandingue, Mbalax, Zouglou, Coupé-Décalé, Highlife &amp; Afro Trap.</span>
        </p>

        {/* Pills genres officiels */}
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {genres.map((genre) => (
            <li key={genre.id}>
              <Link
                href={`/decouverte?genre=${genre.slug}`}
                className="rounded-full border border-mango-500/40 bg-mango-500/[0.07] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-mango-400 transition hover:-translate-y-0.5 hover:border-mango-500 hover:bg-mango-500/15"
              >
                {genre.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Citation */}
        <p className="mt-8 max-w-2xl text-[15px] italic leading-relaxed text-cream-dim md:text-[17px]">
          « La vitrine mondiale des artistes d&apos;Afrique de l&apos;Ouest — Sénégal, Mali, Côte d&apos;Ivoire, Guinée et
          au-delà. »
        </p>

        {/* Actions */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <GoldButton href="/artistes" icon={<MicIcon width={15} height={15} />}>
            Découvrir les artistes
          </GoldButton>
          <GoldButton
            onClick={() => (isCurrent ? togglePlay() : track && playTrack(track))}
            icon={playing ? <PauseIcon width={15} height={15} /> : <PlayIcon width={15} height={15} />}
          >
            {playing ? "En pause" : "Écouter maintenant"}
          </GoldButton>
          <GoldButton href="/videos" variant="outline" icon={<VideoIcon width={15} height={15} />}>
            Regarder
          </GoldButton>
          <GoldButton href="/connexion" variant="dark" icon={<UserIcon width={15} height={15} />}>
            Rejoindre
          </GoldButton>
        </div>

        {/* Ligne d'invitation à la lecture */}
        <div className="mt-12 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-cream-mute">
          <EqualizerBars playing={playing} className="text-mango-500" />
          Sélectionnez un morceau pour commencer l&apos;écoute
          <EqualizerBars playing={playing} className="text-mango-500" />
        </div>

        {track && (
          <p className="mt-3 text-[12px] text-cream-mute/80">
            En vedette :{" "}
            <Link href={`/morceaux/${track.slug}`} className="font-semibold text-mango-400 hover:underline">
              {track.title}
            </Link>{" "}
            — {track.artistName} · {track.genreName}
          </p>
        )}
      </div>
    </section>
  );
}
