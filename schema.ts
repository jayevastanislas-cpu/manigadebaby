import {
  boolean,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ========================================================================== */
/*  MANIGUADEBABY — Schéma PostgreSQL (modèle UUID validé)                    */
/*                                                                            */
/*  Table unique de comptes : `profiles` (role fan / artist / admin).         */
/*  Clés primaires UUID pour artists, albums, tracks, videos, playlists,      */
/*  articles, banners, favorites. `genres` reste en SERIAL (référentiel).     */
/* ========================================================================== */

/* ------------------------------- Profils ---------------------------------- */

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name").notNull().default("Auditeur"),
  role: text("role").notNull().default("fan"),
  avatarUrl: text("avatar_url").notNull().default(""),
  city: text("city").notNull().default(""),
  country: text("country").notNull().default("Côte d'Ivoire"),
  phone: text("phone"),
  bio: text("bio").notNull().default(""),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* --------------------------- Référentiel genres ---------------------------- */

export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  colorFrom: text("color_from").notNull().default("#F97316"),
  colorTo: text("color_to").notNull().default("#7C2D12"),
  emoji: text("emoji").notNull().default("🎵"),
  position: integer("position").notNull().default(0),
});

/* --------------------------- Catalogue musical ----------------------------- */

export const artists = pgTable("artists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio").notNull().default(""),
  country: text("country").notNull().default("Côte d'Ivoire"),
  city: text("city").notNull().default("Abidjan"),
  coverUrl: text("cover_url").notNull().default(""),
  bannerUrl: text("banner_url").notNull().default(""),
  accent: text("accent").notNull().default("#F97316"),
  verified: boolean("verified").notNull().default(false),
  followers: integer("followers").notNull().default(0),
  monthlyListeners: integer("monthly_listeners").notNull().default(0),
  instagram: text("instagram").notNull().default(""),
  youtube: text("youtube").notNull().default(""),
  tiktok: text("tiktok").notNull().default(""),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  albumType: text("album_type").notNull().default("album"),
  releaseDate: date("release_date").notNull().default("2026-01-01"),
});

export const tracks = pgTable(
  "tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    albumId: uuid("album_id").references(() => albums.id, { onDelete: "set null" }),
    genreId: integer("genre_id").references(() => genres.id, { onDelete: "set null" }),
    audioUrl: text("audio_url").notNull(),
    coverUrl: text("cover_url").notNull().default(""),
    durationSeconds: integer("duration_seconds").notNull().default(210),
    plays: integer("plays").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    releaseDate: date("release_date").notNull().default("2026-01-01"),
    featured: boolean("featured").notNull().default(false),
    trending: boolean("trending").notNull().default(false),
    explicit: boolean("explicit").notNull().default(false),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("tracks_artist_position_idx").on(table.artistId, table.position)],
);

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: "set null" }),
  videoUrl: text("video_url").notNull().default(""),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  description: text("description").notNull().default(""),
  durationSeconds: integer("duration_seconds").notNull().default(210),
  views: integer("views").notNull().default(0),
  releaseDate: date("release_date").notNull().default("2026-01-01"),
  featured: boolean("featured").notNull().default(false),
});

export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  curator: text("curator").notNull().default("Maniguadebaby"),
  ownerId: uuid("owner_id").references(() => profiles.id, { onDelete: "set null" }),
  isPublic: boolean("is_public").notNull().default(true),
  position: integer("position").notNull().default(0),
});

export const playlistTracks = pgTable(
  "playlist_tracks",
  {
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (table) => [uniqueIndex("playlist_tracks_pk_idx").on(table.playlistId, table.trackId)],
);

/* ------------------------- Éditorial & mise en avant ------------------------ */

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  author: text("author").notNull().default("Rédaction Maniguadebaby"),
  category: text("category").notNull().default("Sorties"),
  views: integer("views").notNull().default(0),
  status: text("status").notNull().default("published"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

export const banners = pgTable("banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  tag: text("tag").notNull().default("Nouveauté"),
  imageUrl: text("image_url").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default("Écouter"),
  ctaHref: text("cta_href").notNull().default("/"),
  trackId: uuid("track_id").references(() => tracks.id, { onDelete: "set null" }),
  active: boolean("active").notNull().default(true),
  position: integer("position").notNull().default(0),
});

export const newsletterSignups = pgTable(
  "newsletter_signups",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("newsletter_signups_email_idx").on(table.email)],
);

/* --------------------- Interactions : favoris & écoutes --------------------- */

/**
 * `profiles.id` correspond au `user_id` de votre script.
 * Extension V1 : un visiteur sans compte est identifié par `visitor_id` (cookie)
 * et ses cœurs sont fusionnés dans son compte à l'inscription.
 */
export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id"),
    itemType: text("item_type").notNull().default("track"),
    itemId: uuid("item_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("favorites_user_item_idx").on(table.userId, table.itemType, table.itemId),
    uniqueIndex("favorites_visitor_item_idx").on(table.visitorId, table.itemType, table.itemId),
  ],
);

export const playEvents = pgTable("play_events", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id"),
  trackId: uuid("track_id")
    .notNull()
    .references(() => tracks.id, { onDelete: "cascade" }),
  seconds: integer("seconds").notNull().default(0),
  source: text("source").notNull().default("web"),
  playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
});


export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull().default("contact"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization").notNull().default(""),
  phone: text("phone").notNull().default(""),
  artist: text("artist").notNull().default(""),
  eventDate: text("event_date").notNull().default(""),
  budget: text("budget").notNull().default(""),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* --------------------------------- Types ----------------------------------- */

export type Genre = typeof genres.$inferSelect;
export type Artist = typeof artists.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Playlist = typeof playlists.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type PlayEvent = typeof playEvents.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
