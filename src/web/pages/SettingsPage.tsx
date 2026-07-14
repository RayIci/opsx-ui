import type { ReactNode } from "react";
import { ARTIFACT_IDS, type ArtifactId } from "@shared/contracts";
import { useSettings, settingsStore } from "@/lib/settings-store";
import { ARTIFACT_LABELS } from "@/features/change-artifacts/ArtifactBrowser";

/**
 * The Settings destination: a dedicated, addressable page (not a modal) so
 * preferences have room to grow into grouped sections. Changes save on select
 * and take effect immediately — there is no explicit save step.
 */
export function SettingsPage() {
  const settings = useSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your preferences, saved to your user config file — they apply to every
          project you open and never touch a project&apos;s{" "}
          <code className="font-mono text-xs">openspec/</code>.
        </p>
      </header>

      <Section
        title="Change drill-ins"
        description="How a change opens when you select it from the board or the archive."
      >
        <Row
          label="Default tab"
          hint="The artifact shown first. Falls back to Proposal when the chosen tab isn't available on a change."
          control={
            <select
              value={settings.defaultArtifactTab ?? ""}
              onChange={(event) =>
                void settingsStore.update({
                  defaultArtifactTab:
                    event.target.value === ""
                      ? null
                      : (event.target.value as ArtifactId),
                })
              }
              className="border-border bg-background focus-visible:ring-ring rounded-md border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2"
            >
              <option value="">Proposal (default)</option>
              {ARTIFACT_IDS.filter((id) => id !== "proposal").map((id) => (
                <option key={id} value={id}>
                  {ARTIFACT_LABELS[id]}
                </option>
              ))}
            </select>
          }
        />
      </Section>
    </div>
  );
}

/** A titled group of related preferences. New settings groups drop in here. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="border-border mb-1 border-b pb-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        )}
      </div>
      <div className="divide-border divide-y">{children}</div>
    </section>
  );
}

/** One preference: label + hint on the left, its control on the right. */
function Row({
  label,
  hint,
  control,
}: {
  label: string;
  hint?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
