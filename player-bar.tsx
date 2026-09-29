"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/components/player/player-provider";
import { useFavorites } from "@/components/favorites-provider";
import {
  CloseIcon,
  EqualizerBars,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  QueueIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
  SkipNextIcon,
  SkipPrevIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "@/components/icons";
import { formatDuration } from "@/lib/format";

function hashSeed(seed: string | number): number {
  if (typeof seed === "number") return seed;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 233280;
  }
  return hash;
}

function seededBars(seed: string | number, size = 72) {
  const values: number[] = [];
  let state = (hashSeed(seed) + 7) * 9301;
  for (let i = 0; i < size; i += 1) {
    state = (state * 9301 + 49297) % 233280;
    const rnd = state / 233280;
    const envelope = Math.sin((i / size) * Math.PI) * 0.55 + 0.45;
    values.push(Math.max(0.14, Math.min(1, rnd * envelope + 0.12)));
  }
  return values;
}

function Waveform({
  progress,
  seed,
  playing,
  onSeekRatio,
}: {
  progress: number;
  seed: string | number;
  playing: boolean;
  onSeekRatio: (ratio: number) => void;
}) {
  const bars = useMemo(() => seededBars(seed), [seed]);
  const ref = useRef<HTMLDivElement>(null);

  const handle = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const ratio = (event.clientX - rect.left) / rect.width;
      onSeekRatio(Math.min(Math.max(ratio, 0), 1));
    },
    [onSeekRatio],
  );

  return (
    <div
      ref={ref}
      onClick={handle}
      role="presentation"
      className="group/wave flex h-10 w-full cursor-pointer items-center gap-[2px]"
    >
      {bars.map((height, i) => {
        const active = i / bars.length <= progress;
        const bounce = playing && Math.abs(i / bars.length - progress) < 0.06;
        return (
          <span
            key={i}
            className="flex-1 rounded-full transition-[height,background-color] duration-200"
            style={{
              height: `${(bounce ? Math.min(1, height * 1.18) : height) * 100}%`,
              backgroundColor: active ? "var(--color-mango-500)" : "rgba(253,244,234,0.22)",
              boxShadow: active && bounce ? "0 0 12px rgba(255,106,26,0.75)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function QueuePanel({ onClose }: { onClose: () => void }) {
  const { queue, currentIndex, playQueue, removeFromQueue } = usePlayer();
  return (
    <div className="glass absolute bottom-[calc(100%+10px)] right-3 z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.18em] text-cream">File d'attente</p>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-cream-dim transition hover:bg-white/10 hover:text-cream"
          aria-label="Fermer la file d'attente"
        >
          <CloseIcon width={16} height={16} />
        </button>
      </div>
      <div className="hide-scrollbar max-h-[46vh] overflow-y-auto">
        {queue.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-cream-mute">
            La file est vide. Lance un morceau depuis le Top Maniguade.
          </p>
        )}
        {queue.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            className={`flex items-center gap-3 border-b border-white/5 px-3 py-2.5 transition hover:bg-white/5 ${
              index === currentIndex ? "bg-mango-500/10" : ""
            }`}
          >
            <button
              onClick={() => playQueue(queue, index)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={track.coverUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
              <span className="min-w-0">
                <span
                  className={`block truncate text-sm font-semibold ${
                    index === currentIndex ? "text-mango-400" : "text-cream"
                  }`}
                >
                  {track.title}
                </span>
                <span className="block truncate text-xs text-cream-mute">{track.artistName}</span>
              </span>
            </button>
            <EqualizerBars playing={index === currentIndex} className="text-mango-500" />
            <button
              onClick={() => removeFromQueue(index)}
              className="text-cream-mute transition hover:text-mango-400"
              aria-label={`Retirer ${track.title} de la file`}
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    queue,
    currentIndex,
    queueOpen,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setQueueOpen,
    playQueue,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  const progress = duration > 0 ? currentTime / duration : 0;
  const liked = currentTrack ? isFavorite("track", currentTrack.id) : false;

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 z-40 w-full border-t border-gray-800 bg-[#121212] p-4 text-center text-sm text-gray-400">
        Sélectionnez un morceau pour commencer l&apos;écoute
      </div>
    );
  }

  const cover = (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl md:h-[68px] md:w-[68px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentTrack.coverUrl}
        alt={`Pochette de ${currentTrack.title}`}
        className={`h-full w-full object-cover transition-transform duration-[6000ms] ${
          isPlaying ? "scale-110" : "scale-100"
        }`}
      />
      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15"
        style={{ boxShadow: isPlaying ? `0 0 28px -6px ${currentTrack.artistAccent}` : undefined }}
      />
    </div>
  );

  return (
    <>
      {/* Plein écran mobile */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink-950/97 backdrop-blur-2xl md:hidden">
          <div
            className="absolute inset-0 opacity-45"
            style={{
              background: `radial-gradient(120% 70% at 50% 0%, ${currentTrack.artistAccent}55, transparent 65%)`,
            }}
          />
          <div className="relative flex items-center justify-between px-5 py-4">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-cream-dim">
              Lecture en cours
            </span>
            <button
              onClick={() => setSheetOpen(false)}
              className="rounded-full border border-white/15 p-2 text-cream transition hover:bg-white/10"
              aria-label="Réduire le lecteur"
            >
              <CloseIcon width={18} height={18} />
            </button>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-8 px-8">
            <div className="relative">
              <div
                className={`absolute -inset-6 rounded-full blur-3xl transition-opacity duration-700 ${
                  isPlaying ? "opacity-70" : "opacity-20"
                }`}
                style={{ background: `radial-gradient(circle, ${currentTrack.artistAccent}, transparent 70%)` }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentTrack.coverUrl}
                alt=""
                className={`relative h-[min(66vw,320px)] w-[min(66vw,320px)] rounded-3xl object-cover shadow-2xl transition-transform duration-1000 ${
                  isPlaying ? "scale-100" : "scale-[0.94]"
                }`}
              />
            </div>
            <div className="w-full text-center">
              <h3 className="font-display text-3xl uppercase leading-none text-cream">{currentTrack.title}</h3>
              <Link
                href={`/artistes/${currentTrack.artistSlug}`}
                onClick={() => setSheetOpen(false)}
                className="mt-2 inline-block text-sm font-semibold text-mango-400"
              >
                {currentTrack.artistName}
              </Link>
            </div>
            <div className="w-full">
              <Waveform
                progress={progress}
                seed={currentTrack.id}
                playing={isPlaying}
                onSeekRatio={(ratio) => seek(ratio * duration)}
              />
              <div className="mt-1 flex justify-between text-[11px] tabular-nums text-cream-mute">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
            <div className="flex w-full items-center justify-center gap-7 pb-10">
              <button onClick={previous} className="text-cream transition active:scale-90" aria-label="Morceau précédent">
                <SkipPrevIcon width={28} height={28} />
              </button>
              <button
                onClick={togglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-mango-400 to-mango-600 text-ink-950 shadow-[0_10px_40px_-8px_rgba(255,106,26,0.9)] transition active:scale-95"
                aria-label={isPlaying ? "Pause" : "Lecture"}
              >
                {isPlaying ? <PauseIcon width={26} height={26} /> : <PlayIcon width={26} height={26} className="ml-1" />}
              </button>
              <button onClick={next} className="text-cream transition active:scale-90" aria-label="Morceau suivant">
                <SkipNextIcon width={28} height={28} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre persistante */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        {queueOpen && <QueuePanel onClose={() => setQueueOpen(false)} />}
        <div className="relative border-t border-[#FFD700] bg-[#1a1a1a] backdrop-blur-2xl">
          <div
            className="pointer-events-none absolute inset-x-0 -top-px h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${currentTrack.artistAccent}, transparent)`,
            }}
          />
          {/* progression mobile */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-white/10 md:hidden">
            <div
              className="h-full bg-mango-500 transition-[width] duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="mx-auto grid max-w-[1500px] grid-cols-[1fr_auto] items-center gap-4 px-3 py-2.5 md:grid-cols-[minmax(220px,1fr)_minmax(320px,2.2fr)_minmax(200px,1fr)] md:px-6 md:py-3">
            {/* Gauche : morceau en cours */}
            <button
              onClick={() => setSheetOpen(true)}
              className="flex min-w-0 items-center gap-3 text-left md:cursor-default"
            >
              {cover}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-heading text-sm font-bold text-cream md:text-[15px]">
                    {currentTrack.title}
                  </span>
                  <EqualizerBars playing={isPlaying} className="hidden text-mango-500 md:inline-flex" />
                </span>
                <Link
                  href={`/artistes/${currentTrack.artistSlug}`}
                  onClick={(event) => event.stopPropagation()}
                  className="block truncate text-xs text-cream-mute transition hover:text-mango-400 md:text-[13px]"
                >
                  {currentTrack.artistName}
                  {currentTrack.albumTitle ? ` · ${currentTrack.albumTitle}` : ""}
                </Link>
              </span>
            </button>

            {/* Centre : contrôles */}
            <div className="hidden flex-col items-center gap-1 md:flex">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleShuffle}
                  className={`rounded-full p-2 transition ${
                    shuffle ? "text-mango-400" : "text-cream-mute hover:text-cream"
                  }`}
                  aria-label="Lecture aléatoire"
                >
                  <ShuffleIcon width={17} height={17} />
                </button>
                <button
                  onClick={previous}
                  className="rounded-full p-2 text-cream-dim transition hover:text-cream"
                  aria-label="Précédent"
                >
                  <SkipPrevIcon width={19} height={19} />
                </button>
                <button
                  onClick={togglePlay}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD700] font-bold text-black transition hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? "Pause" : "Lecture"}
                >
                  {isBuffering ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                  ) : isPlaying ? (
                    <PauseIcon width={18} height={18} />
                  ) : (
                    <PlayIcon width={18} height={18} className="ml-[2px]" />
                  )}
                </button>
                <button
                  onClick={next}
                  className="rounded-full p-2 text-cream-dim transition hover:text-cream"
                  aria-label="Suivant"
                >
                  <SkipNextIcon width={19} height={19} />
                </button>
                <button
                  onClick={cycleRepeat}
                  className={`rounded-full p-2 transition ${
                    repeat !== "off" ? "text-mango-400" : "text-cream-mute hover:text-cream"
                  }`}
                  aria-label={`Répétition : ${repeat}`}
                >
                  {repeat === "one" ? <RepeatOneIcon width={17} height={17} /> : <RepeatIcon width={17} height={17} />}
                </button>
              </div>
              <div className="flex w-full items-center gap-3">
                <span className="w-10 text-right text-[11px] tabular-nums text-cream-mute">
                  {formatDuration(currentTime)}
                </span>
                <Waveform
                  progress={progress}
                  seed={currentTrack.id}
                  playing={isPlaying}
                  onSeekRatio={(ratio) => seek(ratio * duration)}
                />
                <span className="w-10 text-[11px] tabular-nums text-cream-mute">{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Droite : actions */}
            <div className="flex items-center justify-end gap-1 md:gap-2">
              <button
                onClick={() => togglePlay()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-mango-400 to-mango-600 text-ink-950 md:hidden"
                aria-label={isPlaying ? "Pause" : "Lecture"}
              >
                {isPlaying ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} className="ml-[2px]" />}
              </button>
              <button
                onClick={next}
                className="rounded-full p-2 text-cream-dim transition hover:text-cream md:hidden"
                aria-label="Suivant"
              >
                <SkipNextIcon width={18} height={18} />
              </button>
              <button
                onClick={() => toggleFavorite("track", currentTrack.id)}
                className={`rounded-full p-2 transition ${liked ? "text-mango-500" : "text-cream-mute hover:text-cream"}`}
                aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <HeartIcon filled={liked} width={18} height={18} />
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 lg:flex">
                <button onClick={toggleMute} className="text-cream-dim transition hover:text-cream" aria-label="Muet">
                  {muted || volume === 0 ? <VolumeMuteIcon width={17} height={17} /> : <VolumeIcon width={17} height={17} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-mango-500"
                  aria-label="Volume"
                />
              </div>
              <button
                onClick={() => setQueueOpen(!queueOpen)}
                className={`relative rounded-full p-2 transition ${
                  queueOpen ? "text-mango-400" : "text-cream-mute hover:text-cream"
                }`}
                aria-label="File d'attente"
              >
                <QueueIcon width={18} height={18} />
                {queue.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mango-500 px-1 text-[10px] font-bold text-ink-950">
                    {queue.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => playQueue(queue, Math.min(currentIndex + 1, queue.length - 1))}
                className="hidden rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400 xl:block"
              >
                Enchaîner
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
