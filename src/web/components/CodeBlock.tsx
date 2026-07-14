import { useState, type ComponentProps } from "react";
import type { Element, ElementContent } from "hast";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

/** Collect the raw text of a hast subtree — the fence's source as authored,
 *  before highlighting split it into token spans. */
function rawText(node: ElementContent | Element | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map((child) => rawText(child)).join("");
  }
  return "";
}

type Props = ComponentProps<"pre"> & { node?: Element };

/**
 * A fenced code block plus a copy affordance (markdown-rendering).
 *
 * The copy control is an overlay owned by this component — never markup injected
 * into the document — and it copies the fence's raw source rather than the
 * highlighted spans. It reads and copies only; nothing here can modify a
 * document, consistent with the viewer's read-only guarantee.
 *
 * Highlighting (or its absence) is decided upstream by rehype-highlight: tagged
 * fences arrive with token markup, untagged ones arrive as plain text and are
 * rendered verbatim so ASCII diagrams keep their alignment.
 */
export function CodeBlock({ node, children, className, ...props }: Props) {
  const [copied, setCopied] = useState(false);
  const source = rawText(node);

  const copy = () => {
    void navigator.clipboard.writeText(source).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="md-code group relative">
      <button
        type="button"
        onClick={copy}
        title={copied ? "Copied" : "Copy code"}
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(
          "border-border bg-background text-muted-foreground hover:text-foreground absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-md border opacity-0 transition-opacity",
          "group-hover:opacity-100 focus-visible:opacity-100",
          copied && "text-op-added opacity-100",
        )}
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
      <pre className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}
