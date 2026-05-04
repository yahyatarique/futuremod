import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyResolvedScheme,
  type ColorSchemeMode,
  COLOR_SCHEME_STORAGE_KEY,
  getStoredColorSchemeMode,
  resolveColorScheme,
} from "./color-scheme";

type ThemeContextValue = {
  /** Stored choice: dark, light, or follow OS */
  mode: ColorSchemeMode;
  /** Effective palette after resolving `system` */
  resolved: "dark" | "light";
  setMode: (mode: ColorSchemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorSchemeMode>(() => getStoredColorSchemeMode());
  const [systemSnapshot, setSystemSnapshot] = useState<"dark" | "light">(() =>
    typeof window !== "undefined" ? resolveColorScheme("system") : "dark"
  );

  const resolved: "dark" | "light" =
    mode === "system" ? systemSnapshot : resolveColorScheme(mode);

  const setMode = useCallback((next: ColorSchemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    applyResolvedScheme(resolved);
  }, [resolved]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      setSystemSnapshot(mq.matches ? "dark" : "light");
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [mode]);

  const value = useMemo(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
