import type { OpenSpecSource } from "./openspec-source.js";
import type { ArchiveSource } from "./archive-source.js";
import type { ProjectView, Snapshot } from "../shared/contracts.js";
import { toValidationStatus } from "./mappers.js";

/**
 * Composes the board-level snapshot from independent source calls (design
 * D3/D1). Merges per-change validation health into each card and includes the
 * archived-change list from the filesystem source. Pure orchestration — no CLI
 * or filesystem knowledge of its own, so it is unit-testable against mocks.
 */
export class SnapshotService {
  constructor(
    private readonly source: OpenSpecSource,
    private readonly archive: ArchiveSource,
  ) {}

  async build(project: ProjectView): Promise<Snapshot> {
    const [changes, specs, validations, archived] = await Promise.all([
      this.source.listChanges(),
      this.source.listSpecs(),
      this.source.validateChanges().catch(() => []),
      this.archive.listArchived().catch(() => []),
    ]);

    const validationById = new Map(validations.map((v) => [v.id, v]));
    const withHealth = changes.map((change) => ({
      ...change,
      validation: toValidationStatus(validationById.get(change.name)),
    }));

    return {
      project,
      changes: withHealth,
      specs,
      archived,
      generatedAt: new Date().toISOString(),
    };
  }
}
