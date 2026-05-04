export const COLOR_SCHEME_STORAGE_KEY = "futuremod-color-scheme";

/** Stored preference. Default `dark` — Studio is designed for dark UI; use `system` to follow the OS. */
export type ColorSchemeMode = "dark" | "light" | "system";

export function resolveColorScheme(mode: ColorSchemeMode): "dark" | "light" {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredColorSchemeMode(): ColorSchemeMode {
  try {
    const v = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (v === "dark" || v === "light" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function applyResolvedScheme(resolved: "dark" | "light"): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved === "dark" ? "dark" : "light";
}
