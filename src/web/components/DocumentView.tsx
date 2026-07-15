import { useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Markdown } from "./Markdown";
import { Outline } from "./Outline";
import { useDocumentOutline } from "@/lib/use-document-outline";
import { useFragmentTarget } from "@/lib/use-fragment-target";
import { cn } from "@/lib/utils";

/**
 * A rendered document plus its navigation (document-navigation): the markdown
 * itself, an outline of its structure when it has enough to navigate, and
 * accurate arrival when opened at a deep link.
 *
 * Selecting an outline entry updates the URL — a deliberate act, so the back
 * button takes you where you were. Scrolling never does (see useDocumentOutline).
 */
export function DocumentView({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const { items, activeId } = useDocumentOutline(container, children);
  const targetId = useFragmentTarget(container, children);

  const select = useCallback(
    (id: string) => navigate(`${pathname}${search}#${id}`),
    [navigate, pathname, search],
  );

  const hasOutline = items.length > 0;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8",
        hasOutline && "lg:grid-cols-[minmax(0,1fr)_180px]",
        className,
      )}
    >
      <div ref={container} className="min-w-0">
        <Markdown targetId={targetId}>{children}</Markdown>
      </div>
      {hasOutline && (
        <Outline items={items} activeId={activeId} onSelect={select} />
      )}
    </div>
  );
}
