"use client";

/**
 * components/AudioPlayer.tsx
 * ------------------------------------------------------------------
 * Lecteur audio persistant global de Maniguadebaby (« Audio Context »).
 *
 *  · `AudioPlayerProvider` monte UNE SEULE balise <audio> dans le layout
 *    racine : la musique continue quand l'utilisateur change de page.
 *  · `AudioPlayer` est la barre fixe en bas d'écran. On peut lui passer
 *    un morceau brut venant de la base (audio_url, cover_url, artist_name)
 *    ou laisser l'utilisateur lancer lui-même la lecture.
 *
 * Usage :
 *   // app/layout.tsx
 *   <AudioPlayerProvider><App /></AudioPlayerProvider>
 *
 *   // n'importe quelle page ou composant
 *   <AudioPlayer currentTrack={track} />
 */

import { useEffect, useRef } from "react";
import { PlayerProvider, usePlayer } from "@/components/player/player-provider";
import { PlayerBar } from "@/components/player/player-bar";
import type { TrackDTO } from "@/lib/types";

export { PlayerProvider as AudioPlayerProvider, usePlayer as useAudioPlayer } from "@/components/player/player-provider";

/** Morceau au format brut de la table `tracks` (snake_case) ou DTO applicatif. */
export type RawTrack = {
  id?: string | number;
  slug?: string;
  title: string;
  audio_url?: string;
  audioUrl?: string;
  cover_url?: string | null;
  coverUrl?: string | null;
  duration?: number | null;
  duration_seconds?: number;
  plays?: number;
  likes?: number;
  release_date?: string;
  artist_name?: string;
  artistName?: string;
  artist_slug?: string;
  artistSlug?: string;
  artist_accent?: string;
  album_title?: string | null;
  album_slug?: string | null;
  genre_name?: string | null;
  genre_slug?: string | null;
};

/** Convertit un morceau brut (base de données) en DTO attendu par le lecteur. */
function toDTO(raw: RawTrack): TrackDTO {
  const audioUrl = raw.audio_url ?? raw.audioUrl ?? "";
  return {
    id: String(raw.id ?? audioUrl),
    title: raw.title,
    slug: raw.slug ?? "",
    audioUrl,
    coverUrl: raw.cover_url ?? raw.coverUrl ?? "",
    durationSeconds: raw.duration ?? raw.duration_seconds ?? 210,
    plays: raw.plays ?? 0,
    likes: raw.likes ?? 0,
    trending: false,
    featured: false,
    explicit: false,
    releaseDate: raw.release_date ?? "",
    position: 1,
    artistName: raw.artist_name ?? raw.artistName ?? "Maniguadebaby",
    artistSlug: raw.artist_slug ?? raw.artistSlug ?? "",
    artistAccent: raw.artist_accent ?? "#F2B705",
    albumTitle: raw.album_title ?? null,
    albumSlug: raw.album_slug ?? null,
    albumCover: null,
    genreName: raw.genre_name ?? null,
    genreSlug: raw.genre_slug ?? null,
  };
}

/**
 * Synchronise le morceau passé en prop avec le contexte global.
 * L'URL d'audio est suivie dans une ref : aucun redémarrage intempestif
 * au re-rendu, la lecture ne démarre que sur un changement de morceau.
 */
function useTrackSync(track: RawTrack | null) {
  const { playTrack, currentTrack } = usePlayer();
  const lastUrl = useRef<string | null>(null);

  const audioUrl = track ? (track.audio_url ?? track.audioUrl ?? "") : "";

  useEffect(() => {
    if (!audioUrl) return;
    if (lastUrl.current === audioUrl) return;
    lastUrl.current = audioUrl;
    playTrack(toDTO(track as RawTrack));
  }, [audioUrl, track, playTrack]);

  useEffect(() => {
    if (currentTrack?.audioUrl) lastUrl.current = currentTrack.audioUrl;
  }, [currentTrack]);
}

/**
 * Barre de lecture persistante.
 * Vide : « Sélectionnez un morceau pour commencer l'écoute ».
 * Active : pochette + titre + artiste + bouton lecture/pause doré.
 */
export default function AudioPlayer({ currentTrack }: { currentTrack?: RawTrack | null }) {
  useTrackSync(currentTrack ?? null);
  return <PlayerBar />;
}
