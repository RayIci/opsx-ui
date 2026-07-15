import type { Parent, PhrasingContent } from "mdast";

/**
 * The plain text of a phrasing subtree — text and inline code, joined.
 * Shared so every stage that reads a heading's text (structure detection,
 * slugging) sees exactly the same string.
 */
export function plainText(node: Parent | PhrasingContent): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node && Array.isArray(node.children)) {
    return node.children
      .map((child) => plainText(child as PhrasingContent))
      .join("");
  }
  return "";
}

/** Merge hast properties onto an mdast node without clobbering existing ones. */
export function annotate(
  node: { data?: unknown },
  properties: Record<string, string>,
): void {
  const data = (node.data ?? {}) as { hProperties?: Record<string, unknown> };
  data.hProperties = { ...(data.hProperties ?? {}), ...properties };
  node.data = data;
}
