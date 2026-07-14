import { useSyncExternalStore } from "react";
import type { Settings } from "@shared/contracts";
import { api } from "./api";

/** Client-side starting point until the server's settings load. Matches the
 *  server's DEFAULT_SETTINGS so the UI is always driving valid settings. */
const DEFAULT_SETTINGS: Settings = { version: 1, defaultArtifactTab: null };

/**
 * A tiny store for user settings, mirroring `live-store`: load once from the
 * server, expose the current value via useSyncExternalStore, and update through
 * a PUT that refreshes the value. The server is the source of truth (it
 * validates and persists); this just caches the last known settings.
 */
class SettingsStore {
  private state: Settings = DEFAULT_SETTINGS;
  private listeners = new Set<() => void>();
  private started = false;

  /** Load settings once (idempotent). Safe to call on every shell mount. */
  start(): void {
    if (this.started) return;
    this.started = true;
    void api.settings
      .get()
      .then((settings) => this.set(settings))
      .catch(() => {
        /* keep defaults if the server is unreachable */
      });
  }

  /** Persist a partial change and adopt the server's validated result. */
  async update(patch: Partial<Settings>): Promise<void> {
    this.set(await api.settings.put(patch));
  }

  private set(settings: Settings): void {
    this.state = settings;
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): Settings => this.state;
}

export const settingsStore = new SettingsStore();

export function useSettings(): Settings {
  return useSyncExternalStore(
    settingsStore.subscribe,
    settingsStore.getSnapshot,
  );
}
