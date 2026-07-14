// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DocumentView } from "./DocumentView";

/** jsdom implements neither of these; the outline observes and the deep link
 *  scrolls, so both need a stand-in. */
beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

function renderAt(path: string, content: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <DocumentView>{content}</DocumentView>
    </MemoryRouter>,
  );
}

const LONG = [
  "## Context",
  "Text.",
  "### Requirement: Alpha thing",
  "The system SHALL do it.",
  "### Requirement: Beta thing",
  "More.",
].join("\n\n");

describe("document outline", () => {
  it("presents an outline for a document with enough structure", async () => {
    renderAt("/specs/x", LONG);
    await waitFor(() =>
      expect(
        screen.getByRole("navigation", { name: /outline/i }),
      ).toBeDefined(),
    );
    // Requirements are what people navigate a spec for, so they appear.
    expect(screen.getByRole("button", { name: /Alpha thing/ })).toBeDefined();
  });

  it("shows no outline for a document with too little structure", async () => {
    renderAt("/specs/x", "## Only heading\n\nSome prose.");
    await waitFor(() =>
      expect(screen.queryByText("Only heading")).toBeDefined(),
    );
    expect(screen.queryByRole("navigation", { name: /outline/i })).toBeNull();
  });
});

describe("deep-link arrival", () => {
  it("brings the targeted requirement into view once content has rendered", async () => {
    renderAt("/specs/x#requirement-beta-thing", LONG);
    await waitFor(() =>
      expect(document.querySelector("[data-os-target]")?.id).toBe(
        "requirement-beta-thing",
      ),
    );
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("renders from the top, without error, when the target does not exist", async () => {
    const { container } = renderAt("/specs/x#requirement-does-not-exist", LONG);
    await waitFor(() => expect(container.querySelector("h2")).not.toBeNull());
    expect(container.querySelector("[data-os-target]")).toBeNull();
    // The document still rendered fully.
    expect(container.querySelectorAll('[data-os="requirement"]').length).toBe(
      2,
    );
  });
});

describe("outline against the real corpus", () => {
  it("outlines a real 97-line specification", async () => {
    const source = readFileSync("openspec/specs/change-board/spec.md", "utf8");
    renderAt("/specs/change-board", source);
    await waitFor(() =>
      expect(
        screen.getByRole("navigation", { name: /outline/i }),
      ).toBeDefined(),
    );
    const expected = source.match(/^#{1,4} /gm)?.length ?? 0;
    const entries = screen
      .getByRole("navigation", { name: /outline/i })
      .querySelectorAll("li");
    expect(entries.length).toBe(expected);
  });
});
