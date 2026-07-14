import { useState, type ReactNode } from "react";
import { ARTIFACT_IDS, type ArtifactId } from "@shared/contracts";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FileQuestion } from "lucide-react";

export interface ArtifactTab {
  id: ArtifactId;
  label: string;
  available: boolean;
}

/**
 * The seam that makes live and archived changes navigable identically: each
 * drill-in supplies the tabs it has and how to render each artifact, and
 * `ArtifactBrowser` handles the switching. It never learns whether the change
 * is active or archived (LSP), so the two share one navigation.
 */
export interface ArtifactProvider {
  tabs: ArtifactTab[];
  renderArtifact: (id: ArtifactId) => ReactNode;
}

/** Display names for each destination, in one place. */
export const ARTIFACT_LABELS: Record<ArtifactId, string> = {
  proposal: "Proposal",
  design: "Design",
  tasks: "Tasks",
  "spec-changes": "Spec changes",
};

/**
 * Build the fixed destination list — Proposal · Design · Tasks · Spec changes —
 * from an availability map, so every provider offers the same tabs in the same
 * order regardless of which artifacts a given change happens to have.
 */
export function orderedArtifactTabs(
  available: Record<ArtifactId, boolean>,
): ArtifactTab[] {
  return ARTIFACT_IDS.map((id) => ({
    id,
    label: ARTIFACT_LABELS[id],
    available: available[id],
  }));
}

/** The tab a drill-in opens on: Proposal when present, else the first artifact
 *  the change actually has (a brand-new change may only have a proposal). */
function defaultTab(tabs: ArtifactTab[]): ArtifactId {
  const proposal = tabs.find((t) => t.id === "proposal");
  if (proposal?.available) return "proposal";
  return tabs.find((t) => t.available)?.id ?? "proposal";
}

export function ArtifactBrowser({ provider }: { provider: ArtifactProvider }) {
  const [selected, setSelected] = useState<ArtifactId | null>(null);

  // Follow the SpecDiff pattern: keep the user's pick only while it points at an
  // available tab, otherwise fall back to the default. This both honors the
  // "never land on a disabled tab" rule and resets sensibly when the change (and
  // thus its available tabs) changes underneath us.
  const available = new Set(
    provider.tabs.filter((t) => t.available).map((t) => t.id),
  );
  const active =
    selected && available.has(selected) ? selected : defaultTab(provider.tabs);

  const options = provider.tabs.map((t) => ({
    value: t.id,
    label: t.label,
    disabled: !t.available,
  }));

  return (
    <div>
      <div className="mb-6 flex">
        <SegmentedControl
          value={active}
          options={options}
          onChange={setSelected}
        />
      </div>
      {provider.renderArtifact(active)}
    </div>
  );
}

/** Shared empty state for an artifact destination with nothing to show. */
export function ArtifactEmpty({ label }: { label: string }) {
  return (
    <div className="border-border text-muted-foreground mx-auto flex max-w-3xl flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
      <FileQuestion className="size-5" />
      <p className="text-foreground text-sm font-medium">No {label}</p>
      <p className="max-w-xs text-xs">This change has no {label} document.</p>
    </div>
  );
}
