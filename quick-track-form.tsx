"use client";

import { useState } from "react";
import Link from "next/link";
import { DiscIcon, PlayIcon, SparkIcon } from "@/components/icons";

type Option = { id: string | number; label: string };

/**
 * Publication rapide d'un morceau — inspirée de votre composant AddTrack.
 * Style : fond #121212, champs #1a1a1a, bouton d'or #FFD700.
 */
export function QuickTrackForm({ artists, genres }: { artists: Option[]; genres: Option[] }) {
  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [artistId, setArtistId] = useState("");
  const [genreId, setGenreId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [duration, setDuration] = useState("210");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const field =
    "w-full rounded border border-gray-700 bg-[#1a1a1a] p-3 text-white outline-none transition focus:border-[#FFD700] placeholder:text-gray-500";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title,
          audioUrl,
          artistId,
          genreId: genreId || null,
          coverUrl,
          durationSeconds: duration,
          releaseDate: new Date().toISOString().slice(0, 10),
          position: 1,
        }),
      });
      const data = (await res.json()) as { item?: { slug?: string; title?: string }; error?: string };
      if (!res.ok || !data.item) {
        setStatus("error");
        setMessage(data.error ?? "Erreur d'ajout du morceau.");
        return;
      }
      setStatus("done");
      setPublishedSlug(data.item.slug ?? null);
      setMessage(`« ${data.item.title} » est en ligne sur Maniguadebaby !`);
      setTitle("");
      setAudioUrl("");
      setCoverUrl("");
      setDuration("210");
    } catch {
      setStatus("error");
      setMessage("Erreur réseau : impossible de contacter le serveur.");
    }
  }

  return (
    <div className="min-h-[70vh] rounded-3xl border border-white/10 bg-[#121212] p-6 text-white md:p-10">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#FFD700]">
        <SparkIcon width={13} height={13} /> Panneau Admin
      </p>
      <h1 className="mt-3 text-2xl font-bold text-[#FFD700] md:text-3xl">Ajouter un Titre</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
        Publication directe dans la table <code className="font-mono text-gray-300">tracks</code> : le morceau est
        immédiatement disponible sur le site et dans le lecteur persistant. Pour une édition complète (album, flags
        « tendance », description), utilisez la{" "}
        <Link href="/admin/tracks" className="text-[#FFD700] underline decoration-dotted">
          gestion avancée des morceaux
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-md flex-col gap-4">
        <input
          type="text"
          placeholder="Titre du morceau"
          className={field}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <input
          type="url"
          placeholder="URL du fichier Audio (S3 / Cloudinary / Supabase Storage)"
          className={field}
          value={audioUrl}
          onChange={(event) => setAudioUrl(event.target.value)}
          required
        />
        <input
          type="url"
          placeholder="URL de la pochette (optionnel)"
          className={field}
          value={coverUrl}
          onChange={(event) => setCoverUrl(event.target.value)}
        />
        <select
          className={field}
          value={artistId}
          onChange={(event) => setArtistId(event.target.value)}
          required
          aria-label="Artiste"
        >
          <option value="">— ID de l'artiste (UUID) —</option>
          {artists.map((artist) => (
            <option key={artist.id} value={String(artist.id)}>
              {artist.label} · {String(artist.id).slice(0, 8)}…
            </option>
          ))}
        </select>
        <select
          className={field}
          value={genreId}
          onChange={(event) => setGenreId(event.target.value)}
          aria-label="Genre"
        >
          <option value="">— Genre musical —</option>
          {genres.map((genre) => (
            <option key={genre.id} value={String(genre.id)}>
              {genre.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            placeholder="Durée (secondes)"
            className={field}
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          />
          <span className="shrink-0 text-[11px] uppercase tracking-[0.16em] text-gray-500">
            ≈ {Math.round(Number(duration || 0) / 60)} min
          </span>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 flex items-center justify-center gap-2 bg-[#FFD700] p-3 font-bold text-black transition hover:bg-yellow-500 disabled:opacity-60"
        >
          <DiscIcon width={17} height={17} />
          {status === "loading" ? "Publication en cours…" : "Publier le morceau"}
        </button>

        {message && (
          <p
            className={`rounded border px-4 py-3 text-sm ${
              status === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-300"
                : "border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700]"
            }`}
            role="status"
          >
            {message}
          </p>
        )}

        {publishedSlug && (
          <Link
            href={`/morceaux/${publishedSlug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 rounded-full border border-[#FFD700]/50 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#FFD700] transition hover:bg-[#FFD700]/10"
          >
            <PlayIcon width={14} height={14} /> Voir la fiche publique
          </Link>
        )}
      </form>
    </div>
  );
}
