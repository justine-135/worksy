// Lightweight, dependency-free theming. The whole color system is CSS-variable
// driven (see app/globals.css), so switching themes is just toggling a `.dark`
// class on <html> — every token-based utility recolors automatically.

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "worksy-theme";

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

// Resolves whether the effective theme is dark (following the OS when "system").
export function resolveIsDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;

  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// Toggles the `.dark` class on <html> to match the given theme.
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", resolveIsDark(theme));
}

// Inline, self-executing script injected into <head> so the correct theme is
// applied BEFORE first paint — prevents a flash of light mode on load/refresh.
export const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;
