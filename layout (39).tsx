import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maniguadebaby.com"),
  title: {
    default: "Maniguadebaby — La référence de la musique d'Afrique de l'Ouest",
    template: "%s · Maniguadebaby",
  },
  description:
    "Maniguadebaby, la vitrine mondiale des artistes d'Afrique de l'Ouest : Mandingue, Mbalax, Zouglou, Coupé-Décalé, Highlife & Afro Trap. Streaming, clips, booking et actualités — Sénégal, Mali, Côte d'Ivoire, Guinée et au-delà.",
  keywords: [
    "streaming musique ivoirienne",
    "couper-décaler",
    "zouglou",
    "rap ivoire",
    "musique Afrique de l'Ouest",
    "clips Abidjan",
    "Maniguadebaby",
  ],
  openGraph: {
    title: "Maniguadebaby — La référence de la musique d'Afrique de l'Ouest",
    description:
      "Streaming, clips, booking et actualités : Sénégal, Mali, Côte d'Ivoire, Guinée et au-delà.",
    type: "website",
    url: "https://www.maniguadebaby.com",
    locale: "fr_CI",
    siteName: "Maniguadebaby",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maniguadebaby",
    description: "La musique d'Afrique de l'Ouest, en continu.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23FFC53D'/%3E%3Cstop offset='45%25' stop-color='%23FF6A1A'/%3E%3Cstop offset='100%25' stop-color='%2312B877'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='24' cy='24' r='24' fill='url(%23g)'/%3E%3Cpath d='M11 33V16.6c0-1 1.2-1.5 1.9-.8l5.6 5.6 4.6-6.1c.5-.7 1.6-.5 1.8.3l2.4 9.6 3.6-4.4c.6-.7 1.8-.3 1.8.6V33' fill='none' stroke='%23160c10' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"
        />
      </head>
      <body className="min-h-screen bg-ink-950 font-body text-cream antialiased">{children}</body>
    </html>
  );
}
