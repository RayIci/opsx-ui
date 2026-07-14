import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeHighlightCode } from "@/lib/rehype-highlight-code";
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
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlightCode]}
        components={{ pre: CodeBlock, table: Table }}
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
