## REMOVED Requirements

### Requirement: Tasks are a distinct, switchable view on the drill-in

**Reason**: The "distinct, switchable view" and "default view" responsibility now belongs to the `change-artifact-nav` capability, which owns switching between all four artifacts (Proposal, Design, Tasks, Spec changes) rather than only Tasks and Spec deltas. Keeping this requirement in `change-tasks` would duplicate that ownership and conflict with the new default (Proposal, not Tasks). This narrows `change-tasks` to the task *content* it renders.

**Migration**: The behavior is superseded by `change-artifact-nav`'s "Unified artifact navigation on a change drill-in" and "Proposal is the default destination" requirements. Tasks remain reachable as one destination within that navigation; the read-only and graceful-absence guarantees for the task list stay in `change-tasks`.
