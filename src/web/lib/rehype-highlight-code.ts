import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import yaml from "highlight.js/lib/languages/yaml";
import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * The languages we highlight, trimmed to what OpenSpec documents actually
 * reference: interfaces and code (ts/js), configs (json), workflows (yaml), and
 * commands (bash).
 *
 * We build lowlight ourselves rather than using `rehype-highlight` because that
 * plugin statically imports lowlight's `common` set (~35 grammars) to use as a
 * default, so its `languages` option changes runtime behavior but not what the
 * bundler ships — registering five languages there still bundled all thirty-five
 * and blew this change's gzip budget.
 */
const lowlight = createLowlight({
  bash,
  json,
  javascript,
  typescript,
  yaml,
});

/** Aliases as authored in fences (```ts, ```yml, ```sh) → registered grammar. */
const ALIASES: Record<string, string> = {
  ts: "typescript",
  typescript: "typescript",
  js: "javascript",
  javascript: "javascript",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  bash: "bash",
  sh: "bash",
  shell: "bash",
};

function languageOf(node: Element): string | null {
  const classes = node.properties?.className;
  if (!Array.isArray(classes)) return null;
  for (const entry of classes) {
    const name = String(entry);
    if (name.startsWith("language-")) return name.slice("language-".length);
  }
  return null;
}

function textOf(node: Element): string {
  return node.children
    .map((child) => (child.type === "text" ? child.value : ""))
    .join("");
}

/**
 * Syntax-highlight fenced code blocks (markdown-rendering).
 *
 * Two rules, both deliberate:
 *  - A fence with no language declares no intent, so it is left untouched. There
 *    is no auto-detection: untagged fences in this corpus are as often ASCII
 *    diagrams as code, and inferring a language would tokenize a box diagram as
 *    source. Wrong highlighting is worse than none.
 *  - A fence declaring a language we do not register is left untouched rather
 *    than throwing, so an unknown language degrades to plain preformatted text.
 */
export function rehypeHighlightCode() {
  return (tree: Root): void => {
    visit(tree, "element", (node: Element, _index, parent) => {
      if (node.tagName !== "code") return;
      if (!parent || parent.type !== "element" || parent.tagName !== "pre") {
        return;
      }

      const declared = languageOf(node);
      if (!declared) return; // untagged → never auto-detected

      const grammar = ALIASES[declared.toLowerCase()];
      if (!grammar) return; // unknown language → plain, no error

      const result = lowlight.highlight(grammar, textOf(node));
      node.children = result.children as Element["children"];

      const classes = node.properties.className;
      node.properties.className = [
        ...(Array.isArray(classes) ? classes : []),
        "hljs",
      ];
    });
  };
}
