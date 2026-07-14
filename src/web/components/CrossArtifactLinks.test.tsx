// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup } from "@testing-library/react";
import type { Snapshot } from "@shared/contracts";
import { liveStore } from "@/lib/live-store";
import { buildArtifactLinks, resolveArtifactLink } from "@/lib/artifact-links";
import { Markdown } from "./Markdown";
import { renderRouted } from "./test-utils";

const SNAPSHOT = {
  project: { root: "/p", name: "p", source: "cwd", storeId: null },
  specs: [
    {
      id: "change-artifact-nav",
      title: "change-artifact-nav",
      requirementCount: 6,
    },
    { id: "spec-diff", title: "spec-diff", requirementCount: 5 },
  ],
  changes: [
    {
      name: "add-npm-publish-pipeline",
      status: "in-progress",
      tasks: { completed: 15, total: 19 },
      validation: "valid",
      lastModified: null,
    },
  ],
  archived: [
    {
      id: "2026-07-15-add-user-settings",
      name: "add-user-settings",
      archivedDate: "2026-07-15",
      tasks: { completed: 18, total: 18 },
    },
  ],
  generatedAt: "now",
} as unknown as Snapshot;

beforeEach(() => liveStore.seed(SNAPSHOT));
afterEach(cleanup);

describe("resolver", () => {
  const links = buildArtifactLinks(SNAPSHOT);

  it("routes each kind of artifact to its own destination", () => {
    expect(links.get("change-artifact-nav")).toEqual({
      href: "/specs/change-artifact-nav",
      kind: "capability",
    });
    expect(links.get("add-npm-publish-pipeline")).toEqual({
      href: "/changes/add-npm-publish-pipeline",
      kind: "change",
    });
    // Referenced by name, routed by id.
    expect(links.get("add-user-settings")).toEqual({
      href: "/archive/2026-07-15-add-user-settings",
      kind: "archived",
    });
  });

  it("knows nothing it was not told about", () => {
    for (const noise of [
      "tasks.md",
      "main",
      "package.json",
      "ArtifactBrowser",
    ]) {
      expect(links.get(noise)).toBeUndefined();
    }
  });

  it("refuses to link the artifact the reader is already on", () => {
    expect(
      resolveArtifactLink(
        links,
        "change-artifact-nav",
        "/specs/change-artifact-nav",
      ),
    ).toBeNull();
    // …but the same name elsewhere still links.
    expect(
      resolveArtifactLink(links, "change-artifact-nav", "/changes/something"),
    ).not.toBeNull();
  });

  it("prefers an active change over an archived one of the same name", () => {
    const both = buildArtifactLinks({
      ...SNAPSHOT,
      changes: [{ name: "add-user-settings" }],
    } as unknown as Snapshot);
    expect(both.get("add-user-settings")?.kind).toBe("change");
  });

  it("is empty, rather than broken, with no snapshot", () => {
    expect(buildArtifactLinks(null).size).toBe(0);
  });
});

describe("linkification in a rendered document", () => {
  it("links a reference to a known capability", () => {
    const { container } = renderRouted(
      <Markdown>{"Owned by the `change-artifact-nav` capability."}</Markdown>,
      "/specs/change-tasks",
    );
    const link = container.querySelector("a.os-artifact-link");
    expect(link?.getAttribute("href")).toBe("/specs/change-artifact-nav");
    expect(link?.textContent).toBe("change-artifact-nav");
  });

  it("leaves the corpus's real noise completely alone", () => {
    const { container } = renderRouted(
      <Markdown>
        {
          "See `tasks.md` in `openspec/` on `main` — `ArtifactBrowser` and `package.json`."
        }
      </Markdown>,
      "/specs/x",
    );
    expect(container.querySelectorAll("a").length).toBe(0);
    // Still rendered as code, just not linked.
    expect(container.querySelectorAll("code").length).toBe(5);
  });

  it("does not link a partial match", () => {
    const { container } = renderRouted(
      <Markdown>{"The `change-artifact-nav-extra` thing."}</Markdown>,
      "/specs/x",
    );
    expect(container.querySelector("a")).toBeNull();
  });

  it("does not link a self-reference", () => {
    const { container } = renderRouted(
      <Markdown>{"This is the `change-artifact-nav` capability."}</Markdown>,
      "/specs/change-artifact-nav",
    );
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("code")?.textContent).toBe(
      "change-artifact-nav",
    );
  });

  it("does not link a name inside a fenced code block", () => {
    const { container } = renderRouted(
      <Markdown>{"```ts\nconst x = 'change-artifact-nav';\n```"}</Markdown>,
      "/specs/x",
    );
    expect(container.querySelector("a.os-artifact-link")).toBeNull();
  });

  it("links an archived change by name to its archived drill-in", () => {
    const { container } = renderRouted(
      <Markdown>{"Superseded by `add-user-settings`."}</Markdown>,
      "/specs/x",
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/archive/2026-07-15-add-user-settings",
    );
  });
});

describe("linkability follows live project state", () => {
  it("re-resolves a reference when the change is archived beneath it", async () => {
    const { container } = renderRouted(
      <Markdown>{"Tracking `add-npm-publish-pipeline`."}</Markdown>,
      "/specs/x",
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/changes/add-npm-publish-pipeline",
    );

    // The change is archived while the document is on screen.
    await act(async () => {
      liveStore.seed({
        ...SNAPSHOT,
        changes: [],
        archived: [
          ...SNAPSHOT.archived,
          {
            id: "2026-07-16-add-npm-publish-pipeline",
            name: "add-npm-publish-pipeline",
            archivedDate: "2026-07-16",
            tasks: { completed: 19, total: 19 },
          },
        ],
      } as unknown as Snapshot);
    });

    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/archive/2026-07-16-add-npm-publish-pipeline",
    );
  });
});

describe("the known gap: proposed-but-unspecified capabilities", () => {
  it("does not link a capability that only exists as a proposal", () => {
    // `add-npm-publish-pipeline` proposes ci-checks / release-pipeline, but they
    // have no main spec, so they are absent from snapshot.specs.
    expect(SNAPSHOT.specs.some((s) => s.id === "ci-checks")).toBe(false);
    const { container } = renderRouted(
      <Markdown>{"Introduces `ci-checks` and `release-pipeline`."}</Markdown>,
      "/changes/add-npm-publish-pipeline",
    );
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelectorAll("code").length).toBe(2);
  });
});
