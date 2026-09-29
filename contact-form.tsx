"use client";

import { useState } from "react";
import { ArrowRightIcon, SparkIcon } from "@/components/icons";

type Props = {
  kind: "booking" | "contact";
  title: string;
  description: string;
  cta: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm({ kind, title, description, cta }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      kind,
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      organization: String(form.get("organization") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      artist: String(form.get("artist") ?? "").trim(),
      eventDate: String(form.get("eventDate") ?? "").trim(),
      budget: String(form.get("budget") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };

    if (payload.name.length < 2) {
      setError("Indiquez votre nom pour que l'équipe puisse vous répondre.");
      setState("error");
      return;
    }
    if (!EMAIL_REGEX.test(payload.email)) {
      setError("Adresse email invalide.");
      setState("error");
      return;
    }

    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Envoi impossible, réessayez.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Serveur injoignable, réessayez.");
      setState("error");
    }
  }

  const field =
    "mt-2 w-full rounded-xl border border-white/12 bg-ink-950/70 px-4 py-3 text-sm text-cream outline-none transition focus:border-mango-500/70 placeholder:text-cream-mute/60";
  const label = "text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute";

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-ink-900/70 p-6 md:p-8">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-mango-400">
        <SparkIcon width={13} height={13} />
        {kind === "booking" ? "Demande de booking" : "Écrire à l'équipe"}
      </p>
      <h2 className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight text-cream">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream-dim">{description}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className={label} htmlFor={`${kind}-name`}>
            Nom complet
          </label>
          <input id={`${kind}-name`} name="name" required className={field} placeholder="Votre nom" />
        </div>
        <div className="sm:col-span-1">
          <label className={label} htmlFor={`${kind}-email`}>
            Email
          </label>
          <input id={`${kind}-email`} name="email" type="email" required className={field} placeholder="vous@email.ci" />
        </div>

        {kind === "booking" ? (
          <>
            <div>
              <label className={label} htmlFor="organization">
                Organisation / événement
              </label>
              <input id="organization" name="organization" className={field} placeholder="Festival, label, salle…" />
            </div>
            <div>
              <label className={label} htmlFor="phone">
                Téléphone / WhatsApp
              </label>
              <input id="phone" name="phone" className={field} placeholder="+225 …" />
            </div>
            <div>
              <label className={label} htmlFor="artist">
                Artiste souhaité
              </label>
              <input id="artist" name="artist" className={field} placeholder="Ex : Ndèye Fatou" />
            </div>
            <div>
              <label className={label} htmlFor="eventDate">
                Date de l&apos;événement
              </label>
              <input id="eventDate" name="eventDate" className={field} placeholder="12 – 14 juin 2026" />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="budget">
                Budget indicatif (FCFA)
              </label>
              <input id="budget" name="budget" className={field} placeholder="Ex : 2 500 000 FCFA" />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <label className={label} htmlFor="organization">
              Organisation (facultatif)
            </label>
            <input id="organization" name="organization" className={field} placeholder="Label, média, fan club…" />
          </div>
        )}

        <div className="sm:col-span-2">
          <label className={label} htmlFor={`${kind}-message`}>
            Votre message
          </label>
          <textarea
            id={`${kind}-message`}
            name="message"
            rows={5}
            className={`${field} leading-relaxed`}
            placeholder="Décrivez votre projet, vos délais, vos attentes…"
          />
        </div>
      </div>

      {state === "done" ? (
        <p className="mt-6 flex items-start gap-2 rounded-xl border border-baobab-500/40 bg-baobab-500/10 px-4 py-3.5 text-sm text-baobab-400">
          <SparkIcon width={15} height={15} className="mt-0.5 shrink-0" />
          Message bien reçu. L&apos;équipe Maniguadebaby revient vers vous sous 48 h ouvrées.
        </p>
      ) : (
        <>
          {error && (
            <p className="mt-6 rounded-xl border border-mango-500/40 bg-mango-500/10 px-4 py-3 text-sm text-mango-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={state === "loading"}
            className="mt-6 flex items-center gap-2.5 rounded-full bg-gradient-to-b from-[#FFE9B3] via-[#F2B705] to-[#D99B00] px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-[#241900] shadow-[0_16px_44px_-16px_rgba(242,183,5,0.85)] transition hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            {state === "loading" ? "Envoi en cours…" : cta}
            {state !== "loading" && <ArrowRightIcon width={15} height={15} />}
          </button>
        </>
      )}
    </form>
  );
}
