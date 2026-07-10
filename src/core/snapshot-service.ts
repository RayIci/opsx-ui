import type { OpenSpecSource } from "./openspec-source.js";
import type { ProjectView, Snapshot } from "@shared/contracts.js";
import { toValidationStatus } from "./mappers.js";

/**
 * Composes the board-level snapshot from independent port calls (design D3).
 * Merges per-change validation health into each card. Pure orchestration —
 * no CLI or filesystem knowledge, so it is unit-testable against a mock source.
 */
export class SnapshotService {
  constructor(private readonly source: OpenSpecSource) {}

  async build(project: ProjectView): Promise<Snapshot> {
    const [changes, specs, validations] = await Promise.all([
      this.source.listChanges(),
      this.source.listSpecs(),
      this.source.validateChanges().catch(() => []),
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
      generatedAt: new Date().toISOString(),
    };
  }
}
