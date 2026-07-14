// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { cleanup, render } from "@testing-library/react";
import { Markdown } from "./Markdown";

afterEach(cleanup);

/**
 * OpenSpec structure detection (openspec-document-semantics). The negative
 * cases matter as much as the positive ones: detection is anchored so ordinary
 * prose is never distorted by structure it does not have.
 */
describe("OpenSpec structure detection", () => {
  it("marks requirement headings and captures their name", () => {
    const { container } = render(
      <Markdown>
        {"### Requirement: Proposal is the default\n\nText."}
      </Markdown>,
    );
    const heading = container.querySelector('[data-os="requirement"]');
    expect(heading).not.toBeNull();
    expect(heading?.getAttribute("data-os-name")).toBe(
      "Proposal is the default",
    );
  });

  it("marks scenario headings subordinate to their requirement", () => {
    const { container } = render(
      <Markdown>{"#### Scenario: Opening a change\n\nText."}</Markdown>,
    );
    expect(
      container
        .querySelector('[data-os="scenario"]')
        ?.getAttribute("data-os-name"),
    ).toBe("Opening a change");
  });

  it("marks WHEN/THEN/AND steps and distinguishes condition from outcome", () => {
    const { container } = render(
      <Markdown>
        {
          "- **WHEN** a user opens it\n- **THEN** it is shown\n- **AND** it stays"
        }
      </Markdown>,
    );
    const steps = container.querySelectorAll('li[data-os="step"]');
    expect(steps.length).toBe(3);
    expect([...steps].map((s) => s.getAttribute("data-os-step"))).toEqual([
      "when",
      "then",
      "and",
    ]);
  });

  it("marks delta operation groupings with the shared badge vocabulary", () => {
    const { container } = render(
      <Markdown>{"## ADDED Requirements"}</Markdown>,
    );
    const heading = container.querySelector('[data-os="operation"]');
    expect(heading?.getAttribute("data-os-op")).toBe("ADDED");
    expect(heading?.textContent).toContain("ADDED");
    // The badge is built from operationBadge() — the same helper SpecDiff uses —
    // so an operation looks the same in a document as it does in the diff view.
    const badge = heading?.querySelector("span");
    expect(badge?.className).toContain("bg-op-added-soft");
    expect(badge?.className).toContain("text-op-added");
  });

  it("gives each operation its own treatment", () => {
    for (const [op, token] of [
      ["MODIFIED", "op-modified"],
      ["REMOVED", "op-removed"],
    ] as const) {
      const { container } = render(
        <Markdown>{`## ${op} Requirements`}</Markdown>,
      );
      const badge = container.querySelector('[data-os="operation"] span');
      expect(badge?.className).toContain(`bg-${token}-soft`);
      cleanup();
    }
  });

  it("emphasizes the standalone SHALL in requirement prose", () => {
    const { container } = render(
      <Markdown>
        {"### Requirement: X\n\nThe system SHALL do it and SHALL NOT fail."}
      </Markdown>,
    );
    const marks = container.querySelectorAll(".os-shall");
    expect(marks.length).toBe(2); // SHALL and the SHALL of SHALL NOT
    expect(marks[0].textContent).toBe("SHALL");
  });
});

describe("OpenSpec detection is conservative", () => {
  it("ignores prose that merely mentions a keyword", () => {
    const { container } = render(
      <Markdown>
        {"This scenario is added when the requirement changes."}
      </Markdown>,
    );
    expect(container.querySelector("[data-os]")).toBeNull();
    expect(container.querySelector(".os-shall")).toBeNull();
  });

  it("does not treat a non-heading 'Requirement:' line as structure", () => {
    const { container } = render(
      <Markdown>{"Requirement: this is just a paragraph."}</Markdown>,
    );
    expect(container.querySelector("[data-os]")).toBeNull();
  });

  it("does not mark bold that is not a leading step keyword", () => {
    const { container } = render(
      <Markdown>{"- a step **WHEN** in the middle"}</Markdown>,
    );
    expect(container.querySelector('li[data-os="step"]')).toBeNull();
  });

  it("does not emphasize SHALL inside a code span", () => {
    const { container } = render(
      <Markdown>{"### Requirement: X\n\nUse the `SHALL` keyword."}</Markdown>,
    );
    expect(container.querySelector(".os-shall")).toBeNull();
    expect(container.querySelector("code")?.textContent).toBe("SHALL");
  });

  it("does not emphasize SHALL outside a requirement's prose", () => {
    const { container } = render(
      <Markdown>{"## Context\n\nThe system SHALL do it."}</Markdown>,
    );
    expect(container.querySelector(".os-shall")).toBeNull();
  });

  it("leaves a document with no OpenSpec structure as ordinary markdown", () => {
    const { container } = render(
      <Markdown>{"## Goals\n\nSome prose.\n\n- a bullet\n- another"}</Markdown>,
    );
    expect(container.querySelector("[data-os]")).toBeNull();
    expect(container.querySelectorAll("li").length).toBe(2);
    expect(container.querySelector("h2")?.textContent).toBe("Goals");
  });
});

/**
 * Rendered against the project's own specs rather than fixtures. Expectations
 * are derived from each file's source, so these stay true as the corpus grows.
 */
describe("against the real corpus", () => {
  it("annotates every requirement and scenario in a long specification", () => {
    const source = readFileSync("openspec/specs/change-board/spec.md", "utf8");
    const expectedRequirements =
      source.match(/^### Requirement:/gm)?.length ?? 0;
    const expectedScenarios = source.match(/^#### Scenario:/gm)?.length ?? 0;
    const expectedSteps =
      source.match(/^\s*- \*\*(WHEN|THEN|AND)\*\*/gm)?.length ?? 0;
    expect(expectedRequirements).toBeGreaterThan(0);

    const { container } = render(<Markdown>{source}</Markdown>);
    expect(container.querySelectorAll('[data-os="requirement"]').length).toBe(
      expectedRequirements,
    );
    expect(container.querySelectorAll('[data-os="scenario"]').length).toBe(
      expectedScenarios,
    );
    expect(container.querySelectorAll('li[data-os="step"]').length).toBe(
      expectedSteps,
    );
  });

  it("leaves a real design document, which has no requirements, untouched", () => {
    const source = readFileSync(
      "openspec/changes/archive/2026-07-15-add-user-settings/design.md",
      "utf8",
    );
    expect(source.match(/^### Requirement:/gm)).toBeNull();

    const { container } = render(<Markdown>{source}</Markdown>);
    expect(container.querySelector("[data-os]")).toBeNull();
    expect(container.querySelector(".os-shall")).toBeNull();
  });
});
