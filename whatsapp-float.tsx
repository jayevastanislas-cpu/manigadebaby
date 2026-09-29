"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/icons";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

function WhatsAppIcon({ width = 26, height = 26 }: { width?: number; height?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a9.83 9.83 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86C21.9 6.42 17.47 2 12.04 2Zm5.76 14.03c-.24.68-1.4 1.32-1.93 1.37-.5.05-.95.23-3.2-.66-2.7-1.06-4.42-3.77-4.55-3.95-.13-.18-1.08-1.43-1.08-2.73 0-1.3.68-1.94.92-2.2.24-.27.53-.34.7-.34h.5c.16 0 .38-.06.6.45.23.54.77 1.87.84 2 .07.13.11.29.02.47-.09.18-.13.29-.26.44l-.39.46c-.13.13-.26.28-.11.54.15.27.66 1.09 1.42 1.77.98.87 1.8 1.14 2.06 1.27.26.13.41.11.56-.07.15-.18.65-.76.83-1.02.17-.27.35-.22.58-.13.24.09 1.5.71 1.76.84.26.13.43.2.5.31.06.11.06.64-.18 1.32Z" />
    </svg>
  );
}

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const href = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        "Bonjour Maniguadebaby, je souhaite en savoir plus sur vos artistes.",
      )}`
    : `https://wa.me/?text=${encodeURIComponent("Bonjour Maniguadebaby, je souhaite en savoir plus sur vos artistes.")}`;

  return (
    <div className="fixed bottom-[92px] right-4 z-[65] flex flex-col items-end gap-3 md:bottom-[108px] md:right-6">
      {open && (
        <div className="animate-pop w-[260px] overflow-hidden rounded-2xl border border-baobab-500/40 bg-ink-900 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between bg-baobab-500/15 px-4 py-3">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-baobab-400">
              <WhatsAppIcon width={13} height={13} /> WhatsApp
            </p>
            <button onClick={() => setOpen(false)} className="text-cream-mute transition hover:text-cream" aria-label="Fermer">
              <CloseIcon width={14} height={14} />
            </button>
          </div>
          <div className="px-4 py-4">
            <p className="text-[13px] leading-relaxed text-cream-dim">
              Une question sur un artiste, une date de concert ou un partenariat ? Écrivez-nous directement.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-baobab-500 px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-950 transition hover:brightness-110"
            >
              Démarrer la discussion
            </a>
            <p className="mt-3 text-center text-[11px] text-cream-mute">Réponse sous 24 h · 8h – 20h (GMT)</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-baobab-500 p-3.5 text-ink-950 shadow-[0_16px_40px_-12px_rgba(47,191,113,0.9)] transition hover:scale-105 active:scale-95"
        aria-label="Ouvrir la discussion WhatsApp"
        style={{ height: 54, width: 54 }}
      >
        <WhatsAppIcon />
      </button>
    </div>
  );
}
