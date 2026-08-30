/**
 * Nom : useTheme.ts
 * Chemin : src/hooks/useTheme.ts
 * Rôle : mode clair/sombre persisté dans localStorage.
 */
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "luma-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as Theme | null;
    const initial: Theme =
      stored ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(initial);
    document.documentElement.dataset["theme"] = initial;
  }, []);

  const apply = useCallback((next: Theme) => {
    setTheme(next);
    document.documentElement.dataset["theme"] = next;
    window.localStorage.setItem(KEY, next);
  }, []);

  return { theme, setTheme: apply, toggle: () => apply(theme === "dark" ? "light" : "dark") };
}
