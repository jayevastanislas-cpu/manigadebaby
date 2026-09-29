"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TrackDTO } from "@/lib/types";

type RepeatMode = "off" | "all" | "one";

type PlayerContextValue = {
  queue: TrackDTO[];
  currentIndex: number;
  currentTrack: TrackDTO | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  queueOpen: boolean;
  playTrack: (track: TrackDTO, queue?: TrackDTO[]) => void;
  playQueue: (tracks: TrackDTO[], startIndex?: number) => void;
  enqueue: (track: TrackDTO) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setQueueOpen: (open: boolean) => void;
  removeFromQueue: (index: number) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

const STORAGE_KEY = "mgb:last-queue";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reportedRef = useRef<string | null>(null);

  const [queue, setQueue] = useState<TrackDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [queueOpen, setQueueOpen] = useState(false);

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] ?? null : null;

  /* ------------------------- restauration de la file ------------------------ */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { queue: TrackDTO[]; index: number; volume: number };
      if (Array.isArray(parsed.queue) && parsed.queue.length > 0) {
        setQueue(parsed.queue);
        setCurrentIndex(Math.min(Math.max(parsed.index ?? 0, 0), parsed.queue.length - 1));
      }
      if (typeof parsed.volume === "number") setVolumeState(parsed.volume);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (queue.length === 0) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ queue: queue.slice(0, 40), index: currentIndex, volume }),
      );
    } catch {
      /* ignore */
    }
  }, [queue, currentIndex, volume]);

  /* ------------------------------- audio element ---------------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack?.audioUrl) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
    }
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onEnded = () => handleEnded();

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, currentIndex, repeat, shuffle]);

  /* ------------------------------ compteur d'écoute ------------------------- */
  useEffect(() => {
    if (!currentTrack || !isPlaying) return;
    if (reportedRef.current === currentTrack.id) return;
    reportedRef.current = currentTrack.id;
    void fetch("/api/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: currentTrack.id }),
    }).catch(() => undefined);
  }, [currentTrack, isPlaying]);

  /* --------------------------------- actions -------------------------------- */
  const jumpTo = useCallback(
    (index: number, list: TrackDTO[]) => {
      if (list.length === 0) return;
      const nextIndex = ((index % list.length) + list.length) % list.length;
      setCurrentIndex(nextIndex);
      setCurrentTime(0);
      setIsPlaying(true);
      setIsBuffering(true);
    },
    [],
  );

  const playQueue = useCallback(
    (tracksList: TrackDTO[], startIndex = 0) => {
      if (tracksList.length === 0) return;
      setQueue(tracksList);
      jumpTo(startIndex, tracksList);
    },
    [jumpTo],
  );

  const playTrack = useCallback(
    (track: TrackDTO, tracksList?: TrackDTO[]) => {
      const list = tracksList && tracksList.length > 0 ? tracksList : [track];
      const index = Math.max(
        list.findIndex((t) => t.id === track.id),
        0,
      );
      setQueue(list);
      jumpTo(index, list);
    },
    [jumpTo],
  );

  const enqueue = useCallback((track: TrackDTO) => {
    setQueue((prev) => (prev.length > 0 ? [...prev, track] : [track]));
    setCurrentIndex((idx) => (idx < 0 ? 0 : idx));
  }, []);

  const next = useCallback(() => {
    if (queue.length === 0) return;
    if (shuffle && queue.length > 1) {
      let candidate = Math.floor(Math.random() * queue.length);
      if (candidate === currentIndex) candidate = (candidate + 1) % queue.length;
      jumpTo(candidate, queue);
      return;
    }
    if (currentIndex + 1 >= queue.length) {
      if (repeat === "off") {
        setIsPlaying(false);
        return;
      }
      jumpTo(0, queue);
      return;
    }
    jumpTo(currentIndex + 1, queue);
  }, [queue, currentIndex, shuffle, repeat, jumpTo]);

  const previous = useCallback(() => {
    if (queue.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    jumpTo(currentIndex - 1, queue);
  }, [queue, currentIndex, jumpTo]);

  const handleEnded = useCallback(() => {
    if (repeat === "one") {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play().catch(() => undefined);
      }
      return;
    }
    next();
  }, [repeat, next]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      if (queue.length > 0) jumpTo(currentIndex >= 0 ? currentIndex : 0, queue);
      return;
    }
    if (audio.paused) {
      setIsBuffering(true);
      void audio.play().catch(() => {
        setIsPlaying(false);
        setIsBuffering(false);
      });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack, queue, currentIndex, jumpTo]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.min(Math.max(seconds, 0), Number.isFinite(audio.duration) ? audio.duration : seconds);
    audio.currentTime = target;
    setCurrentTime(target);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(Math.max(value, 0), 1));
    setMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    [],
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => {
        const list = prev.filter((_, i) => i !== index);
        setCurrentIndex((cur) => {
          if (index < cur) return Math.max(0, cur - 1);
          if (index === cur) return Math.min(cur, list.length - 1);
          return cur;
        });
        return list;
      });
    },
    [],
  );

  /* ------------------------------ Media Session ----------------------------- */
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!currentTrack) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artistName,
      album: currentTrack.albumTitle ?? "Maniguadebaby",
      artwork: currentTrack.coverUrl
        ? [{ src: currentTrack.coverUrl, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("previoustrack", () => previous());
  }, [currentTrack, togglePlay, next, previous]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = currentTrack
      ? `${currentTrack.title} · ${currentTrack.artistName} — Maniguadebaby`
      : "Maniguadebaby — La musique d'Afrique de l'Ouest en streaming";
  }, [currentTrack]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentIndex,
      currentTrack,
      isPlaying,
      isBuffering,
      currentTime,
      duration: duration || currentTrack?.durationSeconds || 0,
      volume,
      muted,
      shuffle,
      repeat,
      queueOpen,
      playTrack,
      playQueue,
      enqueue,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      setQueueOpen,
      removeFromQueue,
    }),
    [
      queue,
      currentIndex,
      currentTrack,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      queueOpen,
      playTrack,
      playQueue,
      enqueue,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      removeFromQueue,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" className="hidden" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer doit être utilisé dans PlayerProvider");
  return ctx;
}
