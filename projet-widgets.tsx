"use client";

import { useEffect, useState } from "react";
import { PlayIcon, PauseIcon, HeartIcon, SparkIcon, DiscIcon } from "@/components/icons";

/* ------------------------------ Lecteur SQL -------------------------------- */

export function SqlViewer({ src, filename }: { src: string; filename: string }) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lineRange, setLineRange] = useState<"head" | "all">("head");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(src);
        const text = await res.text();
        if (!cancelled) setContent(text);
      } catch {
        if (!cancelled) setContent("-- Script indisponible. Rechargez la page.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  const lines = content.split("\n");
  const tables = (content.match(/create table if not exists public\.(\w+)/g) ?? []).length;
  const indexes = (content.match(/create (unique )?index if not exists/g) ?? []).length;
  const policies = (content.match(/create policy/g) ?? []).length;
  const shown = lineRange === "head" ? lines.slice(0, 90) : lines;

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-950/80">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-ink-900/70 px-5 py-4">
        <span className="flex items-center gap-2 font-heading text-sm font-bold text-cream">
          <DiscIcon width={16} height={16} className="text-mango-500" />
          {filename}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {[
            { label: `${lines.length} lignes`, accent: false },
            { label: `${tables} tables`, accent: true },
            { label: `${indexes} index`, accent: false },
            { label: `${policies} politiques RLS`, accent: false },
          ].map((chip) => (
            <span
              key={chip.label}
              className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
                chip.accent ? "border-mango-500/50 bg-mango-500/12 text-mango-400" : "border-white/12 text-cream-mute"
              }`}
            >
              {chip.label}
            </span>
          ))}
          <button
            onClick={copy}
            className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-950 transition hover:scale-105"
          >
            {copied ? "Copié ✓" : "Copier le script"}
          </button>
          <a
            href={src}
            download={filename}
            className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-cream-dim transition hover:border-baobab-500/60 hover:text-baobab-400"
          >
            Télécharger .sql
          </a>
        </div>
      </div>

      <div className="hide-scrollbar max-h-[420px] overflow-auto">
        {loading ? (
          <p className="px-5 py-8 text-sm text-cream-mute">Chargement du script…</p>
        ) : (
          <pre className="min-w-full px-0 py-4 font-mono text-[12px] leading-[1.65]">
            <code>
              {shown.map((line, index) => (
                <span key={index} className="flex gap-4 px-5 hover:bg-white/[0.04]">
                  <span className="w-8 shrink-0 select-none text-right text-cream-mute/50">{index + 1}</span>
                  <span
                    className={
                      line.trimStart().startsWith("--")
                        ? "text-cream-mute"
                        : /^(create|alter|insert|drop|begin|commit|do|grant)/i.test(line.trimStart())
                          ? "text-baobab-400"
                          : "text-cream-dim"
                    }
                  >
                    {line || " "}
                  </span>
                </span>
              ))}
            </code>
          </pre>
        )}
      </div>

      {!loading && lines.length > 90 && (
        <button
          onClick={() => setLineRange(lineRange === "head" ? "all" : "head")}
          className="w-full border-t border-white/10 bg-ink-900/60 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-mango-400 transition hover:bg-ink-850"
        >
          {lineRange === "head" ? `Afficher les ${lines.length} lignes` : "Réduire aux 90 premières lignes"}
        </button>
      )}
    </div>
  );
}

/* --------------------------- Sélecteur d'ambiance --------------------------- */

type Ambiance = "dark" | "light";

const PALETTES: Record<Ambiance, Record<string, string>> = {
  dark: {
    page: "#08060A",
    card: "#16101A",
    border: "rgba(253,244,234,0.12)",
    title: "#FDF4EA",
    text: "#C9B7AC",
    mute: "#9A887E",
    accent: "#FF6A1A",
  },
  light: {
    page: "#FBF6EF",
    card: "#FFFFFF",
    border: "rgba(24,14,8,0.12)",
    title: "#1A0F0A",
    text: "#5A463C",
    mute: "#8A766A",
    accent: "#E8520A",
  },
};

export function AmbianceSwitch() {
  const [ambiance, setAmbiance] = useState<Ambiance>("dark");
  const palette = PALETTES[ambiance];
  const [playing, setPlaying] = useState(true);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-white/12 p-1">
          {(["dark", "light"] as Ambiance[]).map((value) => (
            <button
              key={value}
              onClick={() => setAmbiance(value)}
              className={`rounded-full px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                ambiance === value ? "bg-mango-500 text-ink-950" : "text-cream-dim hover:text-cream"
              }`}
            >
              {value === "dark" ? "Sombre · maquis by night" : "Clair · ivoire daylight"}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-cream-mute">
          {ambiance === "dark"
            ? "Choix retenu pour la V1 : l'œil reste sur les pochettes, la batterie tient plus longtemps en 4G."
            : "Variante claire testée : lisible en plein soleil, mais les visuels perdent en intensité."}
        </p>
      </div>

      <div
        className="mt-6 overflow-hidden rounded-3xl border transition-colors duration-500"
        style={{ background: palette.page, borderColor: palette.border }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${palette.border}` }}>
          <span className="font-display text-lg uppercase" style={{ color: palette.title }}>
            Maniguade<span style={{ color: palette.accent }}>baby</span>
          </span>
          <div className="flex gap-2">
            {["Couper-décaler", "Zouglou", "Mandingue"].map((genre) => (
              <span
                key={genre}
                className="hidden rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] sm:block"
                style={{ color: palette.text, border: `1px solid ${palette.border}` }}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="rounded-2xl p-4 transition-colors duration-500"
              style={{ background: palette.card, border: `1px solid ${palette.border}` }}
            >
              <div
                className="aspect-square w-full rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${palette.accent}${index === 2 ? "cc" : "88"}, ${
                    ambiance === "dark" ? "#2A1F2E" : "#FFE0C7"
                  })`,
                }}
              />
              <p className="mt-3 font-heading text-sm font-bold" style={{ color: palette.title }}>
                {["Allo Coco", "Kalou Glissé", "Ferké Sunrise"][index - 1]}
              </p>
              <p className="text-[11px]" style={{ color: palette.mute }}>
                {["Aya Koffi", "DJ Kalou Star", "Safi Diomandé"][index - 1]}
              </p>
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-4 px-5 py-4 transition-colors duration-500"
          style={{ background: palette.card, borderTop: `1px solid ${palette.border}` }}
        >
          <button
            onClick={() => setPlaying((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition"
            style={{ background: palette.accent, color: ambiance === "dark" ? "#0F0B10" : "#FFFFFF" }}
            aria-label={playing ? "Pause" : "Lecture"}
          >
            {playing ? <PauseIcon width={15} height={15} /> : <PlayIcon width={15} height={15} />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold" style={{ color: palette.title }}>
              Allo Coco — Aya Koffi
            </p>
            <div className="mt-2 flex h-4 items-end gap-[2px]">
              {Array.from({ length: 32 }).map((_, index) => (
                <span
                  key={index}
                  className={`flex-1 rounded-full transition-all duration-500 ${playing ? "eq-bar" : ""}`}
                  style={{
                    height: `${20 + ((index * 37) % 80)}%`,
                    background: index < 14 ? palette.accent : palette.border,
                    animationDelay: `${(index % 6) * 0.12}s`,
                  }}
                />
              ))}
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px]" style={{ color: palette.mute }}>
            <HeartIcon width={14} height={14} /> 128 K
          </span>
          <span className="hidden items-center gap-1 text-[11px] sm:flex" style={{ color: palette.mute }}>
            <SparkIcon width={14} height={14} /> 2,3 M
          </span>
        </div>
      </div>
    </div>
  );
}
