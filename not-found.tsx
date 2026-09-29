import Link from "next/link";
import { LogoMark, DiscIcon, MicIcon, VideoIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_35%,rgba(255,106,26,0.2),transparent_70%)]" />
      <div className="wax-pattern pointer-events-none absolute inset-0 opacity-15" />
      <div className="relative w-full max-w-2xl text-center">
        <LogoMark className="mx-auto h-16 w-16 animate-float" />
        <p className="mt-6 font-display text-[clamp(4.5rem,18vw,10rem)] uppercase leading-none text-cream">404</p>
        <h1 className="mt-2 font-heading text-2xl font-extrabold text-cream md:text-3xl">
          Cette page a quitté le maquis
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-cream-dim">
          Le lien est cassé ou le contenu a été déplacé. Reprenez la lecture là où vous l'aviez laissée, ou explorez le
          catalogue Maniguadebaby.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:scale-[1.03]"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/morceaux"
            className="rounded-full border border-white/20 px-6 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-cream transition hover:border-mango-500/60 hover:text-mango-400"
          >
            Voir les morceaux
          </Link>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          {[
            { href: "/decouverte", label: "Découverte par genre", Icon: DiscIcon },
            { href: "/artistes", label: "Annuaire des artistes", Icon: MicIcon },
            { href: "/videos", label: "Clips & sessions", Icon: VideoIcon },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/60 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-mango-500/50"
            >
              <item.Icon width={18} height={18} className="text-mango-500" />
              <span className="font-heading text-[13px] font-bold text-cream">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
