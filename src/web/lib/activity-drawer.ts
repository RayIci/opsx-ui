import { useCallback, useState } from "react";

const STORAGE_KEY = "opsx-activity-open";

function readStored(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

/**
 * Open/closed state for the activity drawer. Closed by default, and the choice
 * persists across reloads in localStorage — the same pattern the theme switcher
 * uses. Owned once by the shell, which passes it to the toggle and the drawer.
 */
export function useActivityDrawer() {
  const [open, setOpen] = useState<boolean>(() =>
    typeof window === "undefined" ? false : readStored(),
  );

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const close = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "0");
    setOpen(false);
  }, []);

  return { open, toggle, close };
}
