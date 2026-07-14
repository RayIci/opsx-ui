import type { ComponentProps } from "react";
import type { DeltaOperation } from "@shared/contracts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeHighlightCode } from "@/lib/rehype-highlight-code";
import { remarkOpenspec } from "@/lib/remark-openspec";
import { remarkHeadingIds } from "@/lib/remark-heading-ids";
import { rehypeMarkTarget } from "@/lib/rehype-mark-target";
import { operationBadge } from "@/lib/operations";
import { Badge } from "./ui/badge";
import { CodeBlock } from "./CodeBlock";
import { HeadingAnchor } from "./HeadingAnchor";
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
  targetId,
}: {
  children: string;
  className?: string;
  /** The deep-linked section to mark, if any. Applied as part of the render so
   *  it survives re-renders. */
  targetId?: string | null;
}) {
  return (
    <div className={cn("md-prose", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkOpenspec, remarkHeadingIds]}
        rehypePlugins={[
          rehypeHighlightCode,
          [rehypeMarkTarget, { id: targetId }],
        ]}
        components={{
          pre: CodeBlock,
          table: Table,
          h1: Heading("h1"),
          h2: Heading("h2"),
          h3: Heading("h3"),
          h4: Heading("h4"),
        }}
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

type HeadingTag = "h1" | "h2" | "h3" | "h4";
type HeadingProps = ComponentProps<"h2"> & {
  "data-os"?: string;
  "data-os-op"?: string;
};

/**
 * Headings carry their anchor (from remarkHeadingIds) and a copy-link
 * affordance, so any section — in practice, any requirement — is directly
 * shareable.
 *
 * A delta operation grouping (`## ADDED Requirements`) additionally renders its
 * operation as the same badge `SpecDiff` uses, so an operation means the same
 * thing whether you meet it in a rendered document or in the diff view. The
 * badge variant comes from the shared `operationBadge` helper — this must not
 * grow a second color vocabulary.
 */
function Heading(Tag: HeadingTag) {
  function HeadingComponent({ children, className, ...props }: HeadingProps) {
    const op = props["data-os-op"];
    const isOperation =
      props["data-os"] === "operation" && !!op && OPERATIONS.has(op);

    return (
      <Tag
        {...props}
        className={cn("group/h", isOperation && "os-operation", className)}
      >
        {isOperation ? (
          <>
            <Badge variant={operationBadge(op as DeltaOperation)}>{op}</Badge>
            <span>Requirements</span>
          </>
        ) : (
          children
        )}
        {props.id && <HeadingAnchor id={props.id} />}
      </Tag>
    );
  }
  return HeadingComponent;
}
