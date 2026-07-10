import type { Requirement } from "@shared/contracts";
import { cn } from "@/lib/utils";

interface Props {
  requirement: Requirement;
  accent?: string;
  className?: string;
}

/**
 * Renders a requirement as the source-of-truth document it is: mono type for
 * the normative text and its WHEN/THEN scenarios. Shared by the spec browser
 * and the diff so both read identically.
 */
export function RequirementView({ requirement, accent, className }: Props) {
  return (
    <div
      className={cn(
        "border-border bg-card rounded-lg border p-3",
        className,
      )}
      style={accent ? { borderLeft: `2px solid ${accent}` } : undefined}
    >
      {requirement.name && (
        <p className="text-foreground mb-1 text-xs font-semibold">{requirement.name}</p>
      )}
      <p className="font-mono text-[0.8rem] leading-relaxed">{requirement.text}</p>
      {requirement.scenarios.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {requirement.scenarios.map((scenario, i) => (
            <li
              key={i}
              className="text-muted-foreground border-border/70 whitespace-pre-wrap border-l pl-3 font-mono text-[0.72rem] leading-relaxed"
            >
              {scenario.rawText}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
