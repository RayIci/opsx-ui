// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { Markdown } from "./Markdown";
import { renderRouted } from "./test-utils";

// Mermaid is a large ESM/browser library; stub it so these tests exercise our
// integration — routing, failure containment, untagged passthrough — rather
// than mermaid itself.
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async (_id: string, source: string) => {
      if (source.includes("!!invalid!!")) throw new Error("Parse error");
      return {
        svg: `<svg data-testid="diagram"><title>${source}</title></svg>`,
      };
    }),
  },
}));

afterEach(cleanup);

describe("mermaid fences", () => {
  it("renders a mermaid fence as a diagram rather than as code", async () => {
    const { container } = renderRouted(
      <Markdown>{"```mermaid\ngraph TD; A-->B;\n```"}</Markdown>,
    );
    await waitFor(() =>
      expect(container.querySelector(".md-mermaid svg")).not.toBeNull(),
    );
    // Its source is not shown as a code block.
    expect(container.querySelector("pre")).toBeNull();
  });

  it("renders each of several diagrams", async () => {
    const { container } = renderRouted(
      <Markdown>
        {
          "```mermaid\ngraph TD; A-->B;\n```\n\n```mermaid\ngraph TD; C-->D;\n```"
        }
      </Markdown>,
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".md-mermaid svg").length).toBe(2),
    );
  });

  it("degrades an invalid diagram to its source, keeping the document intact", async () => {
    const { container } = renderRouted(
      <Markdown>
        {"# Title\n\n```mermaid\n!!invalid!!\n```\n\nAfter the diagram."}
      </Markdown>,
    );
    await waitFor(() =>
      expect(screen.getByText(/could not be rendered/i)).toBeDefined(),
    );
    // The author sees their own source…
    expect(container.querySelector("pre code")?.textContent).toContain(
      "!!invalid!!",
    );
    // …and the rest of the document rendered normally.
    expect(container.querySelector("h1")?.textContent).toContain("Title");
    expect(container.textContent).toContain("After the diagram.");
  });
});

/**
 * The regression this change most risks: a diagram feature that mangles the
 * hand-drawn ASCII diagrams which motivated it.
 */
describe("untagged fences are unaffected by diagram support", () => {
  it("leaves an ASCII diagram in an untagged fence exactly as authored", async () => {
    const diagram =
      "Proposed          ← tasks.completed === 0\nArchived          ← terminal";
    const { container } = renderRouted(
      <Markdown>{"```\n" + diagram + "\n```"}</Markdown>,
    );
    expect(container.querySelector(".md-mermaid")).toBeNull();
    expect(container.querySelector("pre code")?.textContent).toBe(
      diagram + "\n",
    );
  });

  it("leaves the real ASCII diagrams in an archived design untouched", () => {
    const source = readFileSync(
      "openspec/changes/archive/2026-07-11-add-kanban-board/design.md",
      "utf8",
    );
    // This document's fences are all untagged — the corpus fact this change rests on.
    expect(source.match(/^```[a-z]+/gm)).toBeNull();
    expect(source).toContain("```\nProposed");

    const { container } = renderRouted(<Markdown>{source}</Markdown>);
    expect(container.querySelector(".md-mermaid")).toBeNull();
    // The lifecycle diagram still reads exactly as drawn.
    expect(container.textContent).toContain(
      "Proposed          ← active change, tasks.completed === 0",
    );
  });
});
