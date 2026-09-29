import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { Readable } from "node:stream";

/**
 * /api/media/[...path]
 * ------------------------------------------------------------------
 * Sert les fichiers déposés dans public/assets/ (images, audio, clips, icônes)
 * À LA DEMANDE, sans attendre un rebuild : le glisser-déposer devient
 * immédiatement utilisable, même sur une instance en production.
 *
 *   /api/media/audio/teranga.mp3
 *   /api/media/images/pochette.jpg
 */

export const dynamic = "force-dynamic";

const ROOTS = [join(process.cwd(), "public", "assets"), join(process.cwd(), "uploads")];

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

const MAX_DEPTH = 6;

type Context = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, context: Context) {
  const { path: segments } = await context.params;
  if (!Array.isArray(segments) || segments.length === 0 || segments.length > MAX_DEPTH) {
    return new Response("Chemin invalide", { status: 400 });
  }

  // Refus des traversées de dossier (.., absolu, nul)
  if (segments.some((segment) => segment.includes("..") || segment.includes("\0") || segment.startsWith("."))) {
    return new Response("Chemin refusé", { status: 400 });
  }

  const relative = segments.join(sep);
  const extension = extname(relative).toLowerCase();
  const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

  for (const root of ROOTS) {
    const full = normalize(join(root, relative));
    if (!full.startsWith(normalize(root + sep))) continue;
    if (!existsSync(full)) continue;
    const stats = statSync(full);
    if (!stats.isFile()) continue;

    const stream = Readable.toWeb(createReadStream(full)) as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stats.size),
        "Cache-Control": "public, max-age=3600",
        "Accept-Ranges": "bytes",
      },
    });
  }

  return new Response("Fichier introuvable", { status: 404 });
}
