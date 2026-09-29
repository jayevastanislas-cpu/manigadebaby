export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "url"
  | "color"
  | "date"
  | "datetime"
  | "select"
  | "multiselect";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  source?: "artists" | "albums" | "tracks" | "genres";
  min?: number;
  max?: number;
  full?: boolean;
};

export type EntityConfig = {
  key: string;
  label: string;
  labelPlural: string;
  description: string;
  titleField: string;
  slugField?: string;
  slugFrom?: string;
  imageField?: string;
  columns: string[];
  orderBy?: { field: string; direction: "asc" | "desc" };
  fields: FieldDef[];
};

const slugifyField: FieldDef = {
  name: "slug",
  label: "Slug (URL)",
  type: "text",
  help: "Laisser vide pour générer automatiquement à partir du titre.",
  placeholder: "ex : allo-coco",
};

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  artists: {
    key: "artists",
    label: "Artiste",
    labelPlural: "Artistes",
    description: "Fiches artistes, visuels, réseaux sociaux et statistiques d'audience.",
    titleField: "name",
    slugFrom: "name",
    imageField: "coverUrl",
    columns: ["coverUrl", "name", "city", "followers", "monthlyListeners", "verified"],
    orderBy: { field: "position", direction: "asc" },
    fields: [
      { name: "name", label: "Nom de l'artiste", type: "text", required: true, placeholder: "Aya Koffi" },
      slugifyField,
      { name: "city", label: "Ville", type: "text", defaultValue: "Abidjan" },
      { name: "country", label: "Pays", type: "text", defaultValue: "Côte d'Ivoire" },
      { name: "coverUrl", label: "Photo de profil (URL)", type: "url", placeholder: "https://…" },
      { name: "bannerUrl", label: "Bannière (URL)", type: "url", placeholder: "https://…" },
      { name: "accent", label: "Couleur d'accent", type: "color", defaultValue: "#FF6A1A" },
      { name: "followers", label: "Abonnés", type: "number", defaultValue: 0 },
      { name: "monthlyListeners", label: "Auditeurs / mois", type: "number", defaultValue: 0 },
      { name: "position", label: "Ordre d'affichage", type: "number", defaultValue: 0, help: "Plus petit = plus haut." },
      { name: "verified", label: "Artiste vérifié", type: "boolean", defaultValue: false },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@artiste" },
      { name: "youtube", label: "YouTube", type: "text" },
      { name: "tiktok", label: "TikTok", type: "text" },
      { name: "bio", label: "Biographie", type: "textarea", full: true, placeholder: "Parcours, influences, actualité…" },
    ],
  },

  genres: {
    key: "genres",
    label: "Genre",
    labelPlural: "Genres musicaux",
    description: "Styles du terroir utilisés par les filtres de la page Découverte.",
    titleField: "name",
    slugFrom: "name",
    columns: ["emoji", "name", "slug", "position"],
    orderBy: { field: "position", direction: "asc" },
    fields: [
      { name: "name", label: "Nom du genre", type: "text", required: true, placeholder: "Couper-décaler" },
      slugifyField,
      { name: "emoji", label: "Emoji", type: "text", defaultValue: "🎵" },
      { name: "colorFrom", label: "Couleur 1", type: "color", defaultValue: "#FB923C" },
      { name: "colorTo", label: "Couleur 2", type: "color", defaultValue: "#7C2D12" },
      { name: "position", label: "Ordre", type: "number", defaultValue: 0 },
      { name: "description", label: "Description", type: "textarea", full: true },
    ],
  },

  albums: {
    key: "albums",
    label: "Album",
    labelPlural: "Albums & EP",
    description: "Projets discographiques rattachés à un artiste.",
    titleField: "title",
    slugFrom: "title",
    imageField: "coverUrl",
    columns: ["coverUrl", "title", "artistId", "albumType", "releaseDate"],
    orderBy: { field: "releaseDate", direction: "desc" },
    fields: [
      { name: "title", label: "Titre du projet", type: "text", required: true },
      slugifyField,
      { name: "artistId", label: "Artiste", type: "select", source: "artists", required: true },
      {
        name: "albumType",
        label: "Type",
        type: "select",
        defaultValue: "album",
        options: [
          { value: "album", label: "Album" },
          { value: "ep", label: "EP" },
          { value: "single", label: "Single" },
          { value: "mixtape", label: "Mixtape" },
          { value: "live", label: "Live" },
        ],
      },
      { name: "releaseDate", label: "Date de sortie", type: "date", defaultValue: "2026-01-01" },
      { name: "coverUrl", label: "Pochette (URL)", type: "url", help: "Image locale : /assets/images/pochette.jpg." },
      { name: "description", label: "Description", type: "textarea", full: true },
    ],
  },

  tracks: {
    key: "tracks",
    label: "Morceau",
    labelPlural: "Morceaux",
    description: "Le catalogue audio : chaque morceau alimente le lecteur persistant du site.",
    titleField: "title",
    slugFrom: "title",
    imageField: "coverUrl",
    columns: ["coverUrl", "title", "artistId", "genreId", "durationSeconds", "plays", "trending"],
    orderBy: { field: "plays", direction: "desc" },
    fields: [
      { name: "title", label: "Titre", type: "text", required: true },
      slugifyField,
      { name: "artistId", label: "Artiste", type: "select", source: "artists", required: true },
      { name: "albumId", label: "Album (optionnel)", type: "select", source: "albums" },
      { name: "genreId", label: "Genre", type: "select", source: "genres" },
      { name: "audioUrl", label: "Fichier audio (URL MP3)", type: "url", required: true, placeholder: "https://…/titre.mp3", help: "Fichier déposé sur le site ? Utilisez /assets/audio/titre.mp3 (dossier public/assets/audio).", full: true },
      { name: "coverUrl", label: "Pochette (URL)", type: "url" },
      { name: "durationSeconds", label: "Durée (secondes)", type: "number", defaultValue: 210 },
      { name: "releaseDate", label: "Date de sortie", type: "date", defaultValue: "2026-01-01" },
      { name: "plays", label: "Écoutes", type: "number", defaultValue: 0 },
      { name: "likes", label: "J'aime", type: "number", defaultValue: 0 },
      { name: "position", label: "N° de piste", type: "number", defaultValue: 1 },
      { name: "featured", label: "Mis en avant (accueil)", type: "boolean", defaultValue: false },
      { name: "trending", label: "Tendance / Hot", type: "boolean", defaultValue: false },
      { name: "explicit", label: "Contenu explicite", type: "boolean", defaultValue: false },
    ],
  },

  videos: {
    key: "videos",
    label: "Clip",
    labelPlural: "Clips vidéo",
    description: "Clips et sessions live, hébergés en MP4 ou sur une plateforme externe.",
    titleField: "title",
    slugFrom: "title",
    imageField: "thumbnailUrl",
    columns: ["thumbnailUrl", "title", "artistId", "views", "durationSeconds", "releaseDate"],
    orderBy: { field: "views", direction: "desc" },
    fields: [
      { name: "title", label: "Titre du clip", type: "text", required: true },
      slugifyField,
      { name: "artistId", label: "Artiste", type: "select", source: "artists", required: true },
      { name: "trackId", label: "Morceau associé", type: "select", source: "tracks" },
      { name: "videoUrl", label: "URL de la vidéo (MP4 / YouTube)", type: "url", required: true, help: "Vidéo locale : /assets/clips/clip.mp4.", full: true },
      { name: "thumbnailUrl", label: "Miniature (URL)", type: "url", help: "Image locale : /assets/images/miniature.jpg." },
      { name: "durationSeconds", label: "Durée (secondes)", type: "number", defaultValue: 210 },
      { name: "views", label: "Vues", type: "number", defaultValue: 0 },
      { name: "releaseDate", label: "Date de sortie", type: "date", defaultValue: "2026-01-01" },
      { name: "featured", label: "Clip en une", type: "boolean", defaultValue: false },
      { name: "description", label: "Description", type: "textarea", full: true },
    ],
  },

  articles: {
    key: "articles",
    label: "Article",
    labelPlural: "Actualités",
    description: "Blog éditorial : sorties, interviews, potins et analyses d'industrie.",
    titleField: "title",
    slugFrom: "title",
    imageField: "coverUrl",
    columns: ["coverUrl", "title", "category", "author", "status", "publishedAt", "views"],
    orderBy: { field: "publishedAt", direction: "desc" },
    fields: [
      { name: "title", label: "Titre de l'article", type: "text", required: true, full: true },
      slugifyField,
      {
        name: "category",
        label: "Rubrique",
        type: "select",
        defaultValue: "Sorties",
        options: [
          { value: "Sorties", label: "Sorties" },
          { value: "Tops & Charts", label: "Tops & Charts" },
          { value: "Interview", label: "Interview" },
          { value: "Culture", label: "Culture" },
          { value: "Live", label: "Live" },
          { value: "Industrie", label: "Industrie" },
          { value: "Chroniques", label: "Chroniques" },
          { value: "Playlists", label: "Playlists" },
        ],
      },
      { name: "author", label: "Auteur", type: "text", defaultValue: "Rédaction Maniguadebaby" },
      { name: "status", label: "Statut", type: "select", defaultValue: "published", options: [{ value: "published", label: "Publié" }, { value: "draft", label: "Brouillon" }] },
      { name: "publishedAt", label: "Date de publication", type: "datetime" },
      { name: "views", label: "Lectures", type: "number", defaultValue: 0 },
      { name: "coverUrl", label: "Image de couverture (URL)", type: "url", full: true },
      { name: "excerpt", label: "Chapô / résumé", type: "textarea", full: true },
      { name: "content", label: "Contenu (une ligne = un paragraphe)", type: "richtext", full: true },
    ],
  },

  playlists: {
    key: "playlists",
    label: "Playlist",
    labelPlural: "Playlists",
    description: "Sélection éditoriale de morceaux, affichée sur la page Playlists.",
    titleField: "title",
    slugFrom: "title",
    imageField: "coverUrl",
    columns: ["coverUrl", "title", "curator"],
    orderBy: { field: "position", direction: "asc" },
    fields: [
      { name: "title", label: "Titre de la playlist", type: "text", required: true },
      slugifyField,
      { name: "curator", label: "Sélectionnée par", type: "text", defaultValue: "Rédaction Maniguadebaby" },
      { name: "coverUrl", label: "Visuel (URL)", type: "url" },
      { name: "position", label: "Ordre", type: "number", defaultValue: 0 },
      { name: "trackIds", label: "Morceaux de la playlist", type: "multiselect", source: "tracks", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
    ],
  },

  banners: {
    key: "banners",
    label: "Bannière",
    labelPlural: "Bannières d'accueil",
    description: "Carrousel héro de la page d'accueil : nouveautés et mises en avant.",
    titleField: "title",
    imageField: "imageUrl",
    columns: ["imageUrl", "title", "tag", "active", "position"],
    orderBy: { field: "position", direction: "asc" },
    fields: [
      { name: "title", label: "Titre affiché", type: "text", required: true },
      { name: "subtitle", label: "Sous-titre", type: "text" },
      { name: "tag", label: "Étiquette", type: "text", defaultValue: "Nouveauté" },
      { name: "trackId", label: "Morceau à lire au clic", type: "select", source: "tracks" },
      { name: "ctaLabel", label: "Texte du bouton", type: "text", defaultValue: "Écouter" },
      { name: "ctaHref", label: "Lien du bouton", type: "text", defaultValue: "/" },
      { name: "imageUrl", label: "Visuel (URL)", type: "url", full: true },
      { name: "position", label: "Ordre", type: "number", defaultValue: 0 },
      { name: "active", label: "Visible sur l'accueil", type: "boolean", defaultValue: true },
    ],
  },

  messages: {
    key: "messages",
    label: "Message",
    labelPlural: "Messages & Booking",
    description: "Demandes de booking et messages reçus depuis la page Contact.",
    titleField: "name",
    columns: ["name", "kind", "email", "organization", "status", "createdAt"],
    orderBy: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "name", label: "Nom", type: "text", required: true },
      {
        name: "kind",
        label: "Type de demande",
        type: "select",
        defaultValue: "contact",
        options: [
          { value: "contact", label: "Contact" },
          { value: "booking", label: "Booking" },
        ],
      },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "phone", label: "Téléphone / WhatsApp", type: "text" },
      { name: "organization", label: "Organisation", type: "text" },
      { name: "artist", label: "Artiste souhaité", type: "text" },
      { name: "eventDate", label: "Date de l'événement", type: "text" },
      { name: "budget", label: "Budget indicatif", type: "text" },
      {
        name: "status",
        label: "Statut",
        type: "select",
        defaultValue: "new",
        options: [
          { value: "new", label: "À traiter" },
          { value: "in_progress", label: "En cours" },
          { value: "done", label: "Traité" },
        ],
      },
      { name: "message", label: "Message", type: "textarea", full: true },
    ],
  },
};

export const ENTITY_KEYS = Object.keys(ENTITY_CONFIGS);

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "element";
}
