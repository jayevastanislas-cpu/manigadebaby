import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  albums,
  artists,
  articles,
  banners,
  genres,
  playlistTracks,
  playlists,
  profiles,
  tracks,
  videos,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";

const img = (id: number, w = 900, h = 900) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

const audio = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const GENRES = [
  {
    name: "Mandingue",
    slug: "mandingue",
    emoji: "🪕",
    colorFrom: "#F5C64B",
    colorTo: "#5C4400",
    description: "Kora, balafon et griots : le Mali, la Guinée et le Sénégal mandingue.",
  },
  {
    name: "Mbalax",
    slug: "mbalax",
    emoji: "🥁",
    colorFrom: "#FFD97A",
    colorTo: "#6B4E00",
    description: "Le sabar de Dakar : guitare, tama et tempo qui ne lâche pas.",
  },
  {
    name: "Zouglou",
    slug: "zouglou",
    emoji: "🗣️",
    colorFrom: "#F2B705",
    colorTo: "#4A3600",
    description: "La parole du peuple, née des cités universitaires d'Abidjan.",
  },
  {
    name: "Coupé-Décalé",
    slug: "coupe-decale",
    emoji: "🕺",
    colorFrom: "#FFC24B",
    colorTo: "#5A3A00",
    description: "Le son des maquis : ambianceur, dédicaces et pas de danse.",
  },
  {
    name: "Highlife",
    slug: "highlife",
    emoji: "🎺",
    colorFrom: "#E8C56B",
    colorTo: "#4F3B12",
    description: "Guitares du Ghana : la fête élégante, ballables et cornets.",
  },
  {
    name: "Afro Trap",
    slug: "afro-trap",
    emoji: "⚡",
    colorFrom: "#D9B45B",
    colorTo: "#3A2C08",
    description: "808 lourdes, flows nouchi et drill panafricaine.",
  },
  {
    name: "Tradi Moderne",
    slug: "tradi-moderne",
    emoji: "🌍",
    colorFrom: "#C9A227",
    colorTo: "#2E2306",
    description: "Traditions revisitées : mapouka, chants de terroir, gospel et roots.",
  },
];

const ARTISTS = [
  {
    name: "Safi Diomandé",
    slug: "safi-diomande",
    city: "Korhogo",
    country: "Côte d'Ivoire",
    coverUrl: img(35981469, 800, 800),
    bannerUrl: img(31483492, 1600, 900),
    accent: "#F59E0B",
    verified: true,
    followers: 482300,
    monthlyListeners: 1284000,
    instagram: "@safidiomande",
    youtube: "Safi Diomandé Officiel",
    tiktok: "@safi.diomande",
    bio: "Griotte moderne née à Korhogo, Safi Diomandé mélange la kora de son grand-père, le chant sénoufo et des productions électroniques. Son album « Ferké » a imposé le son mandingue sur les pistes d'Abidjan comme à Dakar.",
    position: 1,
  },
  {
    name: "DJ Kalou Star",
    slug: "dj-kalou-star",
    city: "Abidjan · Yopougon",
    coverUrl: img(9008889, 800, 800),
    bannerUrl: img(17416778, 1600, 900),
    accent: "#FB923C",
    verified: true,
    followers: 913400,
    monthlyListeners: 2461000,
    instagram: "@djjkaloustar",
    youtube: "Kalou Star TV",
    tiktok: "@djjkaloustar",
    bio: "Ambianceur en chef du couper-décaler nouvelle génération, DJ Kalou Star enchaîne les maquis de Yopougon depuis quinze ans. Chaque sortie devient un pas de danse : le « Kalou Glissé » a déjà fait le tour du continent.",
    position: 2,
  },
  {
    name: "Petit Yacé",
    slug: "petit-yace",
    city: "Abidjan · Adjamé",
    coverUrl: img(9010058, 800, 800),
    bannerUrl: img(7832573, 1600, 900),
    accent: "#FACC15",
    verified: true,
    followers: 356700,
    monthlyListeners: 892000,
    instagram: "@petityace",
    bio: "Héritier du zouglou des cités, Petit Yacé raconte les galères du gbaka, les factures impayées et l'espoir des quartiers populaires, toujours avec humour et une voix rauque reconnaissable entre mille.",
    position: 3,
  },
  {
    name: "Kora Bamba",
    slug: "kora-bamba",
    city: "Bouaké",
    coverUrl: img(9009605, 800, 800),
    bannerUrl: img(30542032, 1600, 900),
    accent: "#34D399",
    followers: 214500,
    monthlyListeners: 640000,
    instagram: "@korabamba",
    bio: "Compositeur et joueur de kora, Kora Bamba construit des ponts entre la tradition baoulé, le jazz et l'afro-pop. Ses sessions live enregistrées au bord du Bandama sont devenues cultes.",
    position: 4,
  },
  {
    name: "Aya Koffi",
    slug: "aya-koffi",
    city: "Abidjan · Cocody",
    coverUrl: img(8043841, 800, 800),
    bannerUrl: img(9008846, 1600, 900),
    accent: "#F472B6",
    verified: true,
    followers: 728900,
    monthlyListeners: 1987000,
    instagram: "@ayakoffi",
    tiktok: "@aya.koffi",
    bio: "Voix la plus streamée de l'afro-pop ivoirienne, Aya Koffi enchaîne tubes de saison et collaborations panafricaines. Son titre « Allo Coco » a tenu la tête du Top Maniguade pendant huit semaines.",
    position: 5,
  },
  {
    name: "Ras Malick",
    slug: "ras-malick",
    city: "Grand-Bassam",
    coverUrl: img(9008883, 800, 800),
    bannerUrl: img(33168022, 1600, 900),
    accent: "#4ADE80",
    followers: 189200,
    monthlyListeners: 431000,
    instagram: "@rasmalick",
    bio: "Reggae roots et textes conscients : Ras Malick défend la terre, la jeunesse et la dignité. Il organise chaque année le festival « Bassam Sun » sur la plage.",
    position: 6,
  },
  {
    name: "Sista Grâce",
    slug: "sista-grace",
    city: "Abidjan · Marcory",
    coverUrl: img(5500461, 800, 800),
    bannerUrl: img(6193723, 1600, 900),
    accent: "#60A5FA",
    followers: 305100,
    monthlyListeners: 712000,
    instagram: "@sistagrace",
    bio: "Chorale de Marcory puis carrière solo : Sista Grâce porte le gospel ivoirien avec des arrangements modernes et des concerts à guichets fermés au Palais de la Culture.",
    position: 7,
  },
  {
    name: "Nouchi Boyz",
    slug: "nouchi-boyz",
    city: "Abidjan · Abobo",
    coverUrl: img(9009513, 800, 800),
    bannerUrl: img(18807625, 1600, 900),
    accent: "#A3E635",
    followers: 402800,
    monthlyListeners: 1104000,
    instagram: "@nouchiboyz",
    tiktok: "@nouchiboyz",
    bio: "Collectif de rap né à Abobo : quatre MCs, un producteur et un argot nouchi qui s'exporte. Leurs freestyles « Rue Princesse » cumulent des millions de vues.",
    position: 8,
  },
  {
    name: "Adjoua Vibes",
    slug: "adjoua-vibes",
    city: "Gagnoa",
    coverUrl: img(7640407, 800, 800),
    bannerUrl: img(15474702, 1600, 900),
    accent: "#C084FC",
    followers: 158400,
    monthlyListeners: 388000,
    instagram: "@adjouavibes",
    bio: "Reine du mapouka revisité, Adjoua Vibes remet le tambour parleur bété au centre des clubs, avec des clips tournés dans les villages du Sud-Ouest.",
    position: 9,
  },
  {
    name: "Ndèye Fatou",
    slug: "ndeye-fatou",
    city: "Dakar",
    country: "Sénégal",
    coverUrl: img(31483492, 800, 800),
    bannerUrl: img(33168022, 1600, 900),
    accent: "#FFD97A",
    verified: true,
    followers: 641200,
    monthlyListeners: 1732000,
    instagram: "@ndeyefatou",
    youtube: "Ndèye Fatou Officiel",
    tiktok: "@ndeye.fatou",
    bio: "Reine du mbalax nouvelle génération, Ndèye Fatou fait dialoguer le sabar des griots de Dakar et les productions électroniques. Son single « Teranga » tourne depuis Dakar jusqu'à Paris et Abidjan.",
    position: 10,
  },
  {
    name: "Kwame Bonsu",
    slug: "kwame-bonsu",
    city: "Accra",
    country: "Ghana",
    coverUrl: img(32490287, 800, 800),
    bannerUrl: img(15474702, 1600, 900),
    accent: "#E8C56B",
    followers: 287400,
    monthlyListeners: 806000,
    instagram: "@kwamebonsu",
    youtube: "Kwame Bonsu",
    bio: "Guitariste et chanteur ghanéen, Kwame Bonsu réveille le highlife des années 80 avec des arrangements modernes. Ses sessions live à Osu font salle comble depuis trois saisons.",
    position: 11,
  },
];


type AlbumSeed = {
  slug: string;
  artist: string;
  title: string;
  type: string;
  cover: string;
  release: string;
  description: string;
};

const ALBUMS: AlbumSeed[] = [
  {
    slug: "ferke",
    artist: "safi-diomande",
    title: "Ferké",
    type: "album",
    cover: img(32915605),
    release: "2025-11-14",
    description: "Douze titres entre kora, percussions sénoufo et nappes électroniques.",
  },
  {
    slug: "kalou-glisse",
    artist: "dj-kalou-star",
    title: "Kalou Glissé",
    type: "album",
    cover: img(9008892),
    release: "2026-01-09",
    description: "L'album du mouvement qui a remis le couper-décaler en haut des maquis.",
  },
  {
    slug: "gbaka-story",
    artist: "petit-yace",
    title: "Gbaka Story",
    type: "ep",
    cover: img(7315515),
    release: "2025-09-02",
    description: "Six chroniques zouglou enregistrées entre Adjamé et Yopougon.",
  },
  {
    slug: "bandama-session",
    artist: "kora-bamba",
    title: "Bandama Session",
    type: "album",
    cover: img(32105231),
    release: "2025-06-20",
    description: "Un live au bord du fleuve, kora, balafon et invités surprises.",
  },
  {
    slug: "allo-coco",
    artist: "aya-koffi",
    title: "Allo Coco",
    type: "single",
    cover: img(6835450),
    release: "2026-02-06",
    description: "Le tube de la saison, produit par 225 Beats.",
  },
  {
    slug: "bassam-sun",
    artist: "ras-malick",
    title: "Bassam Sun",
    type: "album",
    cover: img(9433390),
    release: "2025-04-18",
    description: "Reggae roots enregistré face à l'océan, avec la section cuivre de Treichville.",
  },
  {
    slug: "lumiere-de-marcory",
    artist: "sista-grace",
    title: "Lumière de Marcory",
    type: "album",
    cover: img(18615331),
    release: "2025-12-05",
    description: "Gospel orchestral, chorale de quarante voix et orgue Hammond.",
  },
  {
    slug: "rue-princesse-freestyle",
    artist: "nouchi-boyz",
    title: "Rue Princesse Freestyle",
    type: "ep",
    cover: img(12850585),
    release: "2026-01-23",
    description: "Cinq freestyles nouchi tournés en une nuit à Abobo.",
  },
];

type TrackSeed = {
  title: string;
  slug: string;
  artist: string;
  album?: string;
  genre: string;
  cover: string;
  n: number;
  duration: number;
  plays: number;
  release: string;
  featured?: boolean;
  trending?: boolean;
  explicit?: boolean;
  position: number;
};

const TRACKS: TrackSeed[] = [
  { title: "Kalou Glissé", slug: "kalou-glisse-single", artist: "dj-kalou-star", album: "kalou-glisse", genre: "coupe-decale", cover: img(9008892), n: 1, duration: 243, plays: 1842000, release: "2026-01-09", featured: true, trending: true, position: 1 },
  { title: "Maquis VIP", slug: "maquis-vip", artist: "dj-kalou-star", album: "kalou-glisse", genre: "coupe-decale", cover: img(9008892), n: 2, duration: 221, plays: 934000, release: "2026-01-09", trending: true, position: 2 },
  { title: "Dédicace à Tantie", slug: "dedicace-a-tantie", artist: "dj-kalou-star", album: "kalou-glisse", genre: "coupe-decale", cover: img(9008892), n: 3, duration: 198, plays: 512000, release: "2026-01-09", position: 3 },
  { title: "Allo Coco", slug: "allo-coco", artist: "aya-koffi", album: "allo-coco", genre: "highlife", cover: img(6835450), n: 4, duration: 208, plays: 2318000, release: "2026-02-06", featured: true, trending: true, position: 1 },
  { title: "Cocody Nights", slug: "cocody-nights", artist: "aya-koffi", genre: "highlife", cover: img(8043841), n: 5, duration: 232, plays: 1123000, release: "2025-10-17", trending: true, position: 2 },
  { title: "Ferké Sunrise", slug: "ferke-sunrise", artist: "safi-diomande", album: "ferke", genre: "mandingue", cover: img(32915605), n: 6, duration: 274, plays: 867000, release: "2025-11-14", featured: true, position: 1 },
  { title: "Kora de mon père", slug: "kora-de-mon-pere", artist: "safi-diomande", album: "ferke", genre: "mandingue", cover: img(32915605), n: 7, duration: 291, plays: 445000, release: "2025-11-14", position: 2 },
  { title: "Sénoufo Flow", slug: "senoufo-flow", artist: "safi-diomande", album: "ferke", genre: "mandingue", cover: img(35981469), n: 8, duration: 226, plays: 388000, release: "2025-11-14", position: 3 },
  { title: "Gbaka Story", slug: "gbaka-story", artist: "petit-yace", album: "gbaka-story", genre: "zouglou", cover: img(7315515), n: 9, duration: 254, plays: 1276000, release: "2025-09-02", trending: true, position: 1 },
  { title: "Facture pas payée", slug: "facture-pas-payee", artist: "petit-yace", album: "gbaka-story", genre: "zouglou", cover: img(7315515), n: 10, duration: 238, plays: 731000, release: "2025-09-02", position: 2 },
  { title: "Yopougon ambiance", slug: "yopougon-ambiance", artist: "petit-yace", album: "gbaka-story", genre: "zouglou", cover: img(9010058), n: 11, duration: 205, plays: 502000, release: "2025-09-02", position: 3 },
  { title: "Bandama Blues", slug: "bandama-blues", artist: "kora-bamba", album: "bandama-session", genre: "tradi-moderne", cover: img(32105231), n: 12, duration: 312, plays: 421000, release: "2025-06-20", position: 1 },
  { title: "Balafon Nights", slug: "balafon-nights", artist: "kora-bamba", album: "bandama-session", genre: "tradi-moderne", cover: img(32105231), n: 13, duration: 268, plays: 356000, release: "2025-06-20", position: 2 },
  { title: "Rue Princesse", slug: "rue-princesse", artist: "nouchi-boyz", album: "rue-princesse-freestyle", genre: "afro-trap", cover: img(12850585), n: 14, duration: 187, plays: 1594000, release: "2026-01-23", trending: true, explicit: true, position: 1 },
  { title: "Abobo Drill", slug: "abobo-drill", artist: "nouchi-boyz", album: "rue-princesse-freestyle", genre: "afro-trap", cover: img(12850585), n: 15, duration: 174, plays: 987000, release: "2026-01-23", explicit: true, position: 2 },
  { title: "Nouchi Dictionnaire", slug: "nouchi-dictionnaire", artist: "nouchi-boyz", genre: "afro-trap", cover: img(9009513), n: 16, duration: 199, plays: 623000, release: "2025-08-11", explicit: true, position: 3 },
  { title: "Bassam Sun", slug: "bassam-sun", artist: "ras-malick", album: "bassam-sun", genre: "tradi-moderne", cover: img(9433390), n: 1, duration: 289, plays: 342000, release: "2025-04-18", position: 1 },
  { title: "Terre Rouge", slug: "terre-rouge", artist: "ras-malick", album: "bassam-sun", genre: "tradi-moderne", cover: img(9008883), n: 2, duration: 261, plays: 218000, release: "2025-04-18", position: 2 },
  { title: "Lumière de Marcory", slug: "lumiere-de-marcory-track", artist: "sista-grace", album: "lumiere-de-marcory", genre: "tradi-moderne", cover: img(18615331), n: 3, duration: 341, plays: 289000, release: "2025-12-05", position: 1 },
  { title: "Merci Papa", slug: "merci-papa", artist: "sista-grace", album: "lumiere-de-marcory", genre: "tradi-moderne", cover: img(5500461), n: 4, duration: 296, plays: 174000, release: "2025-12-05", position: 2 },
  { title: "Mapouka 2.0", slug: "mapouka-2-0", artist: "adjoua-vibes", genre: "tradi-moderne", cover: img(7640407), n: 5, duration: 214, plays: 763000, release: "2026-01-30", trending: true, position: 1 },
  { title: "Tambour Parleur", slug: "tambour-parleur", artist: "adjoua-vibes", genre: "tradi-moderne", cover: img(7640407), n: 6, duration: 233, plays: 402000, release: "2026-01-30", position: 2 },
  { title: "Allo Coco (Remix Mandingue)", slug: "allo-coco-remix", artist: "aya-koffi", genre: "highlife", cover: img(6835450), n: 7, duration: 247, plays: 651000, release: "2026-02-20", featured: true, position: 4 },
  { title: "Gagnoa City", slug: "gagnoa-city", artist: "adjoua-vibes", genre: "tradi-moderne", cover: img(31483492), n: 8, duration: 226, plays: 187000, release: "2025-07-19", position: 3 },
  { title: "Teranga", slug: "teranga", artist: "ndeye-fatou", genre: "mbalax", cover: img(31483492), n: 9, duration: 236, plays: 1124000, release: "2026-01-16", featured: true, trending: true, position: 1 },
  { title: "Dakar By Night", slug: "dakar-by-night", artist: "ndeye-fatou", genre: "mbalax", cover: img(33168022), n: 10, duration: 258, plays: 687000, release: "2026-01-16", position: 2 },
  { title: "Highlife Session", slug: "highlife-session", artist: "kwame-bonsu", genre: "highlife", cover: img(32490287), n: 11, duration: 271, plays: 512000, release: "2025-11-07", position: 1 },
  { title: "Bomba Beach", slug: "bomba-beach", artist: "kwame-bonsu", genre: "highlife", cover: img(15474702), n: 12, duration: 244, plays: 398000, release: "2025-11-07", position: 2 },
];


const VIDEOS = [
  { title: "Kalou Glissé (Clip Officiel)", slug: "kalou-glisse-clip", artist: "dj-kalou-star", track: "kalou-glisse-single", url: "https://videos.pexels.com/video-files/37691735/15981162_3840_2160_25fps.mp4", thumb: "https://images.pexels.com/videos/37691735/pexels-photo-37691735.jpeg?auto=compress&cs=tinysrgb&w=1200", duration: 243, views: 3120000, release: "2026-01-12", featured: true, description: "Tourné dans un maquis de Yopougon avec 200 danseurs et la team Kalou Glissé." },
  { title: "Allo Coco (Clip Officiel)", slug: "allo-coco-clip", artist: "aya-koffi", track: "allo-coco", url: "https://videos.pexels.com/video-files/8039280/8039280-uhd_4096_2160_25fps.mp4", thumb: "https://images.pexels.com/videos/8039280/pexels-photo-8039280.jpeg?auto=compress&cs=tinysrgb&w=1200", duration: 208, views: 4512000, release: "2026-02-08", featured: true, description: "Cocody by night : néons, cabriolets et chorégraphie signée Nouchi Dancers." },
  { title: "Gbaka Story (Live Adjamé)", slug: "gbaka-story-live", artist: "petit-yace", track: "gbaka-story", url: "https://videos.pexels.com/video-files/9005823/9005823-hd_1920_1080_25fps.mp4", thumb: "https://images.pexels.com/videos/9005823/pexels-photo-9005823.jpeg?auto=compress&cs=tinysrgb&w=1200", duration: 254, views: 987000, release: "2025-09-14", description: "Session live au marché d'Adjamé, captée en une prise." },
  { title: "Ferké Sunrise (Session Kora)", slug: "ferke-sunrise-session", artist: "safi-diomande", track: "ferke-sunrise", url: "https://videos.pexels.com/video-files/37691746/15981132_3840_2160_25fps.mp4", thumb: "https://images.pexels.com/videos/37691746/pexels-photo-37691746.jpeg?auto=compress&cs=tinysrgb&w=1200", duration: 274, views: 623000, release: "2025-11-20", description: "Lever de soleil sur Korhogo, kora et chant sénoufo en acoustique." },
  { title: "Rue Princesse (Freestyle)", slug: "rue-princesse-freestyle-video", artist: "nouchi-boyz", track: "rue-princesse", url: "https://videos.pexels.com/video-files/27865969/12248478_2560_1440_50fps.mp4", thumb: "https://images.pexels.com/videos/27865969/cultural-dance-from-nigeria-27865969.jpeg?auto=compress&cs=tinysrgb&w=1200", duration: 187, views: 1745000, release: "2026-01-25", description: "Quatre MCs, une caméra, une nuit blanche à Abobo." },
  { title: "Mapouka 2.0 (Clip)", slug: "mapouka-2-0-clip", artist: "adjoua-vibes", track: "mapouka-2-0", url: "https://videos.pexels.com/video-files/37691739/15981120_3840_2160_25fps.mp4", thumb: "https://images.pexels.com/videos/37691739/pexels-photo-37691739.jpeg?auto=compress&cs=tinysrgb&w=1200", duration: 214, views: 892000, release: "2026-02-01", description: "Danse traditionnelle du Sud-Ouest remise au goût des clubs." },
  { title: "Bassam Sun (Session Plage)", slug: "bassam-sun-session", artist: "ras-malick", track: "bassam-sun", url: "https://videos.pexels.com/video-files/29603787/12740644_1920_1080_60fps.mp4", thumb: "https://images.pexels.com/videos/29603787/bujumbura-mairie-burundi-video-29603787.jpeg?auto=compress&cs=tinysrgb&w=1200", duration: 289, views: 341000, release: "2025-05-02", description: "Reggae roots face à l'océan, à Grand-Bassam." },
  { title: "Bandama Session (Documentaire)", slug: "bandama-session-doc", artist: "kora-bamba", track: "bandama-blues", url: "https://videos.pexels.com/video-files/8043147/uhd_25fps.mp4", thumb: "https://images.pexels.com/videos/8043147/adult-alternative-band-business-8043147.jpeg?auto=compress&cs=tinysrgb&w=1200", duration: 312, views: 208000, release: "2025-07-08", description: "Inside the session : comment l'album a été enregistré au bord du fleuve." },
];

const ARTICLES = [
  {
    title: "Aya Koffi pulvérise le Top Maniguade avec « Allo Coco »",
    slug: "aya-koffi-allo-coco-numero-un",
    category: "Tops & Charts",
    author: "Yao Serge",
    cover: img(6835450, 1400, 800),
    excerpt: "Huit semaines en tête, plus de 2,3 millions d'écoutes : retour sur le carton de la saison.",
    content: `Le morceau est sorti un vendredi soir, sans annonce. Quarante-huit heures plus tard, « Allo Coco » occupait la première place du Top Maniguade et ne l'a plus quittée depuis huit semaines.\n\nProduit par 225 Beats dans un home-studio de Cocody, le titre repose sur une ligne de synthé entêtante et un refrain en nouchi que toute la ville reprend déjà, des gbaka de Yopougon aux terrasses de la Zone 4. « On a enregistré la voix en deux prises, raconte Aya Koffi. Je voulais garder l'énergie du direct, cette sensation d'être au maquis avec les gens. »\n\nLe clip, tourné de nuit avec le collectif Nouchi Dancers, cumule plus de 4,5 millions de vues sur la plateforme. Deux remixes sont déjà annoncés : une version mandingue avec Safi Diomandé et un edit amapiano prévu pour mars.\n\nCe qui frappe, c'est la vitesse de propagation : la chorégraphie a été reprise sur TikTok en moins d'une semaine, du Ghana au Sénégal. Un cas d'école pour l'industrie musicale ivoirienne, qui prouve qu'un titre bien pensé peut traverser les frontières sans budget marketing international.`,
    views: 18400,
    published: "2026-02-20T09:00:00Z",
  },
  {
    title: "Le couper-décaler fait son grand retour dans les maquis d'Abidjan",
    slug: "couper-decaler-retour-maquis",
    category: "Culture",
    author: "Fatou Bamba",
    cover: img(17416778, 1400, 800),
    excerpt: "DJ Kalou Star en tête, une nouvelle génération réinvente le genre né il y a vingt ans.",
    content: `Il suffisait d'un samedi soir à Yopougon pour s'en convaincre : le couper-décaler n'a jamais vraiment quitté les maquis. Il attendait son heure.\n\nDJ Kalou Star a relancé la machine avec « Kalou Glissé », un morceau pensé pour la piste : un roulement de percussions, une basse ronde, et un pas de danse simple à reproduire. Résultat, plus de 1,8 million d'écoutes en un mois et des DJ sets complets jusqu'à Bouaké.\n\n« Le couper-décaler, c'est d'abord une attitude, explique l'ambianceur. On célèbre la vie même quand c'est dur. Les jeunes d'aujourd'hui ont besoin de ça. »\n\nAutour de lui gravite toute une scène : Adjoua Vibes qui mélange mapouka et clubs, Petit Yacé qui garde l'esprit zouglou, et une dizaine de producteurs qui publient directement sur les réseaux avant de passer par les labels.\n\nPour la plateforme, l'enjeu est de documenter ce mouvement : playlists dédiées, archives de clips et fiches artistes enrichies. La mémoire du genre se construit maintenant.`,
    views: 12300,
    published: "2026-02-14T16:30:00Z",
  },
  {
    title: "Safi Diomandé : « La kora est un téléphone entre les vivants et les ancêtres »",
    slug: "safi-diomande-interview-ferke",
    category: "Interview",
    author: "Rédaction Maniguadebaby",
    cover: img(32915605, 1400, 800),
    excerpt: "Rencontre avec la griotte de Korhogo à l'occasion de la sortie de son album « Ferké ».",
    content: `Safi Diomandé reçoit à Korhogo, dans la cour familiale où son grand-père accordait ses koras. Autour, des enfants courent, une radio diffuse un titre de Petit Yacé, et l'artiste répond sans se presser.\n\n« Ferké, c'est ma ville, mais c'est surtout un état d'esprit : la poussière, le marché, les cérémonies. J'ai voulu que l'album sente ça. »\n\nDouze titres, trois ans de travail, des sessions enregistrées entre Korhogo, Abidjan et Paris. La kora reste au centre, mais elle dialogue avec des boîtes à rythmes et des nappes de synthé.\n\nSur la question du streaming, elle est directe : « Avant, pour qu'on t'entende à Abidjan, il fallait un producteur, une télé, des relations. Aujourd'hui, un jeune de Boundiali peut publier depuis sa chambre. C'est une révolution, mais il faut que l'argent revienne aux artistes. »\n\nUne tournée est annoncée : Bamako, Ouagadougou, Dakar, puis le Palais de la Culture d'Abidjan en avril.`,
    views: 9200,
    published: "2026-02-08T08:00:00Z",
  },
  {
    title: "Nouchi Boyz : le rap d'Abobo exporte son argot",
    slug: "nouchi-boyz-rap-abobo",
    category: "Sorties",
    author: "Yao Serge",
    cover: img(12850585, 1400, 800),
    excerpt: "Cinq freestales tournés en une nuit, 1,7 million de vues : le collectif redéfinit le rap ivoirien.",
    content: `« Rue Princesse » n'était pas censé être un single. C'était une vidéo de plus, tournée à 3 heures du matin avec un téléphone et une enceinte Bluetooth.\n\nLe collectif Nouchi Boyz, quatre MCs et un producteur, a construit sa notoriété sur ces freestyles publiés sans filtre. Le vocabulaire nouchi — cet argot abidjanais né dans les quartiers populaires — y devient une signature internationale : on reprend « enjailler », « brailler », « gbaka » à Cotonou, Kinshasa ou Montréal.\n\nL'EP « Rue Princesse Freestyle » compile cinq de ces sessions, remixées et masterisées. Il entre directement à la deuxième place du Top Maniguade.\n\nProchaine étape : une tournée des villes de l'intérieur et un album prévu pour la saison sèche.`,
    views: 7600,
    published: "2026-01-28T18:00:00Z",
  },
  {
    title: "Mobile Money et streaming : comment les fans ivoiriens paient la musique",
    slug: "mobile-money-streaming-cote-divoire",
    category: "Industrie",
    author: "Konan Éric",
    cover: img(30542032, 1400, 800),
    excerpt: "Wave, Orange Money, MTN MoMo : le paiement mobile change la donne pour les artistes locaux.",
    content: `En Côte d'Ivoire, la carte bancaire reste marginale. Le téléphone, lui, est partout. Cette réalité façonne la manière dont la musique est consommée et monétisée.\n\nLes transferts Mobile Money représentent aujourd'hui l'essentiel des paiements numériques du pays, avec des frais très bas et une adoption massive chez les moins de trente ans — précisément le cœur de cible du streaming musical.\n\nPour une plateforme locale, l'enjeu est clair : proposer un abonnement à quelques centaines de francs CFA, payable en une transaction depuis n'importe quel téléphone, y compris sur des appareils d'entrée de gamme avec une connexion 3G intermittente.\n\nC'est tout l'objectif de la Version 2 de Maniguadebaby : intégration Wave, Orange Money, MTN MoMo et Moov Money, avec des formules journalières, hebdomadaires et mensuelles.\n\nPour les artistes, la promesse est double : une rémunération transparente, suivie en temps réel, et un accès direct à leur communauté sans intermédiaire.`,
    views: 11200,
    published: "2026-01-19T07:30:00Z",
  },
  {
    title: "Zouglou : Petit Yacé raconte la ville dans « Gbaka Story »",
    slug: "petit-yace-gbaka-story",
    category: "Chroniques",
    author: "Fatou Bamba",
    cover: img(7315515, 1400, 800),
    excerpt: "Un EP de six titres qui transforme les trajets en minibus en bande-son nationale.",
    content: `Le zouglou a toujours été une musique de témoignage. Petit Yacé s'inscrit dans cette lignée avec un EP entier consacré aux transports abidjanais.\n\n« Le gbaka, c'est la Côte d'Ivoire en miniature, raconte-t-il. Tout le monde s'y croise : le ministre, l'apprenti, l'étudiante, le vendeur. C'est là que j'ai appris à observer. »\n\nSix titres, dont « Facture pas payée » devenu l'hymne ironique des fins de mois difficiles. Les arrangements restent sobres : guitare, percussions, chœurs, et une voix qui parle plus qu'elle ne chante.\n\nLe succès est au rendez-vous : plus d'un million d'écoutes et des concerts complets au Palais de la Culture pour la sortie physique de l'EP.`,
    views: 5400,
    published: "2026-01-06T12:00:00Z",
  },
  {
    title: "Gospel ivoirien : Sista Grâce remplit le Palais de la Culture",
    slug: "sista-grace-palais-culture",
    category: "Live",
    author: "Rédaction Maniguadebaby",
    cover: img(18615331, 1400, 800),
    excerpt: "Un concert de trois heures, une chorale de quarante voix et un public debout.",
    content: `Il fallait arriver tôt. Dès 17 heures, les files d'attente s'étiraient autour du Palais de la Culture de Treichville.\n\nSista Grâce a livré un concert-fleuve, de « Lumière de Marcory » aux classiques de la chorale qui l'a vue débuter. L'orgue Hammond, la section de cuivres et quarante choristes ont porté une voix qui ne faiblit jamais.\n\n« Le gospel ici, ce n'est pas un genre parmi d'autres, confie-t-elle. C'est la bande-son de la vie des gens : les mariages, les deuils, les naissances. »\n\nL'album « Lumière de Marcory » se classe parmi les dix écoutes les plus longues de la plateforme : on ne l'écoute pas en passant, on s'y installe.`,
    views: 4100,
    published: "2025-12-12T10:00:00Z",
  },
  {
    title: "Cinq playlists pour découvrir la scène ouest-africaine en 2026",
    slug: "cinq-playlists-scene-ouest-africaine-2026",
    category: "Playlists",
    author: "Konan Éric",
    cover: img(15474702, 1400, 800),
    excerpt: "Sélection de la rédaction : du maquis au salon, le meilleur de la région.",
    content: `La scène ouest-africaine n'a jamais été aussi foisonnante. Voici notre sélection pour s'y retrouver.\n\n1. « Maquis 225 » — le meilleur du couper-décaler actuel, pour les soirées qui finissent tard.\n2. « Kora & Néon » — la fusion mandingue-électro portée par Safi Diomandé et Kora Bamba.\n3. « Nouchi Only » — rap et afro-drill en argot abidjanais, pour les amateurs de flows serrés.\n4. « Dimanche matin » — gospel et titres apaisés à écouter sans modération.\n5. « Bassam Roots » — reggae et musique consciente, idéale pour la route de l'océan.\n\nChaque playlist est mise à jour toutes les semaines par la rédaction. N'hésitez pas à nous signaler vos coups de cœur.`,
    views: 8800,
    published: "2025-12-02T09:00:00Z",
  },
];

const PLAYLISTS = [
  {
    title: "Maquis 225",
    slug: "maquis-225",
    curator: "Rédaction Maniguadebaby",
    cover: img(17416778, 800, 800),
    description: "Le meilleur du couper-décaler et du mapouka pour enjailler la nuit abidjanaise.",
    position: 1,
  },
  {
    title: "Kora & Néon",
    slug: "kora-et-neon",
    curator: "Safi Diomandé",
    cover: img(31483492, 800, 800),
    description: "Tradition mandingue meets production électronique : la fusion ouest-africaine.",
    position: 2,
  },
  {
    title: "Nouchi Only",
    slug: "nouchi-only",
    curator: "Nouchi Boyz",
    cover: img(12850585, 800, 800),
    description: "Rap, drill et ego-trip en argot d'Abidjan. Volume à fond.",
    position: 3,
  },
  {
    title: "Dimanche matin",
    slug: "dimanche-matin",
    curator: "Sista Grâce",
    cover: img(5500461, 800, 800),
    description: "Gospel, douceur et louanges pour démarrer la semaine en paix.",
    position: 4,
  },
];

const BANNERS = [
  {
    title: "Allo Coco",
    subtitle: "Aya Koffi · le tube qui fait vibrer Cocody",
    tag: "N°1 du Top Maniguade",
    imageUrl: img(8043841, 1600, 900),
    ctaLabel: "Écouter le single",
    ctaHref: "/morceaux/allo-coco",
    trackSlug: "allo-coco",
    position: 1,
  },
  {
    title: "Kalou Glissé",
    subtitle: "DJ Kalou Star · l'album du mouvement",
    tag: "Nouvel album",
    imageUrl: img(9008889, 1600, 900),
    ctaLabel: "Lancer l'album",
    ctaHref: "/albums/kalou-glisse",
    trackSlug: "kalou-glisse-single",
    position: 2,
  },
  {
    title: "Ferké",
    subtitle: "Safi Diomandé · kora, poussière et électronique",
    tag: "Coup de cœur",
    imageUrl: img(35981469, 1600, 900),
    ctaLabel: "Découvrir l'artiste",
    ctaHref: "/artistes/safi-diomande",
    trackSlug: "ferke-sunrise",
    position: 3,
  },
];

let seedPromise: Promise<boolean> | null = null;

/** Lance le jeu de démonstration une seule fois par processus, sans erreur bloquante. */
export function ensureSeeded(): Promise<boolean> {
  if (!seedPromise) {
    seedPromise = seedIfEmpty()
      .then(async (result) => {
        await ensureDemoProfiles();
        return result.seeded;
      })
      .catch((error) => {
        seedPromise = null;
        throw error;
      });
  }
  return seedPromise;
}

/** Comptes de démonstration (fan + admin) — idempotent, exécutable à chaud. */
export async function ensureDemoProfiles() {
  const [existing] = await db.select({ value: count() }).from(profiles);
  if ((existing?.value ?? 0) > 0) return;
  await db.insert(profiles).values([
    {
      email: fanCredentials.email,
      passwordHash: await hashPassword(fanCredentials.password),
      displayName: "Kouassi Fan",
      role: "fan",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      bio: "Auditeur assidu du Top Maniguade, présent dans tous les maquis de Yopougon.",
    },
    {
      email: seedCredentials.email,
      passwordHash: await hashPassword(seedCredentials.password),
      displayName: "Direction Maniguadebaby",
      role: "admin",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      isVerified: true,
    },
  ]);
}

export const fanCredentials = {
  email: process.env.FAN_EMAIL || "fan@maniguadebaby.ci",
  password: process.env.FAN_PASSWORD || "Fan2026",
};

export async function seedIfEmpty() {
  const [existing] = await db.select({ value: count() }).from(artists);
  if ((existing?.value ?? 0) > 0) return { seeded: false as const };

  const genreRows = await db.insert(genres).values(GENRES).returning();
  const genreBySlug = new Map(genreRows.map((g) => [g.slug, g]));

  const artistRows = await db.insert(artists).values(ARTISTS).returning();
  const artistBySlug = new Map(artistRows.map((a) => [a.slug, a]));

  const albumRows = await db
    .insert(albums)
    .values(
      ALBUMS.map((a) => ({
        artistId: artistBySlug.get(a.artist)!.id,
        title: a.title,
        slug: a.slug,
        description: a.description,
        coverUrl: a.cover,
        albumType: a.type,
        releaseDate: a.release,
      })),
    )
    .returning();
  const albumBySlug = new Map(albumRows.map((a) => [a.slug, a]));

  const trackRows = await db
    .insert(tracks)
    .values(
      TRACKS.map((t) => ({
        title: t.title,
        slug: t.slug,
        artistId: artistBySlug.get(t.artist)!.id,
        albumId: t.album ? albumBySlug.get(t.album)?.id ?? null : null,
        genreId: genreBySlug.get(t.genre)?.id ?? null,
        audioUrl: audio(t.n),
        coverUrl: t.cover,
        durationSeconds: t.duration,
        plays: t.plays,
        likes: Math.round(t.plays / 18),
        releaseDate: t.release,
        featured: t.featured ?? false,
        trending: t.trending ?? false,
        explicit: t.explicit ?? false,
        position: t.position,
      })),
    )
    .returning();
  const trackBySlug = new Map(trackRows.map((t) => [t.slug, t]));

  await db.insert(videos).values(
    VIDEOS.map((v) => ({
      title: v.title,
      slug: v.slug,
      artistId: artistBySlug.get(v.artist)!.id,
      trackId: v.track ? trackBySlug.get(v.track)?.id ?? null : null,
      videoUrl: v.url,
      thumbnailUrl: v.thumb,
      description: v.description,
      durationSeconds: v.duration,
      views: v.views,
      releaseDate: v.release,
      featured: v.featured ?? false,
    })),
  );

  await db.insert(articles).values(
    ARTICLES.map((a) => ({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: a.content,
      coverUrl: a.cover,
      author: a.author,
      category: a.category,
      views: a.views,
      status: "published",
      publishedAt: new Date(a.published),
    })),
  );

  const playlistRows = await db
    .insert(playlists)
    .values(
      PLAYLISTS.map((p) => ({
        title: p.title,
        slug: p.slug,
        description: p.description,
        coverUrl: p.cover,
        curator: p.curator,
        position: p.position,
      })),
    )
    .returning();

  const playlistAssignments: Record<string, string[]> = {
    "maquis-225": ["kalou-glisse-single", "maquis-vip", "mapouka-2-0", "tambour-parleur", "dedicace-a-tantie", "gagnoa-city"],
    "kora-et-neon": ["ferke-sunrise", "kora-de-mon-pere", "bandama-blues", "balafon-nights", "senoufo-flow", "allo-coco-remix"],
    "nouchi-only": ["rue-princesse", "abobo-drill", "nouchi-dictionnaire", "cocody-nights", "maquis-vip"],
    "dimanche-matin": ["lumiere-de-marcory-track", "merci-papa", "bassam-sun", "terre-rouge", "ferke-sunrise"],
  };

  for (const playlist of playlistRows) {
    const slugs = playlistAssignments[playlist.slug] ?? [];
    const values = slugs
      .map((slug, index) => {
        const track = trackBySlug.get(slug);
        if (!track) return null;
        return { playlistId: playlist.id, trackId: track.id, position: index + 1 };
      })
      .filter((v): v is { playlistId: string; trackId: string; position: number } => v !== null);
    if (values.length > 0) await db.insert(playlistTracks).values(values);
  }

  await db.insert(banners).values(
    BANNERS.map((b) => ({
      title: b.title,
      subtitle: b.subtitle,
      tag: b.tag,
      imageUrl: b.imageUrl,
      ctaLabel: b.ctaLabel,
      ctaHref: b.ctaHref,
      trackId: b.trackSlug ? trackBySlug.get(b.trackSlug)?.id ?? null : null,
      active: true,
      position: b.position,
    })),
  );

  return { seeded: true as const, artists: artistRows.length, tracks: trackRows.length };
}

export const seedCredentials = {
  email: process.env.ADMIN_EMAIL || "admin@maniguadebaby.ci",
  password: process.env.ADMIN_PASSWORD || "Maniga2026",
};
