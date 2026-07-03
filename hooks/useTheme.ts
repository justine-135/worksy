"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  applyTheme,
  isTheme,
  Theme,
  THEME_STORAGE_KEY,
} from "@/lib/theme/theme";

// Stable no-op subscribe for the "is hydrated" store below.
const emptySubscribe = () => () => {};

/**
 * Reads/writes the persisted theme and keeps <html> in sync.
 *
 * `mounted` guards against hydration mismatch: the server can't know the
 * localStorage/OS choice, so theme-dependent UI (e.g. the active toggle) should
 * only render once mounted on the client.
 */
export function useTheme() {
  // Lazy, SSR-safe initializer: reads the saved theme on the client's first
  // render. The server always yields "system"; theme-dependent UI is gated
  // behind `mounted` so hydration still matches.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "system";
  });

  // `false` during SSR + first hydration render, `true` afterward — the
  // idiomatic "is client" signal without a setState-in-effect.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // When following the OS, re-apply if the OS preference flips live.
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);

    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  return { theme, setTheme, mounted };
}
