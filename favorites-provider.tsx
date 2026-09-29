"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type FavoriteKey = string;

type FavoritesContextValue = {
  ready: boolean;
  isFavorite: (itemType: string, itemId: string) => boolean;
  toggleFavorite: (itemType: string, itemId: string) => Promise<void>;
  keys: FavoriteKey[];
  count: number;
  pending: FavoriteKey | null;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<FavoriteKey[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<FavoriteKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/favorites", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as { favorites: string[] };
        if (!cancelled) setKeys(data.favorites ?? []);
      } catch {
        /* silencieux : les favoris restent utilisables en mémoire */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorite = useCallback(
    (itemType: string, itemId: string) => keys.includes(`${itemType}:${itemId}`),
    [keys],
  );

  const toggleFavorite = useCallback(
    async (itemType: string, itemId: string) => {
      const key = `${itemType}:${itemId}`;
      setPending(key);
      const exists = keys.includes(key);
      setKeys((prev) => (exists ? prev.filter((k) => k !== key) : [...prev, key]));
      try {
        await fetch("/api/favorites", {
          method: exists ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ itemType, itemId }),
        });
      } catch {
        setKeys((prev) => (exists ? [...prev, key] : prev.filter((k) => k !== key)));
      } finally {
        setPending(null);
      }
    },
    [keys],
  );

  const value = useMemo(
    () => ({ ready, isFavorite, toggleFavorite, keys, count: keys.length, pending }),
    [ready, isFavorite, toggleFavorite, keys, pending],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites doit être utilisé dans FavoritesProvider");
  }
  return ctx;
}
