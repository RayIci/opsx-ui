import GithubSlugger from "github-slugger";
import type { Heading, Root } from "mdast";
import { visit } from "unist-util-visit";
import { annotate, plainText } from "./mdast-text";

/**
 * Give every heading an anchor derived from its authored text
 * (document-navigation).
 *
 * Slugs are text-derived rather than positional: specs are living documents
 * edited constantly, and `#h-7` would silently repoint every link the moment
 * someone inserts a paragraph above. The accepted trade-off is that renaming a
 * heading breaks links to it — correct, since the thing being referenced
 * genuinely changed identity, and the same contract GitHub and MDN make.
 *
 * A fresh slugger per document makes the ids deterministic across renders while
 * still suffixing duplicates within one document.
 */
export function remarkHeadingIds() {
  return (tree: Root): void => {
    const slugger = new GithubSlugger();
    visit(tree, "heading", (node: Heading) => {
      const text = plainText(node).trim();
      if (!text) return;
      annotate(node, { id: slugger.slug(text) });
    });
  };
}
