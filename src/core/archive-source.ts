import type {
  ArchivedChangeDetail,
  ArchivedChangeSummary,
  RawDocument,
} from "@shared/contracts.js";

/**
 * Read-only access to things the `openspec` CLI cannot see: raw markdown
 * documents and the `changes/archive/` directory. Kept as its own interface
 * (segregated from `OpenSpecSource`) so the CLI source is not forced to
 * implement filesystem concerns and vice versa (ISP). Implementations MUST NOT
 * write to the project.
 */
export interface ArchiveSource {
  /** All archived changes, most-recent first. */
  listArchived(): Promise<ArchivedChangeSummary[]>;

  /** One archived change opened for reading (artifacts + deltas as markdown). */
  getArchivedChange(id: string): Promise<ArchivedChangeDetail>;

  /** A raw markdown document under the project's `openspec/` tree. */
  getRawDocument(relativePath: string): Promise<RawDocument>;
}
