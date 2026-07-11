import { describe, expect, it } from "vitest";
import { CliOpenSpecSource } from "./cli-openspec-source.js";
import type { CliRunner } from "./cli-runner.js";

/**
 * Guarantees the read-only contract (task 4.6 / live-sync spec): the source
 * must only ever invoke read commands. Any mutating openspec subcommand
 * (init, new, archive, update, config write, spec/change scaffolding) would
 * mean a write path into a project's openspec/ and must fail this test.
 */
const READ_ONLY_COMMANDS = new Set([
  "list",
  "show",
  "status",
  "validate",
  "--version",
]);
const MUTATING_COMMANDS = new Set([
  "init",
  "new",
  "archive",
  "update",
  "config",
]);

class RecordingRunner implements CliRunner {
  public commands: string[] = [];
  run(args: string[]): Promise<string> {
    this.commands.push(args.find((a) => !a.startsWith("-")) ?? args[0]);
    // Minimal valid JSON so every mapper is exercised.
    return Promise.resolve(
      JSON.stringify({
        changes: [],
        specs: [],
        deltas: [],
        artifacts: [],
        items: [],
        requirements: [],
      }),
    );
  }
}

describe("read-only guarantee", () => {
  it("issues only read commands across the whole surface", async () => {
    const runner = new RecordingRunner();
    const source = new CliOpenSpecSource(runner, { storeId: "s" });

    await source.listChanges();
    await source.listSpecs();
    await source.getSpec("cap");
    await source.getDeltas("chg");
    await source.getStatus("chg");
    await source.validateChanges();

    expect(runner.commands.length).toBeGreaterThan(0);
    for (const command of runner.commands) {
      expect(READ_ONLY_COMMANDS.has(command)).toBe(true);
      expect(MUTATING_COMMANDS.has(command)).toBe(false);
    }
  });
});
