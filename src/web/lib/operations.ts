import type { DeltaOperation, ValidationStatus } from "@shared/contracts";

export const OPERATION_ORDER: DeltaOperation[] = [
  "ADDED",
  "MODIFIED",
  "REMOVED",
  "RENAMED",
];

export function operationBadge(op: DeltaOperation): "added" | "modified" | "removed" {
  switch (op) {
    case "ADDED":
      return "added";
    case "REMOVED":
      return "removed";
    default:
      return "modified";
  }
}

export function operationAccent(op: DeltaOperation): string {
  switch (op) {
    case "ADDED":
      return "var(--op-added)";
    case "REMOVED":
      return "var(--op-removed)";
    default:
      return "var(--op-modified)";
  }
}

export function validationLabel(status: ValidationStatus): string {
  switch (status) {
    case "valid":
      return "valid";
    case "invalid":
      return "invalid";
    default:
      return "unchecked";
  }
}
