// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { renderRouted as render } from "./test-utils";
import { Markdown } from "./Markdown";

afterEach(cleanup);

/**
 * The fence-behavior matrix (markdown-rendering). The rules under test are the
 * design decisions, not incidental output: a fence's declared language — and
 * only that — decides its treatment, and raw HTML never renders.
 */
describe("Markdown code fences", () => {
  it("highlights a fence tagged with a supported language", () => {
    const { container } = render(
      <Markdown>{"```ts\nconst x: number = 1;\n```"}</Markdown>,
    );
    const code = container.querySelector("pre code");
    expect(code?.className).toContain("language-ts");
    // Highlighting actually tokenized rather than just labelling the block.
    expect(
      container.querySelectorAll("pre code span.hljs-keyword").length,
    ).toBeGreaterThan(0);
  });

  it("renders a fence with an unsupported language as plain text, without error", () => {
    const { container } = render(
      <Markdown>{"```klingon\nnuqneH\n```"}</Markdown>,
    );
    const code = container.querySelector("pre code");
    expect(code?.textContent).toContain("nuqneH");
    expect(
      container.querySelectorAll("pre code span[class^='hljs-']").length,
    ).toBe(0);
  });

  it("does NOT auto-detect a language for an untagged fence", () => {
    // Deliberately valid TypeScript: a detecting highlighter would tokenize it.
    const { container } = render(
      <Markdown>{"```\nconst x: number = 1;\n```"}</Markdown>,
    );
    const code = container.querySelector("pre code");
    expect(code?.textContent).toContain("const x: number = 1;");
    expect(
      container.querySelectorAll("pre code span[class^='hljs-']").length,
    ).toBe(0);
  });

  it("preserves an ASCII diagram in an untagged fence verbatim", () => {
    const diagram =
      "Proposed          ← tasks.completed === 0\nArchived          ← terminal";
    const { container } = render(
      <Markdown>{"```\n" + diagram + "\n```"}</Markdown>,
    );
    const code = container.querySelector("pre code");
    expect(code?.textContent).toBe(diagram + "\n");
    expect(
      container.querySelectorAll("pre code span[class^='hljs-']").length,
    ).toBe(0);
  });

  it("offers a copy control on a fence", () => {
    render(<Markdown>{"```ts\nconst x = 1;\n```"}</Markdown>);
    expect(screen.getByRole("button", { name: /copy code/i })).toBeDefined();
  });
});

describe("Markdown safety", () => {
  it("does not render raw HTML as markup", () => {
    const { container } = render(
      <Markdown>{"<script>alert(1)</script>\n\n<b>bold</b>"}</Markdown>,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
    // It is shown as text rather than silently dropped.
    expect(container.textContent).toContain("bold");
  });
});

describe("Markdown tables", () => {
  it("renders a GFM table with a header row inside a scroll container", () => {
    const { container } = render(
      <Markdown>{"| a | b |\n| - | - |\n| 1 | 2 |"}</Markdown>,
    );
    expect(container.querySelector(".md-table-wrap table")).not.toBeNull();
    expect(container.querySelectorAll("thead th").length).toBe(2);
  });
});
