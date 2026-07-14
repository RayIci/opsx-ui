import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Mark the deep-linked section so it is identifiable on arrival
 * (document-navigation).
 *
 * The mark is part of the render rather than an attribute set on the DOM by
 * hand: a re-render — the outline settling, say — reconciles the heading and
 * would silently wipe an imperative attribute, leaving a deep link that scrolls
 * to an unmarked section.
 */
export function rehypeMarkTarget(options: { id?: string | null } = {}) {
  return (tree: Root): void => {
    const id = options.id;
    if (!id) return;
    visit(tree, "element", (node: Element) => {
      if (node.properties?.id === id) {
        node.properties["data-os-target"] = "";
      }
    });
  };
}
