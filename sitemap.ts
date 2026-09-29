import type { MetadataRoute } from "next";
import { db } from "@/db";
import { albums, articles, artists, genres, tracks, videos } from "@/db/schema";
import { desc } from "drizzle-orm";

const BASE_URL = "https://www.maniguadebaby.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/decouverte",
    "/artistes",
    "/morceaux",
    "/albums",
    "/videos",
    "/actualites",
    "/playlists",
    "/magazine",
    "/espace-artiste",
    "/contact",
    "/recherche",
    "/importer",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [artistRows, trackRows, albumRows, videoRows, articleRows, genreRows] = await Promise.all([
      db.select({ slug: artists.slug }).from(artists),
      db.select({ slug: tracks.slug }).from(tracks),
      db.select({ slug: albums.slug }).from(albums),
      db.select({ slug: videos.slug }).from(videos),
      db.select({ slug: articles.slug }).from(articles).orderBy(desc(articles.publishedAt)),
      db.select({ slug: genres.slug }).from(genres),
    ]);

    dynamicRoutes = [
      ...artistRows.map((row) => ({ url: `${BASE_URL}/artistes/${row.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...trackRows.map((row) => ({ url: `${BASE_URL}/morceaux/${row.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...albumRows.map((row) => ({ url: `${BASE_URL}/albums/${row.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...videoRows.map((row) => ({ url: `${BASE_URL}/videos/${row.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...articleRows.map((row) => ({ url: `${BASE_URL}/actualites/${row.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...genreRows.map((row) => ({ url: `${BASE_URL}/decouverte?genre=${row.slug}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ];
  } catch {
    /* base indisponible : le sitemap reste sur les routes fixes */
  }

  return [...staticRoutes, ...dynamicRoutes];
}
