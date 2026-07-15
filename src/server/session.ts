import {
  CliOpenSpecSource,
  ExecCliRunner,
  FilesystemSource,
  SnapshotService,
  type ArchiveSource,
  type OpenSpecSource,
} from "../core/index.js";
import { OpenSpecWatcher } from "./watcher.js";
import type {
  ActivityEntry,
  ArchivedChangeDetail,
  ChangeArtifactManifest,
  DeltaView,
  ProjectView,
  RawDocument,
  Snapshot,
  SpecView,
  StatusView,
} from "../shared/contracts.js";

export interface SessionEvents {
  onSnapshot: (snapshot: Snapshot) => void;
  onActivity: (entry: ActivityEntry) => void;
}

/**
 * A single opened project: wires the read-only source, the snapshot composer,
 * and the filesystem watcher together, and keeps the latest snapshot cached so
 * new clients render instantly. All mutation of state originates from disk
 * events — the session never writes to the project.
 */
export class ViewerSession {
  private readonly source: OpenSpecSource;
  private readonly archive: ArchiveSource;
  private readonly snapshots: SnapshotService;
  private readonly watcher: OpenSpecWatcher;
  private current: Snapshot | null = null;
  private cliVersion = "unknown";

  constructor(
    public readonly project: ProjectView,
    private readonly events: SessionEvents,
    options: { usePolling?: boolean } = {},
  ) {
    const runner = new ExecCliRunner({ cwd: project.root });
    this.source = new CliOpenSpecSource(runner, { storeId: project.storeId });
    this.archive = new FilesystemSource(project.root);
    this.snapshots = new SnapshotService(this.source, this.archive);
    this.watcher = new OpenSpecWatcher(project.root, {
      usePolling: options.usePolling,
    });
  }

  get version(): string {
    return this.cliVersion;
  }

  /** Verify OpenSpec, build the first snapshot, and begin watching. */
  async init(): Promise<Snapshot> {
    this.cliVersion = await this.source.version();
    const snapshot = await this.rebuild();
    this.watcher.onInvalidated(() => {
      void this.rebuild();
    });
    this.watcher.onActivity((entry) => this.events.onActivity(entry));
    this.watcher.start();
    return snapshot;
  }

  /** Re-read state and broadcast. Also the manual-refresh path (task 4.5). */
  async refresh(): Promise<Snapshot> {
    return this.rebuild();
  }

  private async rebuild(): Promise<Snapshot> {
    const snapshot = await this.snapshots.build(this.project);
    this.current = snapshot;
    this.events.onSnapshot(snapshot);
    return snapshot;
  }

  getSnapshot(): Snapshot | null {
    return this.current;
  }

  getSpec(id: string): Promise<SpecView> {
    return this.source.getSpec(id);
  }

  getDeltas(changeId: string): Promise<DeltaView> {
    return this.source.getDeltas(changeId);
  }

  getStatus(changeId: string): Promise<StatusView> {
    return this.source.getStatus(changeId);
  }

  getArchivedChange(id: string): Promise<ArchivedChangeDetail> {
    return this.archive.getArchivedChange(id);
  }

  getChangeArtifactManifest(name: string): Promise<ChangeArtifactManifest> {
    return this.archive.getChangeArtifactManifest(name);
  }

  getRawDocument(relativePath: string): Promise<RawDocument> {
    return this.archive.getRawDocument(relativePath);
  }

  async dispose(): Promise<void> {
    await this.watcher.stop();
  }
}
