import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { albums, artists, articles, favorites, playEvents, tracks, videos } from "@/db/schema";
import { getTracksByIds } from "@/lib/queries";
import type { AlbumDTO, ArticleDTO, ArtistDTO, TrackDTO, VideoDTO } from "@/lib/types";

export type FavoriteOwner = { userId: string | null; visitorId: string | null };

export function ownerCondition(owner: FavoriteOwner) {
  if (owner.userId) return eq(favorites.userId, owner.userId);
  if (owner.visitorId) return and(isNull(favorites.userId), eq(favorites.visitorId, owner.visitorId));
  return null;
}

export type FavoriteBundle = {
  total: number;
  tracks: TrackDTO[];
  artists: ArtistDTO[];
  albums: AlbumDTO[];
  videos: VideoDTO[];
  articles: ArticleDTO[];
};

export async function loadFavoriteBundle(owner: FavoriteOwner): Promise<FavoriteBundle> {
  const empty: FavoriteBundle = { total: 0, tracks: [], artists: [], albums: [], videos: [], articles: [] };
  const condition = ownerCondition(owner);
  if (!condition) return empty;

  const rows = await db
    .select({ itemType: favorites.itemType, itemId: favorites.itemId, createdAt: favorites.createdAt })
    .from(favorites)
    .where(condition)
    .orderBy(desc(favorites.createdAt));

  const idsByType = rows.reduce<Record<string, string[]>>((accumulator, row) => {
    const list = accumulator[row.itemType] ?? [];
    list.push(row.itemId);
    accumulator[row.itemType] = list;
    return accumulator;
  }, {});

  const [trackRows, artistRows, albumRows, videoRows, articleRows] = await Promise.all([
    idsByType.track?.length ? getTracksByIds(idsByType.track) : Promise.resolve([] as TrackDTO[]),
    idsByType.artist?.length
      ? db.select().from(artists).where(inArray(artists.id, idsByType.artist)).then((items) =>
          items.map((item) => ({ ...item, trackCount: undefined }) as ArtistDTO),
        )
      : Promise.resolve([] as ArtistDTO[]),
    idsByType.album?.length
      ? db
          .select({
            id: albums.id,
            title: albums.title,
            slug: albums.slug,
            description: albums.description,
            coverUrl: albums.coverUrl,
            albumType: albums.albumType,
            releaseDate: albums.releaseDate,
            artistName: artists.name,
            artistSlug: artists.slug,
          })
          .from(albums)
          .innerJoin(artists, eq(albums.artistId, artists.id))
          .where(inArray(albums.id, idsByType.album))
          .then((items) => items as AlbumDTO[])
      : Promise.resolve([] as AlbumDTO[]),
    idsByType.video?.length
      ? db
          .select({
            id: videos.id,
            title: videos.title,
            slug: videos.slug,
            videoUrl: videos.videoUrl,
            thumbnailUrl: videos.thumbnailUrl,
            description: videos.description,
            durationSeconds: videos.durationSeconds,
            views: videos.views,
            releaseDate: videos.releaseDate,
            featured: videos.featured,
            artistName: artists.name,
            artistSlug: artists.slug,
            artistCover: artists.coverUrl,
          })
          .from(videos)
          .innerJoin(artists, eq(videos.artistId, artists.id))
          .where(inArray(videos.id, idsByType.video))
          .then((items) => items.map((item) => ({ ...item, trackSlug: null, trackTitle: null })) as VideoDTO[])
      : Promise.resolve([] as VideoDTO[]),
    idsByType.article?.length
      ? db
          .select({
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
            excerpt: articles.excerpt,
            content: articles.content,
            coverUrl: articles.coverUrl,
            author: articles.author,
            category: articles.category,
            views: articles.views,
            publishedAt: articles.publishedAt,
          })
          .from(articles)
          .where(inArray(articles.id, idsByType.article))
          .then((items) =>
            items.map((item) => ({ ...item, publishedAt: item.publishedAt.toISOString() })) as ArticleDTO[],
          )
      : Promise.resolve([] as ArticleDTO[]),
  ]);

  return {
    total: rows.length,
    tracks: trackRows,
    artists: artistRows,
    albums: albumRows,
    videos: videoRows,
    articles: articleRows,
  };
}

export type HistoryEntry = {
  id: number;
  playedAt: string;
  seconds: number;
  source: string;
  track: TrackDTO;
};

export async function loadPlayHistory(owner: FavoriteOwner, limit = 24): Promise<HistoryEntry[]> {
  const condition = owner.userId
    ? eq(playEvents.userId, owner.userId)
    : owner.visitorId
      ? and(isNull(playEvents.userId), eq(playEvents.visitorId, owner.visitorId))
      : null;
  if (!condition) return [];

  const events = await db
    .select({
      id: playEvents.id,
      playedAt: playEvents.playedAt,
      seconds: playEvents.seconds,
      source: playEvents.source,
      trackId: playEvents.trackId,
    })
    .from(playEvents)
    .where(condition)
    .orderBy(desc(playEvents.playedAt))
    .limit(limit * 2);

  const trackRows = await getTracksByIds(Array.from(new Set(events.map((event) => event.trackId))));
  const byId = new Map(trackRows.map((track) => [track.id, track]));

  const seen = new Set<string>();
  const history: HistoryEntry[] = [];
  for (const event of events) {
    if (seen.has(event.trackId)) continue;
    const track = byId.get(event.trackId);
    if (!track) continue;
    seen.add(event.trackId);
    history.push({
      id: event.id,
      playedAt: event.playedAt.toISOString(),
      seconds: event.seconds,
      source: event.source,
      track,
    });
    if (history.length >= limit) break;
  }
  return history;
}

export async function countPlays(owner: FavoriteOwner): Promise<{ events: number; seconds: number }> {
  const condition = owner.userId
    ? eq(playEvents.userId, owner.userId)
    : owner.visitorId
      ? and(isNull(playEvents.userId), eq(playEvents.visitorId, owner.visitorId))
      : null;
  if (!condition) return { events: 0, seconds: 0 };
  const rows = await db.select({ id: playEvents.id, seconds: playEvents.seconds }).from(playEvents).where(condition);
  return { events: rows.length, seconds: rows.reduce((sum, row) => sum + row.seconds, 0) };
}

export { tracks };
