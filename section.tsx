import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-[1500px] px-4 md:px-6 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  accent = "#FF6A1A",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p
            className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.32em]"
            style={{ color: accent }}
          >
            <span className="h-[2px] w-8 rounded-full" style={{ background: accent }} />
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[clamp(1.9rem,4.4vw,3.2rem)] uppercase leading-[0.95] text-cream">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-dim">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function ViewAllLink({ href, label = "Tout voir" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
    >
      {label}
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </a>
  );
}
