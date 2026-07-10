import { describe, expect, it } from "vitest";
import { CliOpenSpecSource, compareSemver } from "./cli-openspec-source.js";
import type { CliRunner } from "./cli-runner.js";
import { UnsupportedCliError } from "./errors.js";

/** Records invocations and replays canned stdout keyed by the first arg. */
class FakeRunner implements CliRunner {
  public calls: string[][] = [];
  constructor(private readonly responses: Record<string, string>) {}
  run(args: string[]): Promise<string> {
    this.calls.push(args);
    const key = args.find((a) => !a.startsWith("-")) ?? args[0];
    return Promise.resolve(this.responses[key] ?? "{}");
  }
}

describe("compareSemver", () => {
  it("orders versions", () => {
    expect(compareSemver("1.5.0", "1.5.0")).toBe(0);
    expect(compareSemver("1.4.9", "1.5.0")).toBe(-1);
    expect(compareSemver("2.0.0", "1.5.0")).toBe(1);
  });
});

describe("CliOpenSpecSource", () => {
  it("verifies a supported version and rejects old ones", async () => {
    const ok = new CliOpenSpecSource(new FakeRunner({ "--version": "1.5.0\n" }));
    await expect(ok.version()).resolves.toBe("1.5.0");

    const old = new CliOpenSpecSource(new FakeRunner({ "--version": "1.4.0\n" }));
    await expect(old.version()).rejects.toBeInstanceOf(UnsupportedCliError);
  });

  it("calls the right commands and maps output", async () => {
    const runner = new FakeRunner({
      list: JSON.stringify({ changes: [{ name: "c", completedTasks: 1, totalTasks: 2 }] }),
    });
    const source = new CliOpenSpecSource(runner);
    const changes = await source.listChanges();
    expect(changes[0].name).toBe("c");
    expect(runner.calls[0]).toEqual(["list", "--json"]);
  });

  it("threads --store on scoped commands when a store is active", async () => {
    const runner = new FakeRunner({ list: JSON.stringify({ specs: [] }) });
    const source = new CliOpenSpecSource(runner, { storeId: "acme" });
    await source.listSpecs();
    expect(runner.calls[0]).toEqual(["list", "--specs", "--json", "--store", "acme"]);
  });
});
