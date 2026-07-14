import type { Snapshot } from "@shared/contracts";

export interface ArtifactLink {
  /** Route to the artifact this reference names. */
  href: string;
  kind: "capability" | "change" | "archived";
}

/**
 * Resolve a reference to a known artifact (cross-artifact-links).
 *
 * The whole design is set membership: a reference links only when it exactly
 * matches an id the project's snapshot already carries. We never write rules
 * that *guess* what a capability name looks like — a pattern for
 * `kebab-case-words` would happily linkify `tasks.md`, `content-type`, and half
 * the corpus. Membership in a known set cannot produce a link to something that
 * does not exist, so false positives are impossible by construction rather than
 * by tuning.
 *
 * Precedence is active change → archived change → capability: a reader following
 * a reference to work in progress wants the live artifact. Names are unique
 * enough in practice that this rarely fires, but leaving it undefined would make
 * the outcome depend on iteration order.
 */
export function buildArtifactLinks(
  snapshot: Snapshot | null,
): Map<string, ArtifactLink> {
  const links = new Map<string, ArtifactLink>();
  if (!snapshot) return links;

  for (const spec of snapshot.specs) {
    links.set(spec.id, {
      href: `/specs/${encodeURIComponent(spec.id)}`,
      kind: "capability",
    });
  }

  // Archived changes are referenced by name (`add-user-settings`) but routed by
  // id (`2026-07-15-add-user-settings`) — matching on the wrong one gives a
  // feature that works for capabilities and silently fails for archives.
  for (const archived of snapshot.archived) {
    links.set(archived.name, {
      href: `/archive/${encodeURIComponent(archived.id)}`,
      kind: "archived",
    });
  }

  // Last, so an active change wins over an archived one of the same name.
  for (const change of snapshot.changes) {
    links.set(change.name, {
      href: `/changes/${encodeURIComponent(change.name)}`,
      kind: "change",
    });
  }

  return links;
}

/** Resolve a reference, refusing to link the artifact the reader is already on. */
export function resolveArtifactLink(
  links: Map<string, ArtifactLink>,
  reference: string,
  currentPath: string,
): ArtifactLink | null {
  const link = links.get(reference);
  if (!link) return null;
  // Self-reference: whether this is one depends on where the *user* is, not on
  // what the document says — the same spec text renders on the Specs page and
  // inside an archived change.
  if (link.href === currentPath) return null;
  return link;
}
