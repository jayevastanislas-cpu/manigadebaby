import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  albums,
  artists,
  articles,
  banners,
  favorites,
  genres,
  playlistTracks,
  playlists,
  tracks,
  videos,
} from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import type {
  AlbumDTO,
  ArticleDTO,
  ArtistDTO,
  BannerDTO,
  GenreDTO,
  PlaylistDTO,
  TrackDTO,
  VideoDTO,
} from "@/lib/types";

const trackFields = {
  id: tracks.id,
  title: tracks.title,
  slug: tracks.slug,
  audioUrl: tracks.audioUrl,
  coverUrl: tracks.coverUrl,
  durationSeconds: tracks.durationSeconds,
  plays: tracks.plays,
  likes: tracks.likes,
  trending: tracks.trending,
  featured: tracks.featured,
  explicit: tracks.explicit,
  releaseDate: tracks.releaseDate,
  position: tracks.position,
  artistName: artists.name,
  artistSlug: artists.slug,
  artistAccent: artists.accent,
  albumTitle: albums.title,
  albumSlug: albums.slug,
  albumCover: albums.coverUrl,
  genreName: genres.name,
  genreSlug: genres.slug,
};

function mapTrack(row: Record<string, unknown>): TrackDTO {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    audioUrl: row.audioUrl as string,
    coverUrl: row.coverUrl as string,
    durationSeconds: row.durationSeconds as number,
    plays: row.plays as number,
    likes: row.likes as number,
    trending: row.trending as boolean,
    featured: row.featured as boolean,
    explicit: row.explicit as boolean,
    releaseDate: String(row.releaseDate ?? ""),
    position: row.position as number,
    artistName: row.artistName as string,
    artistSlug: row.artistSlug as string,
    artistAccent: (row.artistAccent as string) || "#F97316",
    albumTitle: (row.albumTitle as string) ?? null,
    albumSlug: (row.albumSlug as string) ?? null,
    albumCover: (row.albumCover as string) ?? null,
    genreName: (row.genreName as string) ?? null,
    genreSlug: (row.genreSlug as string) ?? null,
  };
}

type TrackQueryOptions = {
  genreSlug?: string;
  artistSlug?: string;
  albumSlug?: string;
  playlistSlug?: string;
  search?: string;
  sort?: "trending" | "recent" | "plays" | "likes" | "az";
  limit?: number;
  offset?: number;
  featured?: boolean;
  trending?: boolean;
};

export async function listTracks(options: TrackQueryOptions = {}): Promise<TrackDTO[]> {
  await ensureSeeded().catch(() => false);
  const conditions = [];
  if (options.genreSlug) conditions.push(eq(genres.slug, options.genreSlug));
  if (options.artistSlug) conditions.push(eq(artists.slug, options.artistSlug));
  if (options.albumSlug) conditions.push(eq(albums.slug, options.albumSlug));
  if (options.playlistSlug) conditions.push(eq(playlists.slug, options.playlistSlug));
  if (options.featured) conditions.push(eq(tracks.featured, true));
  if (options.trending) conditions.push(eq(tracks.trending, true));
  if (options.search) {
    const term = `%${options.search}%`;
    conditions.push(or(ilike(tracks.title, term), ilike(artists.name, term), ilike(albums.title, term))!);
  }

  const orderBy = (() => {
    switch (options.sort) {
      case "recent":
        return [desc(tracks.releaseDate), desc(tracks.id)];
      case "az":
        return [asc(tracks.title)];
      case "likes":
        return [desc(tracks.likes)];
      case "plays":
        return [desc(tracks.plays)];
      default:
        return [desc(tracks.trending), desc(tracks.plays)];
    }
  })();

  const rows = await db
    .select(trackFields)
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .leftJoin(albums, eq(tracks.albumId, albums.id))
    .leftJoin(genres, eq(tracks.genreId, genres.id))
    .leftJoin(playlistTracks, eq(playlistTracks.trackId, tracks.id))
    .leftJoin(playlists, eq(playlistTracks.playlistId, playlists.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(
      tracks.id,
      artists.id,
      albums.id,
      genres.id,
    )
    .orderBy(...orderBy)
    .limit(options.limit ?? 50)
    .offset(options.offset ?? 0);

  return rows.map((row) => mapTrack(row as unknown as Record<string, unknown>));
}

export async function getTrackBySlug(slug: string): Promise<TrackDTO | null> {
  const rows = await db
    .select(trackFields)
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .leftJoin(albums, eq(tracks.albumId, albums.id))
    .leftJoin(genres, eq(tracks.genreId, genres.id))
    .where(eq(tracks.slug, slug))
    .limit(1);
  const row = rows[0];
  return row ? mapTrack(row as unknown as Record<string, unknown>) : null;
}

export async function getTracksByIds(ids: string[]): Promise<TrackDTO[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select(trackFields)
    .from(tracks)
    .innerJoin(artists, eq(tracks.artistId, artists.id))
    .leftJoin(albums, eq(tracks.albumId, albums.id))
    .leftJoin(genres, eq(tracks.genreId, genres.id))
    .where(inArray(tracks.id, ids));
  return rows.map((row) => mapTrack(row as unknown as Record<string, unknown>));
}

export async function incrementTrackPlay(trackId: string) {
  await db.update(tracks).set({ plays: sql`${tracks.plays} + 1` }).where(eq(tracks.id, trackId));
}

/* ------------------------------- artistes -------------------------------- */

export async function listArtists(options: { search?: string; limit?: number } = {}): Promise<ArtistDTO[]> {
  const conditions = [];
  if (options.search) {
    const term = `%${options.search}%`;
    conditions.push(or(ilike(artists.name, term), ilike(artists.city, term), ilike(artists.bio, term))!);
  }
  const rows = await db
    .select({
      id: artists.id,
      name: artists.name,
      slug: artists.slug,
      bio: artists.bio,
      city: artists.city,
      country: artists.country,
      coverUrl: artists.coverUrl,
      bannerUrl: artists.bannerUrl,
      accent: artists.accent,
      verified: artists.verified,
      followers: artists.followers,
      monthlyListeners: artists.monthlyListeners,
      instagram: artists.instagram,
      youtube: artists.youtube,
      tiktok: artists.tiktok,
      trackCount: count(tracks.id),
    })
    .from(artists)
    .leftJoin(tracks, eq(tracks.artistId, artists.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(artists.id)
    .orderBy(asc(artists.position), desc(count(tracks.id)))
    .limit(options.limit ?? 100);
  return rows;
}

export async function getArtistBySlug(slug: string): Promise<ArtistDTO | null> {
  const rows = await db.select().from(artists).where(eq(artists.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return null;
  const [stats] = await db
    .select({ trackCount: count(tracks.id), totalPlays: sql<number>`coalesce(sum(${tracks.plays}), 0)` })
    .from(tracks)
    .where(eq(tracks.artistId, row.id));
  return { ...row, trackCount: Number(stats?.trackCount ?? 0) };
}

export async function getArtistTotalPlays(artistId: string): Promise<number> {
  const [stats] = await db
    .select({ totalPlays: sql<number>`coalesce(sum(${tracks.plays}), 0)` })
    .from(tracks)
    .where(eq(tracks.artistId, artistId));
  return Number(stats?.totalPlays ?? 0);
}

/* --------------------------------- albums --------------------------------- */

export async function listAlbums(options: { artistSlug?: string; limit?: number } = {}): Promise<AlbumDTO[]> {
  const conditions = [];
  if (options.artistSlug) conditions.push(eq(artists.slug, options.artistSlug));
  const rows = await db
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
      trackCount: count(tracks.id),
      durationSeconds: sql<number>`coalesce(sum(${tracks.durationSeconds}), 0)`,
    })
    .from(albums)
    .innerJoin(artists, eq(albums.artistId, artists.id))
    .leftJoin(tracks, eq(tracks.albumId, albums.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(albums.id, artists.id)
    .orderBy(desc(albums.releaseDate))
    .limit(options.limit ?? 100);
  return rows;
}

export async function getAlbumBySlug(slug: string): Promise<AlbumDTO | null> {
  const rows = await db
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
      trackCount: count(tracks.id),
      durationSeconds: sql<number>`coalesce(sum(${tracks.durationSeconds}), 0)`,
    })
    .from(albums)
    .innerJoin(artists, eq(albums.artistId, artists.id))
    .leftJoin(tracks, eq(tracks.albumId, albums.id))
    .where(eq(albums.slug, slug))
    .groupBy(albums.id, artists.id)
    .limit(1);
  return rows[0] ?? null;
}

/* --------------------------------- vidéos --------------------------------- */

export async function listVideos(
  options: { artistSlug?: string; search?: string; limit?: number; featured?: boolean } = {},
): Promise<VideoDTO[]> {
  const conditions = [];
  if (options.artistSlug) conditions.push(eq(artists.slug, options.artistSlug));
  if (options.featured) conditions.push(eq(videos.featured, true));
  if (options.search) {
    const term = `%${options.search}%`;
    conditions.push(or(ilike(videos.title, term), ilike(artists.name, term))!);
  }
  const rows = await db
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
      trackSlug: tracks.slug,
      trackTitle: tracks.title,
    })
    .from(videos)
    .innerJoin(artists, eq(videos.artistId, artists.id))
    .leftJoin(tracks, eq(videos.trackId, tracks.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(videos.views))
    .limit(options.limit ?? 100);
  return rows;
}

export async function getVideoBySlug(slug: string): Promise<VideoDTO | null> {
  const rows = await db
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
      trackSlug: tracks.slug,
      trackTitle: tracks.title,
    })
    .from(videos)
    .innerJoin(artists, eq(videos.artistId, artists.id))
    .leftJoin(tracks, eq(videos.trackId, tracks.id))
    .where(eq(videos.slug, slug))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  await db.update(videos).set({ views: sql`${videos.views} + 1` }).where(eq(videos.id, row.id));
  return { ...row, views: row.views + 1 };
}

/* ------------------------------- actualités -------------------------------- */

export async function listArticles(
  options: { category?: string; search?: string; limit?: number; status?: string } = {},
): Promise<ArticleDTO[]> {
  const conditions = [eq(articles.status, options.status ?? "published")];
  if (options.category) conditions.push(eq(articles.category, options.category));
  if (options.search) {
    const term = `%${options.search}%`;
    conditions.push(or(ilike(articles.title, term), ilike(articles.excerpt, term), ilike(articles.content, term))!);
  }
  const rows = await db
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
    .where(and(...conditions))
    .orderBy(desc(articles.publishedAt))
    .limit(options.limit ?? 100);
  return rows.map((row) => ({ ...row, publishedAt: row.publishedAt.toISOString() }));
}

export async function getArticleBySlug(slug: string): Promise<ArticleDTO | null> {
  const rows = await db
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
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  await db.update(articles).set({ views: sql`${articles.views} + 1` }).where(eq(articles.id, row.id));
  return { ...row, publishedAt: row.publishedAt.toISOString(), views: row.views + 1 };
}

export async function listArticleCategories(): Promise<string[]> {
  const rows = await db.selectDistinct({ category: articles.category }).from(articles);
  return rows.map((r) => r.category).sort();
}

/* --------------------------------- genres ---------------------------------- */

export async function listGenres(): Promise<GenreDTO[]> {
  const rows = await db
    .select({
      id: genres.id,
      name: genres.name,
      slug: genres.slug,
      description: genres.description,
      colorFrom: genres.colorFrom,
      colorTo: genres.colorTo,
      emoji: genres.emoji,
      trackCount: count(tracks.id),
    })
    .from(genres)
    .leftJoin(tracks, eq(tracks.genreId, genres.id))
    .groupBy(genres.id)
    .orderBy(asc(genres.position));
  return rows;
}

/* -------------------------------- playlists -------------------------------- */

export async function listPlaylists(options: { limit?: number } = {}): Promise<PlaylistDTO[]> {
  const rows = await db
    .select({
      id: playlists.id,
      title: playlists.title,
      slug: playlists.slug,
      description: playlists.description,
      coverUrl: playlists.coverUrl,
      curator: playlists.curator,
      trackCount: count(playlistTracks.trackId),
    })
    .from(playlists)
    .leftJoin(playlistTracks, eq(playlistTracks.playlistId, playlists.id))
    .groupBy(playlists.id)
    .orderBy(asc(playlists.position))
    .limit(options.limit ?? 50);
  return rows;
}

export async function getPlaylistBySlug(slug: string): Promise<PlaylistDTO | null> {
  const rows = await db
    .select({
      id: playlists.id,
      title: playlists.title,
      slug: playlists.slug,
      description: playlists.description,
      coverUrl: playlists.coverUrl,
      curator: playlists.curator,
      trackCount: count(playlistTracks.trackId),
    })
    .from(playlists)
    .leftJoin(playlistTracks, eq(playlistTracks.playlistId, playlists.id))
    .where(eq(playlists.slug, slug))
    .groupBy(playlists.id)
    .limit(1);
  return rows[0] ?? null;
}

/* --------------------------------- bannières -------------------------------- */

export async function listBanners(): Promise<BannerDTO[]> {
  const rows = await db
    .select({
      id: banners.id,
      title: banners.title,
      subtitle: banners.subtitle,
      tag: banners.tag,
      imageUrl: banners.imageUrl,
      ctaLabel: banners.ctaLabel,
      ctaHref: banners.ctaHref,
      trackId: banners.trackId,
    })
    .from(banners)
    .where(eq(banners.active, true))
    .orderBy(asc(banners.position));

  const ids = rows.map((r) => r.trackId).filter((v): v is string => typeof v === "string");
  const bannerTracks = ids.length > 0 ? await getTracksByIds(ids) : [];
  const byId = new Map(bannerTracks.map((t) => [t.id, t]));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    tag: row.tag,
    imageUrl: row.imageUrl,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    track: row.trackId ? byId.get(row.trackId) ?? null : null,
  }));
}

/* --------------------------------- favoris ---------------------------------- */

export async function listFavorites(owner: { visitorId?: string | null; userId?: string | null }): Promise<string[]> {
  const condition = owner.userId
    ? eq(favorites.userId, owner.userId)
    : owner.visitorId
      ? and(isNull(favorites.userId), eq(favorites.visitorId, owner.visitorId))!
      : null;
  if (!condition) return [];
  const rows = await db
    .select({ itemType: favorites.itemType, itemId: favorites.itemId })
    .from(favorites)
    .where(condition);
  return rows.map((r) => `${r.itemType}:${r.itemId}`);
}

/* --------------------------------- recherche -------------------------------- */

export type SearchResults = {
  tracks: TrackDTO[];
  artists: ArtistDTO[];
  albums: AlbumDTO[];
  videos: VideoDTO[];
  articles: ArticleDTO[];
};

export async function searchAll(term: string, limit = 6): Promise<SearchResults> {
  const q = term.trim();
  if (!q) {
    return { tracks: [], artists: [], albums: [], videos: [], articles: [] };
  }
  const like = `%${q}%`;
  const [trackRows, artistRows, albumRows, videoRows, articleRows] = await Promise.all([
    db
      .select(trackFields)
      .from(tracks)
      .innerJoin(artists, eq(tracks.artistId, artists.id))
      .leftJoin(albums, eq(tracks.albumId, albums.id))
      .leftJoin(genres, eq(tracks.genreId, genres.id))
      .where(or(ilike(tracks.title, like), ilike(artists.name, like))!)
      .orderBy(desc(tracks.plays))
      .limit(limit),
    db
      .select({
        id: artists.id,
        name: artists.name,
        slug: artists.slug,
        coverUrl: artists.coverUrl,
        followers: artists.followers,
        verified: artists.verified,
        city: artists.city,
        accent: artists.accent,
      })
      .from(artists)
      .where(or(ilike(artists.name, like), ilike(artists.city, like))!)
      .limit(limit),
    db
      .select({ id: albums.id, title: albums.title, slug: albums.slug, coverUrl: albums.coverUrl, artistSlug: artists.slug, artistName: artists.name })
      .from(albums)
      .innerJoin(artists, eq(albums.artistId, artists.id))
      .where(ilike(albums.title, like))
      .limit(limit),
    db
      .select({ id: videos.id, title: videos.title, slug: videos.slug, thumbnailUrl: videos.thumbnailUrl, artistName: artists.name, views: videos.views, durationSeconds: videos.durationSeconds })
      .from(videos)
      .innerJoin(artists, eq(videos.artistId, artists.id))
      .where(ilike(videos.title, like))
      .limit(limit),
    db
      .select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt, category: articles.category, publishedAt: articles.publishedAt, coverUrl: articles.coverUrl })
      .from(articles)
      .where(and(eq(articles.status, "published"), or(ilike(articles.title, like), ilike(articles.excerpt, like))!))
      .orderBy(desc(articles.publishedAt))
      .limit(limit),
  ]);

  return {
    tracks: trackRows.map((row) => mapTrack(row as unknown as Record<string, unknown>)),
    artists: artistRows.map((a) => ({
      ...a,
      bio: "",
      country: "Côte d'Ivoire",
      bannerUrl: "",
      instagram: "",
      youtube: "",
      tiktok: "",
      monthlyListeners: 0,
    })),
    albums: albumRows.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      description: "",
      coverUrl: a.coverUrl,
      albumType: "album",
      releaseDate: "",
      artistName: a.artistName,
      artistSlug: a.artistSlug,
    })),
    videos: videoRows.map((v) => ({
      id: v.id,
      title: v.title,
      slug: v.slug,
      videoUrl: "",
      thumbnailUrl: v.thumbnailUrl,
      description: "",
      durationSeconds: v.durationSeconds,
      views: v.views,
      releaseDate: "",
      featured: false,
      artistName: v.artistName,
      artistSlug: "",
      artistCover: "",
      trackSlug: null,
      trackTitle: null,
    })),
    articles: articleRows.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: "",
      coverUrl: a.coverUrl,
      author: "",
      category: a.category,
      views: 0,
      publishedAt: a.publishedAt.toISOString(),
    })),
  };
}

/* --------------------------------- tableaux -------------------------------- */

export async function getSiteStats() {
  const [trackStats] = await db
    .select({
      tracks: count(tracks.id),
      plays: sql<number>`coalesce(sum(${tracks.plays}), 0)`,
    })
    .from(tracks);
  const [artistStats] = await db.select({ artists: count(artists.id) }).from(artists);
  const [albumStats] = await db.select({ albums: count(albums.id) }).from(albums);
  const [videoStats] = await db
    .select({ videos: count(videos.id), views: sql<number>`coalesce(sum(${videos.views}), 0)` })
    .from(videos);
  const [articleStats] = await db.select({ articles: count(articles.id) }).from(articles);
  const [genreStats] = await db.select({ genres: count(genres.id) }).from(genres);
  const [playlistStats] = await db.select({ playlists: count(playlists.id) }).from(playlists);

  return {
    tracks: Number(trackStats?.tracks ?? 0),
    plays: Number(trackStats?.plays ?? 0),
    artists: Number(artistStats?.artists ?? 0),
    albums: Number(albumStats?.albums ?? 0),
    videos: Number(videoStats?.videos ?? 0),
    videoViews: Number(videoStats?.views ?? 0),
    articles: Number(articleStats?.articles ?? 0),
    genres: Number(genreStats?.genres ?? 0),
    playlists: Number(playlistStats?.playlists ?? 0),
  };
}
