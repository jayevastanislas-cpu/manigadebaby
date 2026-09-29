export type TrackDTO = {
  id: string;
  title: string;
  slug: string;
  audioUrl: string;
  coverUrl: string;
  durationSeconds: number;
  plays: number;
  likes: number;
  trending: boolean;
  featured: boolean;
  explicit: boolean;
  releaseDate: string;
  position: number;
  artistName: string;
  artistSlug: string;
  artistAccent: string;
  albumTitle: string | null;
  albumSlug: string | null;
  albumCover: string | null;
  genreName: string | null;
  genreSlug: string | null;
};

export type ArtistDTO = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  city: string;
  country: string;
  coverUrl: string;
  bannerUrl: string;
  accent: string;
  verified: boolean;
  followers: number;
  monthlyListeners: number;
  instagram: string;
  youtube: string;
  tiktok: string;
  trackCount?: number;
};

export type AlbumDTO = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  albumType: string;
  releaseDate: string;
  artistName: string;
  artistSlug: string;
  trackCount?: number;
  durationSeconds?: number;
};

export type VideoDTO = {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  durationSeconds: number;
  views: number;
  releaseDate: string;
  featured: boolean;
  artistName: string;
  artistSlug: string;
  artistCover: string;
  trackSlug: string | null;
  trackTitle: string | null;
};

export type ArticleDTO = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  author: string;
  category: string;
  views: number;
  publishedAt: string;
};

export type PlaylistDTO = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  curator: string;
  trackCount?: number;
};

export type GenreDTO = {
  id: number;
  name: string;
  slug: string;
  description: string;
  colorFrom: string;
  colorTo: string;
  emoji: string;
  trackCount: number;
};

export type BannerDTO = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  track: TrackDTO | null;
};
