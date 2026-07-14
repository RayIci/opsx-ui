import type {
  ArchivedChangeDetail,
  ChangeArtifactManifest,
  DeltaView,
  ProjectView,
  RawDocument,
  Snapshot,
  SpecView,
  StatusView,
} from "@shared/contracts";

export interface RegisteredStore {
  id: string;
  name: string;
  root: string;
}

export interface Bootstrap {
  project: ProjectView | null;
  version: string | null;
  cwd: string;
  cwdHasOpenSpec: boolean;
  stores: RegisteredStore[];
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  bootstrap: () => fetch("/api/bootstrap").then(json<Bootstrap>),

  open: (body: { dir?: string; storeId?: string }) =>
    fetch("/api/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(json<{ project: ProjectView; version: string }>),

  refresh: () => fetch("/api/refresh", { method: "POST" }).then(json<Snapshot>),

  spec: (id: string) =>
    fetch(`/api/specs/${encodeURIComponent(id)}`).then(json<SpecView>),

  document: (path: string) =>
    fetch(`/api/document?path=${encodeURIComponent(path)}`).then(
      json<RawDocument>,
    ),

  deltas: (changeId: string) =>
    fetch(`/api/changes/${encodeURIComponent(changeId)}/deltas`).then(
      json<DeltaView>,
    ),

  status: (changeId: string) =>
    fetch(`/api/changes/${encodeURIComponent(changeId)}/status`).then(
      json<StatusView>,
    ),

  artifacts: (changeId: string) =>
    fetch(`/api/changes/${encodeURIComponent(changeId)}/artifacts`).then(
      json<ChangeArtifactManifest>,
    ),

  archived: (id: string) =>
    fetch(`/api/archive/${encodeURIComponent(id)}`).then(
      json<ArchivedChangeDetail>,
    ),
};
