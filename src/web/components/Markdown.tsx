import type { ComponentProps } from "react";
import type { DeltaOperation } from "@shared/contracts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeHighlightCode } from "@/lib/rehype-highlight-code";
import { remarkOpenspec } from "@/lib/remark-openspec";
import { operationBadge } from "@/lib/operations";
import { Badge } from "./ui/badge";
import { CodeBlock } from "./CodeBlock";
import { cn } from "@/lib/utils";

/**
 * The one renderer every markdown surface uses (markdown-rendering). Rendering
 * is an explicit pipeline so later capabilities add a stage rather than rewrite
 * this component.
 *
 * Raw HTML is not enabled (no rehype-raw) — project markdown is untrusted input
 * and is treated as markdown only. Fence highlighting rules live in
 * `rehypeHighlightCode`.
 */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("md-prose", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkOpenspec]}
        rehypePlugins={[rehypeHighlightCode]}
        components={{ pre: CodeBlock, table: Table, h2: Heading2 }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** Tables scroll inside their own container, so a wide table never makes the
 *  page scroll horizontally. */
function Table({ children, ...props }: ComponentProps<"table">) {
  return (
    <div className="md-table-wrap">
      <table {...props}>{children}</table>
    </div>
  );
}

const OPERATIONS = new Set(["ADDED", "MODIFIED", "REMOVED", "RENAMED"]);

/**
 * A delta operation grouping (`## ADDED Requirements`) renders its operation as
 * the same badge `SpecDiff` uses, so an operation means the same thing whether
 * you meet it in a rendered document or in the diff view. The badge variant
 * comes from the shared `operationBadge` helper — this must not grow a second
 * color vocabulary.
 */
function Heading2({
  children,
  ...props
}: ComponentProps<"h2"> & { "data-os"?: string; "data-os-op"?: string }) {
  const op = props["data-os-op"];
  if (props["data-os"] !== "operation" || !op || !OPERATIONS.has(op)) {
    return <h2 {...props}>{children}</h2>;
  }
  return (
    <h2 {...props} className="os-operation">
      <Badge variant={operationBadge(op as DeltaOperation)}>{op}</Badge>
      <span>Requirements</span>
    </h2>
  );
}
