import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "boy" | "girl";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("boy");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem("ali-theme") as Theme | null)) || "boy";
    setThemeState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("ali-theme", theme); } catch {}
  }, [theme]);

  const value: ThemeCtx = {
    theme,
    setTheme: setThemeState,
    toggle: () => setThemeState((t) => (t === "boy" ? "girl" : "boy")),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used within ThemeProvider");
  return v;
}
