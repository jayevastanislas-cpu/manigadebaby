import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  albums,
  artists,
  articles,
  banners,
  contactMessages,
  genres,
  playlistTracks,
  playlists,
  tracks,
  videos,
} from "@/db/schema";
import { ENTITY_CONFIGS, slugify, type FieldDef } from "@/lib/admin-config";

export type Row = Record<string, unknown>;

export type EntityHandler = {
  list: () => Promise<Row[]>;
  findOne: (id: string) => Promise<Row | null>;
  create: (values: Row) => Promise<Row | null>;
  update: (id: string, values: Row) => Promise<Row | null>;
  remove: (id: string) => Promise<void>;
  slugExists: (slug: string, excludeId?: string) => Promise<boolean>;
};

const asRows = (value: unknown): Row[] => (Array.isArray(value) ? (value as Row[]) : []);

async function listPlaylists(): Promise<Row[]> {
  const rows = asRows(await db.select().from(playlists).orderBy(asc(playlists.position)));
  if (rows.length === 0) return [];
  const links = await db
    .select({ playlistId: playlistTracks.playlistId, trackId: playlistTracks.trackId })
    .from(playlistTracks)
    .where(
      inArray(
        playlistTracks.playlistId,
        rows.map((r) => String(r.id)),
      ),
    )
    .orderBy(asc(playlistTracks.position));
  const map = new Map<string, string[]>();
  for (const link of links) {
    const current = map.get(link.playlistId) ?? [];
    current.push(link.trackId);
    map.set(link.playlistId, current);
  }
  return rows.map((row) => ({ ...row, trackIds: map.get(String(row.id)) ?? [] }));
}

async function savePlaylistTracks(playlistId: string, trackIds: unknown) {
  if (!Array.isArray(trackIds)) return;
  await db.delete(playlistTracks).where(eq(playlistTracks.playlistId, playlistId));
  const ids = trackIds.map((value) => String(value)).filter((value) => value.length > 0);
  if (ids.length === 0) return;
  await db.insert(playlistTracks).values(ids.map((trackId, index) => ({ playlistId, trackId, position: index + 1 })));
}

async function playlistRowWithTracks(id: string): Promise<Row | null> {
  const rows = asRows(await db.select().from(playlists).where(eq(playlists.id, id)).limit(1));
  const row = rows[0];
  if (!row) return null;
  const links = await db
    .select({ trackId: playlistTracks.trackId })
    .from(playlistTracks)
    .where(eq(playlistTracks.playlistId, id))
    .orderBy(asc(playlistTracks.position));
  return { ...row, trackIds: links.map((link) => link.trackId) };
}

export const HANDLERS: Record<string, EntityHandler> = {
  artists: {
    list: () => db.select().from(artists).orderBy(asc(artists.position), asc(artists.name)).then((r) => asRows(r)),
    findOne: (id) => db.select().from(artists).where(eq(artists.id, id)).limit(1).then((r) => r[0] ?? null),
    create: (values) =>
      db
        .insert(artists)
        .values(values as typeof artists.$inferInsert)
        .returning()
        .then((r) => r[0] ?? null),
    update: (id, values) =>
      db
        .update(artists)
        .set(values as typeof artists.$inferInsert)
        .where(eq(artists.id, id))
        .returning()
        .then((r) => r[0] ?? null),
    remove: (id) => db.delete(artists).where(eq(artists.id, id)).then(() => undefined),
    slugExists: (slug, excludeId) =>
      db
        .select({ id: artists.id })
        .from(artists)
        .where(excludeId ? and(eq(artists.slug, slug), ne(artists.id, excludeId))! : eq(artists.slug, slug))
        .limit(1)
        .then((r) => r.length > 0),
  },
  genres: {
    list: () => db.select().from(genres).orderBy(asc(genres.position)).then((r) => asRows(r)),
    findOne: (id) => db.select().from(genres).where(eq(genres.id, Number(id))).limit(1).then((r) => r[0] ?? null),
    create: (values) =>
      db
        .insert(genres)
        .values(values as typeof genres.$inferInsert)
        .returning()
        .then((r) => r[0] ?? null),
    update: (id, values) =>
      db
        .update(genres)
        .set(values as typeof genres.$inferInsert)
        .where(eq(genres.id, Number(id)))
        .returning()
        .then((r) => r[0] ?? null),
    remove: (id) => db.delete(genres).where(eq(genres.id, Number(id))).then(() => undefined),
    slugExists: (slug, excludeId) =>
      db
        .select({ id: genres.id })
        .from(genres)
        .where(excludeId ? and(eq(genres.slug, slug), ne(genres.id, Number(excludeId)))! : eq(genres.slug, slug))
        .limit(1)
        .then((r) => r.length > 0),
  },
  albums: {
    list: () => db.select().from(albums).orderBy(desc(albums.releaseDate)).then((r) => asRows(r)),
    findOne: (id) => db.select().from(albums).where(eq(albums.id, id)).limit(1).then((r) => r[0] ?? null),
    create: (values) =>
      db
        .insert(albums)
        .values(values as typeof albums.$inferInsert)
        .returning()
        .then((r) => r[0] ?? null),
    update: (id, values) =>
      db
        .update(albums)
        .set(values as typeof albums.$inferInsert)
        .where(eq(albums.id, id))
        .returning()
        .then((r) => r[0] ?? null),
    remove: (id) => db.delete(albums).where(eq(albums.id, id)).then(() => undefined),
    slugExists: (slug, excludeId) =>
      db
        .select({ id: albums.id })
        .from(albums)
        .where(excludeId ? and(eq(albums.slug, slug), ne(albums.id, excludeId))! : eq(albums.slug, slug))
        .limit(1)
        .then((r) => r.length > 0),
  },
  tracks: {
    list: () => db.select().from(tracks).orderBy(desc(tracks.plays)).then((r) => asRows(r)),
    findOne: (id) => db.select().from(tracks).where(eq(tracks.id, id)).limit(1).then((r) => r[0] ?? null),
    create: (values) =>
      db
        .insert(tracks)
        .values(values as typeof tracks.$inferInsert)
        .returning()
        .then((r) => r[0] ?? null),
    update: (id, values) =>
      db
        .update(tracks)
        .set(values as typeof tracks.$inferInsert)
        .where(eq(tracks.id, id))
        .returning()
        .then((r) => r[0] ?? null),
    remove: (id) => db.delete(tracks).where(eq(tracks.id, id)).then(() => undefined),
    slugExists: (slug, excludeId) =>
      db
        .select({ id: tracks.id })
        .from(tracks)
        .where(excludeId ? and(eq(tracks.slug, slug), ne(tracks.id, excludeId))! : eq(tracks.slug, slug))
        .limit(1)
        .then((r) => r.length > 0),
  },
  videos: {
    list: () => db.select().from(videos).orderBy(desc(videos.views)).then((r) => asRows(r)),
    findOne: (id) => db.select().from(videos).where(eq(videos.id, id)).limit(1).then((r) => r[0] ?? null),
    create: (values) =>
      db
        .insert(videos)
        .values(values as typeof videos.$inferInsert)
        .returning()
        .then((r) => r[0] ?? null),
    update: (id, values) =>
      db
        .update(videos)
        .set(values as typeof videos.$inferInsert)
        .where(eq(videos.id, id))
        .returning()
        .then((r) => r[0] ?? null),
    remove: (id) => db.delete(videos).where(eq(videos.id, id)).then(() => undefined),
    slugExists: (slug, excludeId) =>
      db
        .select({ id: videos.id })
        .from(videos)
        .where(excludeId ? and(eq(videos.slug, slug), ne(videos.id, excludeId))! : eq(videos.slug, slug))
        .limit(1)
        .then((r) => r.length > 0),
  },
  articles: {
    list: () => db.select().from(articles).orderBy(desc(articles.publishedAt)).then((r) => asRows(r)),
    findOne: (id) => db.select().from(articles).where(eq(articles.id, id)).limit(1).then((r) => r[0] ?? null),
    create: (values) =>
      db
        .insert(articles)
        .values(values as typeof articles.$inferInsert)
        .returning()
        .then((r) => r[0] ?? null),
    update: (id, values) =>
      db
        .update(articles)
        .set(values as typeof articles.$inferInsert)
        .where(eq(articles.id, id))
        .returning()
        .then((r) => r[0] ?? null),
    remove: (id) => db.delete(articles).where(eq(articles.id, id)).then(() => undefined),
    slugExists: (slug, excludeId) =>
      db
        .select({ id: articles.id })
        .from(articles)
        .where(excludeId ? and(eq(articles.slug, slug), ne(articles.id, excludeId))! : eq(articles.slug, slug))
        .limit(1)
        .then((r) => r.length > 0),
  },
  playlists: {
    list: listPlaylists,
    findOne: async (id) => {
      const rows = asRows(await db.select().from(playlists).where(eq(playlists.id, id)).limit(1));
      const row = rows[0];
      if (!row) return null;
      const links = await db
        .select({ trackId: playlistTracks.trackId })
        .from(playlistTracks)
        .where(eq(playlistTracks.playlistId, id))
        .orderBy(asc(playlistTracks.position));
      return { ...row, trackIds: links.map((l) => l.trackId) };
    },
    create: async (values) => {
      const { trackIds, ...rest } = values as Row & { trackIds?: unknown };
      const created = await db
        .insert(playlists)
        .values(rest as typeof playlists.$inferInsert)
        .returning();
      const row = created[0];
      if (!row) return null;
      await savePlaylistTracks(row.id, trackIds);
      return playlistRowWithTracks(row.id);
    },
    update: async (id, values) => {
      const { trackIds, ...rest } = values as Row & { trackIds?: unknown };
      const updated = await db
        .update(playlists)
        .set(rest as typeof playlists.$inferInsert)
        .where(eq(playlists.id, id))
        .returning();
      const row = updated[0];
      if (!row) return null;
      if (trackIds !== undefined) await savePlaylistTracks(id, trackIds);
      return playlistRowWithTracks(id);
    },
    remove: (id) => db.delete(playlists).where(eq(playlists.id, id)).then(() => undefined),
    slugExists: (slug, excludeId) =>
      db
        .select({ id: playlists.id })
        .from(playlists)
        .where(excludeId ? and(eq(playlists.slug, slug), ne(playlists.id, excludeId))! : eq(playlists.slug, slug))
        .limit(1)
        .then((r) => r.length > 0),
  },
  banners: {
    list: () => db.select().from(banners).orderBy(asc(banners.position)).then((r) => asRows(r)),
    findOne: (id) => db.select().from(banners).where(eq(banners.id, id)).limit(1).then((r) => r[0] ?? null),
    create: (values) =>
      db
        .insert(banners)
        .values(values as typeof banners.$inferInsert)
        .returning()
        .then((r) => r[0] ?? null),
    update: (id, values) =>
      db
        .update(banners)
        .set(values as typeof banners.$inferInsert)
        .where(eq(banners.id, id))
        .returning()
        .then((r) => r[0] ?? null),
    remove: (id) => db.delete(banners).where(eq(banners.id, id)).then(() => undefined),
    slugExists: () => Promise.resolve(false),
  },
  messages: {
    list: () => db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).then((r) => asRows(r)),
    findOne: (id) => db.select().from(contactMessages).where(eq(contactMessages.id, Number(id))).limit(1).then((r) => r[0] ?? null),
    create: (values) =>
      db
        .insert(contactMessages)
        .values(values as typeof contactMessages.$inferInsert)
        .returning()
        .then((r) => r[0] ?? null),
    update: (id, values) =>
      db
        .update(contactMessages)
        .set(values as typeof contactMessages.$inferInsert)
        .where(eq(contactMessages.id, Number(id)))
        .returning()
        .then((r) => r[0] ?? null),
    remove: (id) => db.delete(contactMessages).where(eq(contactMessages.id, Number(id))).then(() => undefined),
    slugExists: () => Promise.resolve(false),
  },
};

export function coerceField(field: FieldDef, raw: unknown): unknown {
  switch (field.type) {
    case "number": {
      if (raw === "" || raw === null || raw === undefined) return field.defaultValue ?? 0;
      const num = Number(raw);
      return Number.isFinite(num) ? num : 0;
    }
    case "boolean":
      return raw === true || raw === "true" || raw === "on" || raw === 1 || raw === "1";
    case "date": {
      const value = String(raw ?? "").slice(0, 10);
      return value || String(field.defaultValue ?? "2026-01-01");
    }
    case "datetime": {
      const value = raw ? new Date(String(raw)) : null;
      return value && !Number.isNaN(value.getTime()) ? value : new Date();
    }
    case "multiselect": {
      if (!Array.isArray(raw)) return [];
      return raw.map((v) => String(v).trim()).filter((v) => v.length > 0);
    }
    case "select": {
      if (field.source) {
        if (raw === "" || raw === null || raw === undefined) return null;
        const text = String(raw).trim();
        if (!text) return null;
        // genres = SERIAL (nombre) ; artists/albums/tracks = UUID (chaîne)
        const num = Number(text);
        return Number.isFinite(num) && num > 0 ? num : text;
      }
      return String(raw ?? field.defaultValue ?? "");
    }
    default:
      return typeof raw === "string" ? raw.trim() : String(raw ?? "");
  }
}

export function buildValues(entityKey: string, body: Row): Row {
  const config = ENTITY_CONFIGS[entityKey];
  const values: Row = {};
  for (const field of config.fields) {
    if (!(field.name in body) && field.defaultValue === undefined) {
      if (field.required) values[field.name] = coerceField(field, "");
      continue;
    }
    values[field.name] = coerceField(field, body[field.name]);
  }
  return values;
}

export async function resolveSlug(entityKey: string, values: Row, excludeId?: string): Promise<string | null> {
  const config = ENTITY_CONFIGS[entityKey];
  if (!config.slugFrom) return null;
  const handler = HANDLERS[entityKey];
  const base = String(values.slug ?? "").trim() || slugify(String(values[config.slugFrom] ?? ""));
  let candidate = slugify(base);
  let suffix = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await handler.slugExists(candidate, excludeId)) {
    candidate = `${slugify(base)}-${suffix}`;
    suffix += 1;
    if (suffix > 60) break;
  }
  return candidate;
}

export async function getSelectOptions() {
  const [artistRows, albumRows, genreRows, trackRows] = await Promise.all([
    db.select({ id: artists.id, label: artists.name }).from(artists).orderBy(asc(artists.name)),
    db.select({ id: albums.id, label: albums.title }).from(albums).orderBy(desc(albums.releaseDate)),
    db.select({ id: genres.id, label: genres.name }).from(genres).orderBy(asc(genres.position)),
    db
      .select({
        id: tracks.id,
        label: sql<string>`concat(${tracks.title}, ' — ', ${artists.name})`,
      })
      .from(tracks)
      .innerJoin(artists, eq(tracks.artistId, artists.id))
      .orderBy(desc(tracks.plays)),
  ]);
  return { artists: artistRows, albums: albumRows, genres: genreRows, tracks: trackRows };
}


