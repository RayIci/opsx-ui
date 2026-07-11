import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Props {
  children: string;
  className?: string;
}

/**
 * Renders OpenSpec markdown as a document (task 3.2). Raw HTML is intentionally
 * NOT enabled (no rehype-raw) — spec content is treated as markdown only. Prose
 * styling lives in the `.md-prose` class in index.css so every surface renders
 * identically.
 */
export function Markdown({ children, className }: Props) {
  return (
    <div className={cn("md-prose", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
