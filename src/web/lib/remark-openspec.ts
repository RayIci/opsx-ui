import type { Heading, ListItem, Parent, PhrasingContent, Root } from "mdast";

/** `### Requirement: <name>` — anchored to the exact prefix, on a heading only. */
const REQUIREMENT = /^Requirement:\s*(.+)$/;
/** `#### Scenario: <name>` */
const SCENARIO = /^Scenario:\s*(.+)$/;
/** `## ADDED Requirements` and friends. */
const OPERATION = /^(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements$/;
/** The normative keyword, as a standalone word — so `SHALL NOT` is covered and
 *  "shall" in ordinary prose is not. */
const SHALL = /\bSHALL\b/;

type Annotations = Record<string, string>;

function annotate(node: { data?: unknown }, properties: Annotations): void {
  const data = (node.data ?? {}) as {
    hProperties?: Record<string, unknown>;
  };
  data.hProperties = { ...(data.hProperties ?? {}), ...properties };
  (node as { data?: unknown }).data = data;
}

/** The plain text of a phrasing subtree — text and inline code, joined. */
function plainText(node: Parent | PhrasingContent): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node && Array.isArray(node.children)) {
    return node.children
      .map((child) => plainText(child as PhrasingContent))
      .join("");
  }
  return "";
}

/** Wrap every standalone SHALL in a span, leaving the author's words intact. */
function emphasizeShall(nodes: PhrasingContent[]): PhrasingContent[] {
  const out: PhrasingContent[] = [];
  for (const node of nodes) {
    // Only bare text is considered: `SHALL` inside inlineCode is a different
    // node type and is therefore never touched.
    if (node.type !== "text" || !SHALL.test(node.value)) {
      out.push(node);
      continue;
    }
    const parts = node.value.split(/(\bSHALL\b)/);
    for (const part of parts) {
      if (part === "") continue;
      if (part === "SHALL") {
        out.push({
          type: "emphasis",
          children: [{ type: "text", value: part }],
          data: { hName: "span", hProperties: { className: ["os-shall"] } },
        });
      } else {
        out.push({ type: "text", value: part });
      }
    }
  }
  return out;
}

/** Is this list item a `- **WHEN** …` style step? Only *leading* bold counts. */
function stepKind(item: ListItem): string | null {
  const first = item.children[0];
  if (!first || first.type !== "paragraph") return null;
  const lead = first.children[0];
  if (!lead || lead.type !== "strong") return null;
  const word = plainText(lead).trim().toUpperCase();
  return word === "WHEN" || word === "THEN" || word === "AND"
    ? word.toLowerCase()
    : null;
}

/**
 * Annotate OpenSpec's own document structure (openspec-document-semantics).
 *
 * This stage only ever *marks* nodes — the author's words are never rewritten,
 * reordered, or synthesized, so a document with no OpenSpec structure passes
 * through untouched and renders as ordinary markdown.
 *
 * Detection is deliberately conservative and anchored: requirements/scenarios
 * are recognized only as headings carrying the exact prefix, operations only as
 * a heading of the `ADDED Requirements` form, and steps only as *leading* bold
 * text in a list item. Prose that merely mentions "scenario" or "added", and
 * keywords inside code spans, are never annotated.
 */
export function remarkOpenspec() {
  return (tree: Root): void => {
    let inRequirement = false;

    for (const node of tree.children) {
      if (node.type === "heading") {
        const heading = node as Heading;
        const text = plainText(heading).trim();

        const operation = OPERATION.exec(text);
        const requirement = REQUIREMENT.exec(text);
        const scenario = SCENARIO.exec(text);

        if (operation) {
          annotate(heading, {
            "data-os": "operation",
            "data-os-op": operation[1],
          });
          inRequirement = false;
        } else if (requirement) {
          annotate(heading, {
            "data-os": "requirement",
            "data-os-name": requirement[1],
          });
          inRequirement = true;
        } else if (scenario) {
          annotate(heading, {
            "data-os": "scenario",
            "data-os-name": scenario[1],
          });
          // A scenario belongs to its requirement, but its steps are not the
          // requirement's normative prose — stop emphasizing SHALL here.
          inRequirement = false;
        } else {
          inRequirement = false;
        }
        continue;
      }

      // SHALL is emphasized only in a requirement's own descriptive prose.
      if (inRequirement && node.type === "paragraph") {
        node.children = emphasizeShall(node.children);
      }
    }

    // Steps can be nested anywhere under a scenario, so walk lists separately.
    const walkLists = (parent: Parent): void => {
      for (const child of parent.children) {
        if (child.type === "listItem") {
          const kind = stepKind(child as ListItem);
          if (kind) {
            annotate(child, { "data-os": "step", "data-os-step": kind });
          }
        }
        if ("children" in child && Array.isArray(child.children)) {
          walkLists(child as Parent);
        }
      }
    };
    walkLists(tree);
  };
}
