"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePlayer } from "@/components/player/player-provider";
import { useFavorites } from "@/components/favorites-provider";
import {
  ArrowUpRightIcon,
  DiscIcon,
  EqualizerBars,
  FlameIcon,
  HeartIcon,
  MapPinIcon,
  MicIcon,
  NewsIcon,
  PauseIcon,
  PlayIcon,
  QueueIcon,
  SparkIcon,
  VerifiedIcon,
  VideoIcon,
} from "@/components/icons";
import { formatCompactNumber, formatDate, formatDuration } from "@/lib/format";
import type { AlbumDTO, ArticleDTO, ArtistDTO, GenreDTO, PlaylistDTO, TrackDTO, VideoDTO } from "@/lib/types";

/* ------------------------------- Cover image ------------------------------- */

export function Cover({
  src,
  alt,
  className = "",
  fallback = "🎵",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-ink-800 text-2xl ${className}`} aria-hidden="true">
        {fallback}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />
  );
}

/* --------------------------------- Boutons ---------------------------------- */

export function PlayButton({
  track,
  queue,
  size = "md",
  label,
  className = "",
}: {
  track: TrackDTO;
  queue?: TrackDTO[];
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const isCurrent = currentTrack?.id === track.id;
  const active = isCurrent && isPlaying;
  const dims = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-11 w-11";

  return (
    <button
      onClick={() => (isCurrent ? togglePlay() : playTrack(track, queue))}
      className={`group/play flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-mango-400 to-mango-600 text-ink-950 shadow-[0_12px_34px_-12px_rgba(255,106,26,0.95)] transition hover:scale-105 active:scale-95 ${dims} ${
        label ? "w-auto px-5" : ""
      } ${className}`}
      aria-label={active ? `Mettre ${track.title} en pause` : `Écouter ${track.title}`}
    >
      {active ? <PauseIcon width={size === "lg" ? 20 : 16} height={size === "lg" ? 20 : 16} /> : <PlayIcon width={size === "lg" ? 20 : 16} height={size === "lg" ? 20 : 16} className={label ? "" : "ml-[2px]"} />}
      {label && <span className="font-heading text-sm font-bold uppercase tracking-wider">{label}</span>}
    </button>
  );
}

export function PlayAllButton({
  tracks,
  label = "Tout lire",
  variant = "solid",
  className = "",
}: {
  tracks: TrackDTO[];
  label?: string;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const { playQueue } = usePlayer();
  if (tracks.length === 0) return null;
  const styles =
    variant === "solid"
      ? "bg-gradient-to-br from-mango-400 to-mango-600 text-ink-950 hover:scale-[1.03] shadow-[0_14px_36px_-14px_rgba(255,106,26,0.9)]"
      : "border border-white/20 text-cream hover:border-mango-500/60 hover:text-mango-400";
  return (
    <button
      onClick={() => playQueue(tracks, 0)}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.16em] transition active:scale-95 ${styles} ${className}`}
    >
      <PlayIcon width={14} height={14} />
      {label}
    </button>
  );
}

export function FavoriteButton({
  itemType,
  itemId,
  className = "",
  size = 18,
}: {
  itemType: string;
  itemId: string;
  className?: string;
  size?: number;
}) {
  const { isFavorite, toggleFavorite, pending } = useFavorites();
  const liked = isFavorite(itemType, itemId);
  const busy = pending === `${itemType}:${itemId}`;
  return (
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleFavorite(itemType, itemId);
      }}
      className={`rounded-full p-2 transition hover:bg-white/10 active:scale-90 ${
        liked ? "text-mango-500" : "text-cream-mute hover:text-cream"
      } ${busy ? "opacity-50" : ""} ${className}`}
      aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={liked}
    >
      <HeartIcon filled={liked} width={size} height={size} />
    </button>
  );
}

/* ------------------------------ Ligne de morceau ----------------------------- */

export function TrackRow({
  track,
  index,
  queue,
  showAlbum = true,
}: {
  track: TrackDTO;
  index: number;
  queue: TrackDTO[];
  showAlbum?: boolean;
}) {
  const { currentTrack, isPlaying, enqueue, playTrack, togglePlay } = usePlayer();
  const isCurrent = currentTrack?.id === track.id;
  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
      return;
    }
    playTrack(track, queue);
  };

  return (
    <li
      className={`group relative grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-xl px-2 py-2 transition-colors md:grid-cols-[36px_56px_minmax(0,2.4fr)_minmax(0,1.4fr)_auto_auto] md:gap-4 md:px-3 ${
        isCurrent ? "bg-mango-500/12" : "hover:bg-white/[0.055]"
      }`}
    >
      <span className="hidden text-right font-display text-lg text-cream-mute transition group-hover:text-transparent md:block">
        <span className={isCurrent ? "text-mango-500" : ""}>{String(index + 1).padStart(2, "0")}</span>
        <span className="absolute left-3 hidden text-cream group-hover:block">
          {isCurrent && isPlaying ? (
            <EqualizerBars playing className="text-mango-500" />
          ) : (
            <button onClick={handlePlay} aria-label={`Écouter ${track.title}`}>
              {isCurrent ? <PauseIcon width={14} height={14} /> : <PlayIcon width={13} height={13} />}
            </button>
          )}
        </span>
      </span>

      <button
        onClick={handlePlay}
        className="relative block md:hidden"
        aria-label={`Écouter ${track.title}`}
      >
        <Cover src={track.coverUrl} alt="" className="h-11 w-11 rounded-lg" />
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-ink-950/60 opacity-0 transition group-hover:opacity-100">
          <PlayIcon width={14} height={14} className="text-cream" />
        </span>
      </button>

      <span className="hidden md:block">
        <Cover src={track.coverUrl} alt={`Pochette de ${track.title}`} className="h-11 w-11 rounded-lg" />
      </span>

      <span className="min-w-0">
        <button
          onClick={handlePlay}
          className={`block w-full truncate text-left font-heading text-[15px] font-bold transition ${
            isCurrent ? "text-mango-400" : "text-cream group-hover:text-mango-200"
          }`}
        >
          {track.title}
          {track.explicit && (
            <span className="ml-2 rounded bg-white/15 px-1 py-px align-middle text-[9px] font-bold uppercase tracking-wider text-cream-dim">
              E
            </span>
          )}
        </button>
        <Link
          href={`/artistes/${track.artistSlug}`}
          className="block truncate text-[13px] text-cream-mute transition hover:text-cream"
        >
          {track.artistName}
        </Link>
      </span>

      {showAlbum && (
        <span className="hidden min-w-0 md:block">
          {track.albumSlug ? (
            <Link href={`/albums/${track.albumSlug}`} className="block truncate text-[13px] text-cream-mute transition hover:text-cream">
              {track.albumTitle}
            </Link>
          ) : (
            <span className="text-[13px] text-cream-mute/60">Single</span>
          )}
          {track.genreSlug && (
            <Link href={`/decouverte?genre=${track.genreSlug}`} className="mt-0.5 inline-block text-[11px] uppercase tracking-wider text-baobab-400/80 hover:text-baobab-400">
              {track.genreName}
            </Link>
          )}
        </span>
      )}

      <span className="hidden items-center gap-1.5 text-[12px] text-cream-mute lg:flex">
        <SparkIcon width={13} height={13} />
        {formatCompactNumber(track.plays)}
      </span>

      <span className="flex items-center gap-1">
        <button
          onClick={(event) => {
            event.preventDefault();
            enqueue(track);
          }}
          className="hidden rounded-full p-2 text-cream-mute opacity-0 transition hover:bg-white/10 hover:text-cream group-hover:opacity-100 md:block"
          aria-label={`Ajouter ${track.title} à la file`}
        >
          <QueueIcon width={16} height={16} />
        </button>
        <FavoriteButton itemType="track" itemId={track.id} size={16} className="opacity-70 group-hover:opacity-100" />
        <span className="w-11 text-right text-[12px] tabular-nums text-cream-mute">
          {formatDuration(track.durationSeconds)}
        </span>
      </span>
    </li>
  );
}



/* --------------------------------- Cartes ----------------------------------- */

export function TrackCard({ track, queue }: { track: TrackDTO; queue: TrackDTO[] }) {
  const { currentTrack, isPlaying } = usePlayer();
  const isCurrent = currentTrack?.id === track.id;
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/70 p-3 transition duration-500 hover:-translate-y-1.5 hover:border-mango-500/40 hover:bg-ink-850">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Cover
          src={track.coverUrl}
          alt={`Pochette de ${track.title}`}
          className="h-full w-full transition-transform duration-[900ms] group-hover:scale-[1.08]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent opacity-70" />
        <div className="absolute bottom-2.5 right-2.5 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <PlayButton track={track} queue={queue} />
        </div>
        {track.trending && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink-950/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-mango-400 backdrop-blur">
            <FlameIcon width={11} height={11} /> Hot
          </span>
        )}
        {isCurrent && (
          <span className="absolute left-2.5 bottom-2.5 text-mango-400">
            <EqualizerBars playing={isPlaying} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-[15px] font-bold text-cream">{track.title}</h3>
          <Link href={`/artistes/${track.artistSlug}`} className="block truncate text-[13px] text-cream-mute hover:text-mango-400">
            {track.artistName}
          </Link>
        </div>
        <FavoriteButton itemType="track" itemId={track.id} size={16} />
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] uppercase tracking-wider text-cream-mute/80">
        <span>{formatCompactNumber(track.plays)} écoutes</span>
        <span className="h-1 w-1 rounded-full bg-cream-mute/50" />
        <span className="tabular-nums">{formatDuration(track.durationSeconds)}</span>
      </div>
    </article>
  );
}

export function ArtistCard({ artist }: { artist: ArtistDTO }) {
  return (
    <Link
      href={`/artistes/${artist.slug}`}
      className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-ink-900/60 p-5 text-center transition duration-500 hover:-translate-y-1.5 hover:border-white/20"
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(80% 60% at 50% 0%, ${artist.accent}33, transparent 70%)` }}
      />
      <span className="relative">
        <Cover
          src={artist.coverUrl}
          alt={artist.name}
          className="h-28 w-28 rounded-full ring-2 ring-white/10 transition-transform duration-500 group-hover:scale-105"
        />
        {artist.verified && (
          <span className="absolute bottom-1 right-1 text-baobab-400">
            <VerifiedIcon width={18} height={18} />
          </span>
        )}
      </span>
      <span className="relative min-w-0">
        <span className="block truncate font-heading text-base font-bold text-cream">{artist.name}</span>
        <span className="mt-0.5 flex items-center justify-center gap-1 text-[12px] text-cream-mute">
          <MapPinIcon width={12} height={12} />
          {artist.city}
        </span>
        <span className="mt-1 block text-[11px] uppercase tracking-wider text-mango-400/90">
          {formatCompactNumber(artist.monthlyListeners)} auditeurs/mois
        </span>
      </span>
    </Link>
  );
}

export function AlbumCard({ album }: { album: AlbumDTO }) {
  return (
    <Link
      href={`/albums/${album.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/70 transition duration-500 hover:-translate-y-1.5 hover:border-gold-400/40"
    >
      <div className="relative aspect-square overflow-hidden">
        <Cover
          src={album.coverUrl}
          alt={`Pochette de l'album ${album.title}`}
          className="h-full w-full transition-transform duration-[900ms] group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent opacity-90" />
        <span className="absolute left-3 top-3 rounded-full bg-ink-950/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300 backdrop-blur">
          {album.albumType}
        </span>
        <span className="absolute bottom-3 right-3 text-cream opacity-0 transition-all duration-300 group-hover:opacity-100">
          <DiscIcon width={22} height={22} className="animate-spin-slow" />
        </span>
      </div>
      <div className="relative -mt-16 px-4 pb-4">
        <h3 className="truncate font-heading text-lg font-extrabold text-cream">{album.title}</h3>
        <p className="truncate text-[13px] text-cream-dim">{album.artistName}</p>
        <p className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-cream-mute">
          <span>{formatDate(album.releaseDate)}</span>
          {typeof album.trackCount === "number" && (
            <>
              <span className="h-1 w-1 rounded-full bg-cream-mute/50" />
              <span>{album.trackCount} titres</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

export function PlaylistCard({ playlist }: { playlist: PlaylistDTO }) {
  return (
    <Link
      href={`/playlists/${playlist.slug}`}
      className="group relative flex min-w-[240px] items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/70 p-4 transition duration-500 hover:-translate-y-1 hover:border-baobab-500/50"
    >
      <Cover src={playlist.coverUrl} alt="" className="h-20 w-20 shrink-0 rounded-xl" />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-baobab-400">
          <QueueIcon width={12} height={12} /> Playlist
        </span>
        <span className="mt-1 block truncate font-heading text-lg font-extrabold text-cream">{playlist.title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-cream-mute">
          {playlist.curator} · {playlist.trackCount ?? 0} titres
        </span>
      </span>
      <span className="ml-auto text-cream-mute transition group-hover:translate-x-1 group-hover:text-mango-400">
        <ArrowUpRightIcon width={18} height={18} />
      </span>
    </Link>
  );
}

export function VideoCard({ video, large = false }: { video: VideoDTO; large?: boolean }) {
  return (
    <Link
      href={`/videos/${video.slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/70 transition duration-500 hover:-translate-y-1.5 hover:border-mango-500/40 ${
        large ? "" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${large ? "aspect-video" : "aspect-video"}`}>
        <Cover
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-full w-full transition-transform duration-[1200ms] group-hover:scale-[1.09]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
        <span className="absolute right-3 top-3 rounded-md bg-ink-950/80 px-2 py-0.5 text-[11px] font-bold tabular-nums text-cream backdrop-blur">
          {formatDuration(video.durationSeconds)}
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-mango-500/90 text-ink-950 opacity-0 shadow-[0_0_40px_-4px_rgba(255,106,26,0.9)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <PlayIcon width={20} height={20} className="ml-[3px]" />
          </span>
        </span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cream/90">
          <VideoIcon width={13} height={13} /> {formatCompactNumber(video.views)} vues
        </span>
      </div>
      <div className="flex items-start gap-3 p-4">
        <Cover src={video.artistCover} alt="" className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0">
          <h3 className="truncate font-heading text-[15px] font-bold text-cream transition group-hover:text-mango-200">
            {video.title}
          </h3>
          <p className="truncate text-[12px] text-cream-mute">
            {video.artistName} · {formatDate(video.releaseDate)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCard({ article, featured = false }: { article: ArticleDTO; featured?: boolean }) {
  return (
    <Link
      href={`/actualites/${article.slug}`}
      className={`group relative flex overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/70 transition duration-500 hover:-translate-y-1.5 hover:border-gold-400/40 ${
        featured ? "flex-col" : "flex-row"
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/9]" : "w-32 shrink-0 sm:w-44"}`}>
        <Cover
          src={article.coverUrl}
          alt={article.title}
          className="h-full w-full transition-transform duration-[1200ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
      </div>
      <div className={`flex min-w-0 flex-1 flex-col gap-2 p-4 ${featured ? "sm:p-6" : ""}`}>
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">
          <NewsIcon width={12} height={12} />
          {article.category}
        </span>
        <h3
          className={`font-heading font-extrabold leading-tight text-cream transition group-hover:text-mango-200 ${
            featured ? "text-2xl sm:text-3xl" : "text-[15px]"
          }`}
        >
          {article.title}
        </h3>
        {featured && <p className="line-clamp-3 text-sm text-cream-dim">{article.excerpt}</p>}
        <p className="mt-auto flex items-center gap-2 pt-1 text-[11px] uppercase tracking-wider text-cream-mute">
          <span>{article.author || "Rédaction"}</span>
          <span className="h-1 w-1 rounded-full bg-cream-mute/50" />
          <span>{formatDate(article.publishedAt)}</span>
          <span className="h-1 w-1 rounded-full bg-cream-mute/50" />
          <span>{formatCompactNumber(article.views)} lectures</span>
        </p>
      </div>
    </Link>
  );
}

export function GenreTile({ genre }: { genre: GenreDTO }) {
  return (
    <Link
      href={`/decouverte?genre=${genre.slug}`}
      className="group relative flex min-h-[124px] flex-col justify-between overflow-hidden rounded-2xl p-4 transition duration-500 hover:-translate-y-1"
      style={{ background: `linear-gradient(135deg, ${genre.colorFrom}33, ${genre.colorTo}cc)` }}
    >
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: genre.colorFrom }}
      />
      <span className="relative flex items-center justify-between">
        <span className="font-display text-3xl leading-none text-cream/90 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
          {genre.emoji}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-cream/70">{genre.trackCount} titres</span>
      </span>
      <span className="relative">
        <span className="block font-heading text-xl font-extrabold text-cream">{genre.name}</span>
        <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-cream/70">{genre.description}</span>
      </span>
    </Link>
  );
}

export function EmptyState({
  icon = "note",
  title,
  description,
  action,
}: {
  icon?: "note" | "mic" | "video" | "news";
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const Icon = icon === "mic" ? MicIcon : icon === "video" ? VideoIcon : icon === "news" ? NewsIcon : DiscIcon;
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/12 bg-ink-900/50 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-mango-500/25 to-baobab-500/20 text-mango-400">
        <Icon width={24} height={24} />
      </span>
      <h3 className="font-heading text-xl font-extrabold text-cream">{title}</h3>
      <p className="max-w-md text-sm text-cream-mute">{description}</p>
      {action}
    </div>
  );
}
