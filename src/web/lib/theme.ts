import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "opsx-theme";
const MEDIA = "(prefers-color-scheme: dark)";

function systemPrefersDark(): boolean {
  return window.matchMedia(MEDIA).matches;
}

function resolveDark(theme: Theme): boolean {
  return theme === "dark" || (theme === "system" && systemPrefersDark());
}

function readStored(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

/**
 * Theme state for the switcher (Light / Dark / System). Persists the *choice*
 * (not the resolved value), applies the `dark` class, and follows the OS while
 * in "system" mode. The pre-paint script in index.html handles first render.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === "undefined" ? "system" : readStored(),
  );

  const apply = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", resolveDark(next));
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      localStorage.setItem(STORAGE_KEY, next);
      setThemeState(next);
      apply(next);
    },
    [apply],
  );

  // Follow OS changes while in system mode.
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia(MEDIA);
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, apply]);

  return { theme, setTheme };
}

/**
 * Whether the dark theme is currently applied, observed from the `dark` class
 * on the document element — the app's actual source of truth.
 *
 * `useTheme` reports the *preference*, which may be "system" and so cannot tell
 * a caller which theme is actually showing. Anything that must be redrawn per
 * theme (a diagram is drawn output, not styled DOM) needs the resolved value,
 * and needs it to change when the OS flips under "system" too.
 */
export function useIsDarkTheme(): boolean {
  const [dark, setDark] = useState(() =>
    typeof document === "undefined"
      ? false
      : document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() =>
      setDark(root.classList.contains("dark")),
    );
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}
