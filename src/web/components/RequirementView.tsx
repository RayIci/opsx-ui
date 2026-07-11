import type { Requirement } from "@shared/contracts";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/utils";

interface Props {
  requirement: Requirement;
  /** Optional operation accent color for a subtle left rule (no box). */
  accent?: string;
  className?: string;
}

/** Compose a requirement's structured fields back into a markdown document. */
function toMarkdown(requirement: Requirement): string {
  const parts: string[] = [];
  if (requirement.name) parts.push(`#### ${requirement.name}`);
  if (requirement.text) parts.push(requirement.text);
  for (const scenario of requirement.scenarios) {
    if (scenario.rawText.trim()) parts.push(scenario.rawText.trim());
  }
  return parts.join("\n\n");
}

/**
 * Renders a requirement as a document (markdown typography), not a boxed card.
 * Operation semantics are carried by a subtle colored left-rule rather than a
 * filled box (design D2). Shared by the spec browser and the diff.
 */
export function RequirementView({ requirement, accent, className }: Props) {
  return (
    <div
      className={cn("py-1", accent ? "pl-4" : undefined, className)}
      style={accent ? { borderLeft: `2px solid ${accent}` } : undefined}
    >
      <Markdown>{toMarkdown(requirement)}</Markdown>
    </div>
  );
}
