// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { cleanup } from "@testing-library/react";
import { renderRouted as render } from "./test-utils";
import { Markdown } from "./Markdown";

afterEach(cleanup);

/**
 * Heading anchors (document-navigation). Slugs are text-derived so links
 * survive edits elsewhere in the document; a positional scheme would silently
 * repoint every link when a paragraph is inserted above.
 */
describe("heading anchors", () => {
  it("derives an anchor from the heading's authored text", () => {
    const { container } = render(
      <Markdown>{"## Goals / Non-Goals\n\nText."}</Markdown>,
    );
    expect(container.querySelector("h2")?.id).toBe("goals--non-goals");
  });

  it("is stable across renders of unchanged content", () => {
    const source = "## Context\n\n### Requirement: A thing\n\n## Risks";
    const first = render(<Markdown>{source}</Markdown>);
    const before = [...first.container.querySelectorAll("[id]")].map(
      (e) => e.id,
    );
    cleanup();
    const second = render(<Markdown>{source}</Markdown>);
    const after = [...second.container.querySelectorAll("[id]")].map(
      (e) => e.id,
    );
    expect(after).toEqual(before);
  });

  it("gives two identically-named headings distinct anchors", () => {
    const { container } = render(
      <Markdown>{"### Scenario: Same\n\n### Scenario: Same"}</Markdown>,
    );
    const ids = [...container.querySelectorAll("h3")].map((h) => h.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it("makes each requirement individually addressable", () => {
    const { container } = render(
      <Markdown>
        {
          "### Requirement: First one\n\nA.\n\n### Requirement: Second one\n\nB."
        }
      </Markdown>,
    );
    const requirements = container.querySelectorAll('[data-os="requirement"]');
    expect(requirements.length).toBe(2);
    // Anchors are the heading slugs — one mechanism, not a parallel scheme.
    expect([...requirements].map((r) => r.id)).toEqual([
      "requirement-first-one",
      "requirement-second-one",
    ]);
  });

  it("offers a copy-link control on every anchored heading", () => {
    const { container } = render(
      <Markdown>{"### Requirement: Linkable\n\nText."}</Markdown>,
    );
    const button = container.querySelector(
      'h3 button[aria-label="Copy link to this section"]',
    );
    expect(button).not.toBeNull();
  });
});

describe("anchors against the real corpus", () => {
  it("anchors every heading in a real specification", () => {
    const source = readFileSync("openspec/specs/change-board/spec.md", "utf8");
    const expected = source.match(/^#{1,4} /gm)?.length ?? 0;
    expect(expected).toBeGreaterThan(0);

    const { container } = render(<Markdown>{source}</Markdown>);
    const anchored = container.querySelectorAll("h1[id],h2[id],h3[id],h4[id]");
    expect(anchored.length).toBe(expected);
    // Every anchor is unique, so every link resolves to exactly one section.
    const ids = [...anchored].map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
