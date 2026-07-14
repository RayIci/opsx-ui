import type { Element, Root, Text } from "hast";
import { visit } from "unist-util-visit";
import { resolveArtifactLink, type ArtifactLink } from "./artifact-links";

interface Options {
  links: Map<string, ArtifactLink>;
  currentPath: string;
}

/**
 * Turn references to known artifacts into navigation (cross-artifact-links).
 *
 * Only inline code spans are candidates: authors already write
 * `` `change-artifact-nav` `` when they mean the capability, so prose stays
 * prose and sentences are never rewritten. A span inside a `pre` is code, not a
 * reference, and is left alone.
 */
export function rehypeArtifactLinks(options: Options) {
  const { links, currentPath } = options;

  return (tree: Root): void => {
    if (links.size === 0) return;

    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "code") return;
      if (typeof index !== "number" || !parent) return;
      // Fenced code lives inside <pre>: that is code, not a reference.
      if (parent.type === "element" && parent.tagName === "pre") return;

      const child = node.children[0] as Text | undefined;
      if (!child || node.children.length !== 1 || child.type !== "text") return;

      const link = resolveArtifactLink(links, child.value.trim(), currentPath);
      if (!link) return;

      const anchor: Element = {
        type: "element",
        tagName: "a",
        properties: {
          href: link.href,
          className: ["os-artifact-link"],
          "data-artifact-kind": link.kind,
        },
        children: [node],
      };
      parent.children[index] = anchor;
      return "skip";
    });
  };
}
