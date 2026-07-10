import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ViewerSession } from "./session.js";
import { ProjectResolver } from "./project-resolver.js";
import type { ProjectView, ServerMessage } from "@shared/contracts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** dist/server/server → dist/web */
const WEB_DIST = path.resolve(__dirname, "../web");

export interface ViewerServerOptions {
  cwd: string;
  /** Initial project to open, or null for global/picker mode (`opsx-ui -g`). */
  initialProject: ProjectView | null;
  usePolling?: boolean;
}

/**
 * The HTTP + WebSocket server. Owns the set of connected clients and the single
 * active ViewerSession; brokers live snapshot/activity messages to browsers.
 * Read-only end to end: no route writes to any project.
 */
export class ViewerServer {
  private readonly app: Express;
  private readonly http: Server;
  private readonly wss: WebSocketServer;
  private readonly clients = new Set<WebSocket>();
  private session: ViewerSession | null = null;

  constructor(private readonly options: ViewerServerOptions) {
    this.app = express();
    this.app.use(express.json());
    this.registerRoutes();
    this.serveStatic();
    this.http = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.http, path: "/ws" });
    this.wss.on("connection", (socket) => this.onClient(socket));
  }

  async start(port: number): Promise<number> {
    if (this.options.initialProject) {
      await this.openProject(this.options.initialProject).catch(() => {
        /* surfaced to the UI via bootstrap; don't crash the server */
      });
    }
    const actual = await this.listen(port);
    return actual;
  }

  private onClient(socket: WebSocket): void {
    this.clients.add(socket);
    socket.on("close", () => this.clients.delete(socket));
    const snapshot = this.session?.getSnapshot();
    if (snapshot) this.send(socket, { type: "snapshot", payload: snapshot });
  }

  private broadcast(message: ServerMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    }
  }

  private send(socket: WebSocket, message: ServerMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  /** Open (or switch to) a project, replacing any current session. */
  private async openProject(project: ProjectView): Promise<void> {
    await this.session?.dispose();
    this.session = new ViewerSession(
      project,
      {
        onSnapshot: (snapshot) =>
          this.broadcast({ type: "snapshot", payload: snapshot }),
        onActivity: (entry) =>
          this.broadcast({ type: "activity", payload: entry }),
      },
      { usePolling: this.options.usePolling },
    );
    await this.session.init();
  }

  private registerRoutes(): void {
    const api = express.Router();

    api.get("/bootstrap", async (_req, res) => {
      const stores = await ProjectResolver.listStores().catch(() => []);
      res.json({
        project: this.session?.project ?? null,
        version: this.session?.version ?? null,
        cwd: this.options.cwd,
        cwdHasOpenSpec: ProjectResolver.hasOpenSpec(this.options.cwd),
        stores,
      });
    });

    api.post("/open", async (req: Request, res: Response) => {
      try {
        const project = await this.resolveOpenRequest(req.body ?? {});
        if (!project) {
          res.status(400).json({ error: "No openspec/ found at that location." });
          return;
        }
        await this.openProject(project);
        res.json({ project, version: this.session?.version });
      } catch (error) {
        res.status(400).json({ error: (error as Error).message });
      }
    });

    api.post("/refresh", async (_req, res) => {
      if (!this.session) {
        res.status(409).json({ error: "No project open." });
        return;
      }
      const snapshot = await this.session.refresh();
      res.json(snapshot);
    });

    api.get("/snapshot", (_req, res) => {
      const snapshot = this.session?.getSnapshot();
      if (!snapshot) {
        res.status(409).json({ error: "No project open." });
        return;
      }
      res.json(snapshot);
    });

    api.get("/specs/:id", this.guarded(async (req, res, session) => {
      res.json(await session.getSpec(req.params.id));
    }));

    api.get("/changes/:id/deltas", this.guarded(async (req, res, session) => {
      res.json(await session.getDeltas(req.params.id));
    }));

    api.get("/changes/:id/status", this.guarded(async (req, res, session) => {
      res.json(await session.getStatus(req.params.id));
    }));

    this.app.use("/api", api);
  }

  /** Wrap a handler that requires an open session, with error translation. */
  private guarded(
    handler: (req: Request, res: Response, session: ViewerSession) => Promise<void>,
  ) {
    return async (req: Request, res: Response) => {
      if (!this.session) {
        res.status(409).json({ error: "No project open." });
        return;
      }
      try {
        await handler(req, res, this.session);
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    };
  }

  private async resolveOpenRequest(body: {
    dir?: string;
    storeId?: string;
  }): Promise<ProjectView | null> {
    if (body.storeId) {
      const stores = await ProjectResolver.listStores();
      const store = stores.find((s) => s.id === body.storeId);
      return store ? ProjectResolver.forStore(store) : null;
    }
    if (body.dir) {
      return ProjectResolver.hasOpenSpec(body.dir)
        ? ProjectResolver.forDirectory(body.dir, "picked")
        : null;
    }
    return ProjectResolver.fromCwd(this.options.cwd);
  }

  private serveStatic(): void {
    if (!existsSync(WEB_DIST)) return;
    this.app.use(express.static(WEB_DIST));
    // SPA fallback for client-side routes.
    this.app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/ws")) {
        next();
        return;
      }
      res.sendFile(path.join(WEB_DIST, "index.html"));
    });
  }

  private listen(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const onError = (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          this.http.removeListener("error", onError);
          resolve(this.listen(port + 1));
        } else {
          reject(err);
        }
      };
      this.http.once("error", onError);
      this.http.listen(port, () => {
        this.http.removeListener("error", onError);
        resolve(port);
      });
    });
  }

  async stop(): Promise<void> {
    await this.session?.dispose();
    for (const client of this.clients) client.close();
    await new Promise<void>((resolve) => this.wss.close(() => resolve()));
    await new Promise<void>((resolve) => this.http.close(() => resolve()));
  }
}
