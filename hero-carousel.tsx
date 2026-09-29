"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "@/components/player/player-provider";
import { EqualizerBars, PauseIcon, PlayIcon, SparkIcon, ArrowRightIcon } from "@/components/icons";
import { formatCompactNumber, formatDuration } from "@/lib/format";
import type { BannerDTO } from "@/lib/types";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&*§";

function useScramble(text: string, nonce: number) {
  const [output, setOutput] = useState(text);
  useEffect(() => {
    let frame = 0;
    const total = 20;
    const id = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor((frame / total) * text.length);
      setOutput(
        text
          .split("")
          .map((char, index) =>
            index < revealed || char === " " ? char : CHARS[Math.floor(Math.random() * CHARS.length)],
          )
          .join(""),
      );
      if (frame >= total) {
        window.clearInterval(id);
        setOutput(text);
      }
    }, 30);
    return () => window.clearInterval(id);
  }, [text, nonce]);
  return output;
}

export function HeroCarousel({ banners }: { banners: BannerDTO[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const mounted = useRef(false);

  const slides = useMemo(() => (banners.length > 0 ? banners : []), [banners]);
  const slide = slides[index];
  const title = useScramble(slide?.title ?? "", index);

  const go = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex(((next % slides.length) + slides.length) % slides.length);
      setProgress(0);
    },
    [slides.length],
  );

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const duration = 7000;
    const step = 60;
    const id = window.setInterval(() => {
      setProgress((prev) => {
        const nextValue = prev + step / duration;
        if (nextValue >= 1) {
          setIndex((current) => (current + 1) % slides.length);
          return 0;
        }
        return nextValue;
      });
    }, step);
    return () => window.clearInterval(id);
  }, [paused, slides.length, index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  if (!slide) return null;

  const track = slide.track;
  const isCurrent = currentTrack?.id === track?.id;
  const active = isCurrent && isPlaying;

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Mises en avant Maniguadebaby"
    >
      {/* Fonds en fondu + Ken Burns */}
      <div className="absolute inset-0 -z-10">
        {slides.map((item, i) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              className={`h-full w-full object-cover ${i === index ? "animate-kenburns" : ""}`}
            />
            <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(8,6,10,0.96)_8%,rgba(8,6,10,0.78)_38%,rgba(8,6,10,0.25)_72%,rgba(8,6,10,0.7)_100%)]" />
            <div className="absolute inset-0 grain opacity-60" />
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-[1500px] items-center gap-10 px-4 pb-16 pt-14 md:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:pb-24 lg:pt-20">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-mango-500/40 bg-mango-500/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-mango-400 backdrop-blur">
              <SparkIcon width={13} height={13} />
              {slide.tag}
            </span>
            <span className="font-display text-[11px] uppercase tracking-[0.3em] text-cream-mute">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          <h2 className="mt-5 font-display text-[clamp(2.2rem,6vw,4.2rem)] font-extrabold uppercase leading-[0.9] text-cream">
            <span className="block">{title}</span>
          </h2>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-cream-dim md:text-lg">{slide.subtitle}</p>

          {track && (
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] uppercase tracking-[0.16em] text-cream-mute">
              <span className="flex items-center gap-2 text-cream">
                <EqualizerBars playing={active} className="text-mango-500" />
                <Link href={`/artistes/${track.artistSlug}`} className="font-heading font-bold hover:text-mango-400">
                  {track.artistName}
                </Link>
              </span>
              {track.genreName && <span>{track.genreName}</span>}
              <span className="flex items-center gap-1.5">
                <SparkIcon width={12} height={12} /> {formatCompactNumber(track.plays)} écoutes
              </span>
              <span className="tabular-nums">{formatDuration(track.durationSeconds)}</span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {track && (
              <button
                onClick={() => (isCurrent ? togglePlay() : playTrack(track))}
                className="group flex items-center gap-3 rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-7 py-4 font-heading text-sm font-extrabold uppercase tracking-[0.14em] text-ink-950 shadow-[0_18px_46px_-16px_rgba(255,106,26,0.95)] transition hover:scale-[1.03] active:scale-95"
              >
                {active ? <PauseIcon width={17} height={17} /> : <PlayIcon width={17} height={17} />}
                {active ? "En pause" : slide.ctaLabel}
              </button>
            )}
            <Link
              href={slide.ctaHref}
              className="group flex items-center gap-2 rounded-full border border-white/25 px-6 py-4 font-heading text-sm font-bold uppercase tracking-[0.14em] text-cream backdrop-blur transition hover:border-cream hover:bg-white/10"
            >
              Voir la fiche
              <ArrowRightIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Navigation carrousel */}
          <div className="mt-10 flex max-w-md gap-2">
            {slides.map((item, i) => (
              <button
                key={item.id}
                onClick={() => go(i)}
                className="group flex-1 text-left"
                aria-label={`Aller à la mise en avant ${i + 1} : ${item.title}`}
              >
                <span className="block truncate font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-cream-mute transition group-hover:text-cream">
                  {item.title}
                </span>
                <span className="mt-1.5 block h-[3px] w-full overflow-hidden rounded-full bg-white/15">
                  <span
                    className="block h-full rounded-full bg-mango-500 transition-[width] duration-100"
                    style={{ width: i === index ? `${Math.max(6, progress * 100)}%` : i < index ? "100%" : "0%" }}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pochette vinyle */}
        <div className="relative hidden justify-self-end lg:block">
          <div className="relative h-[380px] w-[380px]">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-60"
              style={{ background: `radial-gradient(circle, ${track?.artistAccent ?? "#FF6A1A"}66, transparent 68%)` }}
            />
            <div className={`absolute inset-6 rounded-full border border-white/10 ${isPlaying ? "animate-spin-slow" : ""}`}>
              <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0_1px,transparent_1px_7px)]" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-mango-500 to-gold-400 shadow-inner" />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-950" />
            </div>
            {track && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.coverUrl}
                alt={`Pochette de ${track.title}`}
                className={`absolute inset-[86px] rounded-full object-cover shadow-2xl transition-transform duration-1000 ${
                  isPlaying ? "scale-100" : "scale-[0.93]"
                }`}
              />
            )}
          </div>
          <div className="absolute -bottom-4 left-1/2 w-[280px] -translate-x-1/2 rounded-2xl border border-white/12 bg-ink-950/80 p-3 backdrop-blur-xl">
            <p className="truncate font-heading text-sm font-bold text-cream">{track?.title ?? slide.title}</p>
            <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.16em] text-cream-mute">
              {track ? `${track.artistName} · ${track.genreName ?? "Afro"}` : "Sélection Maniguadebaby"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
