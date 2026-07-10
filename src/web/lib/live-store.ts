import { useSyncExternalStore } from "react";
import type {
  ActivityEntry,
  ServerMessage,
  Snapshot,
} from "@shared/contracts";

export type ConnectionStatus = "connecting" | "open" | "closed";

export interface LiveState {
  snapshot: Snapshot | null;
  activity: ActivityEntry[];
  connection: ConnectionStatus;
  /** Bumped whenever a live update lands, so views can pulse. */
  pulse: number;
}

const MAX_ACTIVITY = 200;

/**
 * The browser's single source of truth (task 4.4). A WebSocket feeds snapshot
 * and activity messages in; React subscribes via useSyncExternalStore. The UI
 * never mutates OpenSpec — it only renders whatever the server pushes.
 */
class LiveStore {
  private state: LiveState = {
    snapshot: null,
    activity: [],
    connection: "connecting",
    pulse: 0,
  };
  private listeners = new Set<() => void>();
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;

  connect(): void {
    if (this.socket) return;
    this.open();
  }

  private open(): void {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${proto}://${location.host}/ws`);
    this.socket = socket;
    this.patch({ connection: "connecting" });

    socket.onopen = () => this.patch({ connection: "open" });
    socket.onmessage = (event) => {
      try {
        this.ingest(JSON.parse(event.data as string) as ServerMessage);
      } catch {
        /* ignore malformed frames */
      }
    };
    socket.onclose = () => {
      this.socket = null;
      this.patch({ connection: "closed" });
      this.scheduleReconnect();
    };
    socket.onerror = () => socket.close();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, 1500);
  }

  private ingest(message: ServerMessage): void {
    switch (message.type) {
      case "snapshot":
        this.patch({
          snapshot: message.payload,
          pulse: this.state.pulse + 1,
        });
        break;
      case "activity":
        this.patch({
          activity: [message.payload, ...this.state.activity].slice(0, MAX_ACTIVITY),
          pulse: this.state.pulse + 1,
        });
        break;
      case "error":
        // Non-fatal; surfaced elsewhere if needed.
        break;
    }
  }

  /** Seed the store with the initial REST snapshot before the socket opens. */
  seed(snapshot: Snapshot | null): void {
    if (snapshot) this.patch({ snapshot });
  }

  private patch(partial: Partial<LiveState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): LiveState => this.state;
}

export const liveStore = new LiveStore();

export function useLiveState(): LiveState {
  return useSyncExternalStore(liveStore.subscribe, liveStore.getSnapshot);
}
