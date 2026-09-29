"use client";

import { useMemo, useState } from "react";
import type { EntityConfig, FieldDef } from "@/lib/admin-config";
import {
  CloseIcon,
  EditIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  VerifiedIcon,
} from "@/components/icons";
import { formatCompactNumber, formatDate } from "@/lib/format";

export type Row = Record<string, unknown>;
export type OptionItem = { id: string | number; label: string };
export type OptionsMap = {
  artists: OptionItem[];
  albums: OptionItem[];
  genres: OptionItem[];
  tracks: OptionItem[];
};

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function initialForm(config: EntityConfig, row?: Row | null): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (row && field.name in row) {
      const value = row[field.name];
      if (field.type === "datetime" && value) {
        form[field.name] = stringify(value).slice(0, 16);
      } else if (field.type === "date") {
        form[field.name] = stringify(value).slice(0, 10);
      } else if (field.type === "multiselect") {
        form[field.name] = Array.isArray(value) ? value.map((v) => String(v)) : [];
      } else if (field.type === "boolean") {
        form[field.name] = Boolean(value);
      } else {
        form[field.name] = value === null || value === undefined ? "" : stringify(value);
      }
    } else if (field.type === "boolean") {
      form[field.name] = Boolean(field.defaultValue ?? false);
    } else if (field.type === "multiselect") {
      form[field.name] = [];
    } else {
      form[field.name] = field.defaultValue ?? "";
    }
  }
  return form;
}

function FieldControl({
  field,
  value,
  onChange,
  options,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  options: OptionsMap;
}) {
  const common =
    "w-full rounded-xl border border-white/12 bg-ink-950/70 px-3.5 py-2.5 text-sm text-cream outline-none transition focus:border-mango-500/70";

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className={`${common} min-h-[92px] leading-relaxed`}
          value={stringify(value)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "richtext":
      return (
        <textarea
          className={`${common} min-h-[260px] leading-relaxed`}
          value={stringify(value)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className={common}
          value={stringify(value)}
          min={field.min}
          max={field.max}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "boolean":
      return (
        <button
          type="button"
          onClick={() => onChange(!Boolean(value))}
          className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition ${
            value ? "border-baobab-500/60 bg-baobab-500/12 text-baobab-400" : "border-white/12 bg-ink-950/70 text-cream-mute"
          }`}
          aria-pressed={Boolean(value)}
        >
          {value ? "Activé" : "Désactivé"}
          <span
            className={`relative h-5 w-9 rounded-full transition ${value ? "bg-baobab-500" : "bg-white/15"}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink-950 transition-all ${
                value ? "left-[18px]" : "left-0.5"
              }`}
            />
          </span>
        </button>
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(stringify(value)) ? stringify(value) : "#FF6A1A"}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 w-14 cursor-pointer rounded-lg border border-white/12 bg-ink-950/70 p-1"
            aria-label={field.label}
          />
          <input className={common} value={stringify(value)} onChange={(event) => onChange(event.target.value)} />
        </div>
      );
    case "date":
      return <input type="date" className={common} value={stringify(value).slice(0, 10)} onChange={(event) => onChange(event.target.value)} />;
    case "datetime":
      return (
        <input
          type="datetime-local"
          className={common}
          value={stringify(value).slice(0, 16)}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "select": {
      const sourceOptions = field.source ? options[field.source] : [];
      const choices = field.options ?? sourceOptions.map((option) => ({ value: String(option.id), label: option.label }));
      return (
        <select className={common} value={stringify(value)} onChange={(event) => onChange(event.target.value)}>
          <option value="" className="bg-ink-900">
            {field.required ? "— Sélectionner —" : "— Aucun —"}
          </option>
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value} className="bg-ink-900">
              {choice.label}
            </option>
          ))}
        </select>
      );
    }
    case "multiselect": {
      const sourceOptions = field.source ? options[field.source] : [];
      const selected = Array.isArray(value) ? value.map((v) => String(v)) : [];
      const visible = sourceOptions;
      return (
        <div className="rounded-xl border border-white/12 bg-ink-950/70">
          <div className="hide-scrollbar max-h-64 overflow-y-auto p-2">
            {visible.map((option) => {
              const checked = selected.includes(String(option.id));
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    checked ? "bg-mango-500/15 text-mango-400" : "text-cream-dim hover:bg-white/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                      onChange(event.target.checked ? [...selected, String(option.id)] : selected.filter((v) => v !== String(option.id)))
                    }
                    className="h-4 w-4 accent-mango-500"
                  />
                  <span className="truncate">{option.label}</span>
                </label>
              );
            })}
            {visible.length === 0 && <p className="px-3 py-4 text-sm text-cream-mute">Aucun élément disponible.</p>}
          </div>
          <p className="border-t border-white/10 px-3 py-2 text-[11px] uppercase tracking-wider text-cream-mute">
            {selected.length} sélectionné{selected.length > 1 ? "s" : ""} · l'ordre suit la sélection
          </p>
        </div>
      );
    }
    default:
      return (
        <input
          type={field.type === "url" ? "url" : "text"}
          className={common}
          value={stringify(value)}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

export function EntityManager({
  config,
  initialItems,
  options,
}: {
  config: EntityConfig;
  initialItems: Row[];
  options: OptionsMap;
}) {
  const [items, setItems] = useState<Row[]>(initialItems);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busyRow, setBusyRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((row) =>
      Object.values(row).some((value) => stringify(value).toLowerCase().includes(term)),
    );
  }, [items, query]);

  function openCreate() {
    setEditingId(null);
    setForm(initialForm(config));
    setError(null);
    setFormOpen(true);
  }

  function openEdit(row: Row) {
    setEditingId(String(row.id));
    setForm(initialForm(config, row));
    setError(null);
    setFormOpen(true);
  }

  function notify(message: string, kind: "ok" | "error" = "ok") {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 3600);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = form[field.name];
      if (field.type === "multiselect") {
        payload[field.name] = Array.isArray(value) ? value.map((v) => String(v)) : [];
      } else if (field.type === "datetime") {
        payload[field.name] = value ? new Date(String(value)).toISOString() : null;
      } else {
        payload[field.name] = value;
      }
    }
    try {
      const res = await fetch(
        editingId ? `/api/admin/${config.key}/${editingId}` : `/api/admin/${config.key}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json()) as { item?: Row; error?: string };
      if (!res.ok || !data.item) {
        setError(data.error ?? "Enregistrement impossible.");
        setSaving(false);
        return;
      }
      setItems((prev) =>
        editingId ? prev.map((row) => (String(row.id) === editingId ? data.item! : row)) : [data.item!, ...prev],
      );
      setFormOpen(false);
      setSaving(false);
      notify(editingId ? `${config.label} mis à jour.` : `${config.label} créé.`);
    } catch {
      setError("Erreur réseau pendant l'enregistrement.");
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    const id = String(row.id);
    setBusyRow(id);
    try {
      const res = await fetch(`/api/admin/${config.key}/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        notify(data.error ?? "Suppression impossible.", "error");
      } else {
        setItems((prev) => prev.filter((item) => String(item.id) !== id));
        notify(`${config.label} supprimé.`);
      }
    } catch {
      notify("Erreur réseau pendant la suppression.", "error");
    } finally {
      setBusyRow(null);
      setConfirmDelete(null);
    }
  }

  function cellValue(field: FieldDef | undefined, row: Row, column: string) {
    const value = row[column];
    const definition = field ?? config.fields.find((item) => item.name === column);
    if (column === config.imageField && typeof value === "string" && value) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={value} alt="" className="h-11 w-11 rounded-lg object-cover ring-1 ring-white/10" />;
    }
    if (definition?.type === "boolean") {
      return value ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-baobab-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-baobab-400">
          <VerifiedIcon width={12} height={12} /> oui
        </span>
      ) : (
        <span className="text-[12px] text-cream-mute">—</span>
      );
    }
    if (definition?.type === "select" && definition.source) {
      const found = options[definition.source]?.find((option) => String(option.id) === String(value));
      return <span className="text-[13px] text-cream-dim">{found?.label ?? "—"}</span>;
    }
    if (definition?.type === "number") {
      return <span className="text-[13px] tabular-nums text-cream-dim">{formatCompactNumber(Number(value ?? 0))}</span>;
    }
    if (definition?.type === "date") {
      return <span className="text-[13px] text-cream-dim">{formatDate(stringify(value))}</span>;
    }
    if (definition?.type === "datetime") {
      return <span className="text-[13px] text-cream-dim">{formatDate(stringify(value))}</span>;
    }
    if (definition?.type === "url") {
      return (
        <a
          href={stringify(value)}
          target="_blank"
          rel="noreferrer noopener"
          className="block max-w-[180px] truncate text-[12px] text-baobab-400 hover:underline"
        >
          {stringify(value) || "—"}
        </a>
      );
    }
    if (definition?.type === "color") {
      return (
        <span className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full ring-1 ring-white/20" style={{ background: stringify(value) }} />
          <span className="text-[12px] uppercase text-cream-mute">{stringify(value)}</span>
        </span>
      );
    }
    return <span className="block max-w-[260px] truncate text-[13px] text-cream-dim">{stringify(value) || "—"}</span>;
  }

  return (
    <div className="min-w-0 flex-1">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mango-400">Back-office</p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,3rem)] uppercase leading-none text-cream">
            {config.labelPlural}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-cream-dim">{config.description}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-5 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.03] active:scale-95"
        >
          <PlusIcon width={15} height={15} /> Nouveau {config.label.toLowerCase()}
        </button>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-white/12 bg-ink-950/60 px-4 py-2.5 focus-within:border-mango-500/60">
          <SearchIcon width={15} height={15} className="text-cream-mute" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Filtrer ${filtered.length} ${config.labelPlural.toLowerCase()}…`}
            className="min-w-0 flex-1 bg-transparent text-sm text-cream outline-none placeholder:text-cream-mute/70"
          />
        </div>
        <p className="text-[12px] uppercase tracking-[0.16em] text-cream-mute">
          {filtered.length} / {items.length} éléments
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
        <div className="hide-scrollbar overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                {config.columns.map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cream-mute"
                  >
                    {config.fields.find((field) => field.name === column)?.label ?? column}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-cream-mute">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const id = String(row.id);
                return (
                  <tr key={id} className="border-b border-white/5 transition hover:bg-white/[0.04]">
                    {config.columns.map((column) => (
                      <td key={column} className="px-4 py-3 align-middle">
                        {column === config.titleField ? (
                          <span className="block max-w-[280px] truncate font-heading text-sm font-bold text-cream">
                            {stringify(row[column]) || "—"}
                          </span>
                        ) : (
                          cellValue(undefined, row, column)
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {confirmDelete === id ? (
                          <>
                            <button
                              onClick={() => remove(row)}
                              disabled={busyRow === id}
                              className="rounded-full bg-mango-600/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-950 transition hover:brightness-110 disabled:opacity-60"
                            >
                              {busyRow === id ? "…" : "Confirmer"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cream-dim transition hover:text-cream"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(row)}
                              className="rounded-full border border-white/12 p-2 text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
                              aria-label={`Modifier ${stringify(row[config.titleField])}`}
                            >
                              <EditIcon width={15} height={15} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(id)}
                              className="rounded-full border border-white/12 p-2 text-cream-dim transition hover:border-mango-500/60 hover:text-mango-400"
                              aria-label={`Supprimer ${stringify(row[config.titleField])}`}
                            >
                              <TrashIcon width={15} height={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={config.columns.length + 1} className="px-4 py-16 text-center text-sm text-cream-mute">
                    Aucun élément. Créez votre premier {config.label.toLowerCase()} ou modifiez le filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panneau de formulaire */}
      {formOpen && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <button
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={() => setFormOpen(false)}
            aria-label="Fermer le formulaire"
          />
          <div className="animate-pop relative flex h-full w-full max-w-2xl flex-col border-l border-white/12 bg-ink-900">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-mango-400">
                  {editingId ? "Modification" : "Création"}
                </p>
                <h2 className="mt-1 font-heading text-xl font-extrabold text-cream">
                  {editingId ? stringify(form[config.titleField]) || config.label : `Nouveau ${config.label.toLowerCase()}`}
                </h2>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-full border border-white/12 p-2 text-cream-dim transition hover:text-cream"
                aria-label="Fermer"
              >
                <CloseIcon width={16} height={16} />
              </button>
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {config.fields.map((field) => (
                  <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
                    <label
                      htmlFor={`field-${field.name}`}
                      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cream-mute"
                    >
                      {field.label}
                      {field.required && <span className="text-mango-500">*</span>}
                    </label>
                    <div className="mt-2" id={`field-${field.name}`}>
                      <FieldControl
                        field={field}
                        value={form[field.name]}
                        options={options}
                        onChange={(value) => setForm((prev) => ({ ...prev, [field.name]: value }))}
                      />
                    </div>
                    {field.help && <p className="mt-1.5 text-[11px] text-cream-mute/80">{field.help}</p>}
                  </div>
                ))}
              </div>

              {error && (
                <p className="mt-5 rounded-xl border border-mango-500/40 bg-mango-500/10 px-4 py-3 text-sm text-mango-400">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-cream-mute">
                Les changements sont visibles immédiatement sur le site.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormOpen(false)}
                  className="rounded-full border border-white/15 px-5 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-cream-dim transition hover:text-cream"
                >
                  Annuler
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-full bg-gradient-to-br from-mango-400 to-mango-600 px-6 py-2.5 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-ink-950 transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`animate-pop fixed bottom-6 right-6 z-[95] rounded-xl border px-5 py-3.5 text-sm shadow-2xl backdrop-blur ${
            toast.kind === "ok"
              ? "border-baobab-500/50 bg-baobab-500/15 text-baobab-400"
              : "border-mango-500/50 bg-mango-500/15 text-mango-400"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
