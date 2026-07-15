import { useEffect, useState, type RefObject } from "react";

export interface OutlineItem {
  id: string;
  text: string;
  level: number;
  /** Requirements are what people navigate a spec for, so they are marked. */
  requirement: boolean;
}

/** Below this, an outline is furniture rather than navigation. */
const MIN_ITEMS = 3;

const HEADINGS = "h1[id], h2[id], h3[id], h4[id]";

/**
 * The outline of a rendered document, read from the DOM after render
 * (document-navigation).
 *
 * Reading the rendered output — rather than parsing the source a second time —
 * guarantees the outline's ids are exactly the ids the renderer produced; two
 * independent parses could drift. The same elements are what the position
 * indicator has to observe anyway.
 */
export function useDocumentOutline(
  container: RefObject<HTMLElement | null>,
  /** Re-scan when the rendered content changes. */
  contentKey: unknown,
): { items: OutlineItem[]; activeId: string | null } {
  const [items, setItems] = useState<OutlineItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = container.current;
    if (!root) return;

    const found: OutlineItem[] = [...root.querySelectorAll(HEADINGS)].map(
      (el) => ({
        id: el.id,
        text: el.textContent?.trim() ?? "",
        level: Number(el.tagName.slice(1)),
        requirement: el.getAttribute("data-os") === "requirement",
      }),
    );
    setItems(found.length >= MIN_ITEMS ? found : []);
    setActiveId(null);
    if (found.length < MIN_ITEMS) return;

    // Passive observation: the indicator tracks reading position but never
    // rewrites history — churning the URL on scroll would poison the back
    // button that app-navigation guarantees.
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const first = found.find((item) => visible.has(item.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const el of root.querySelectorAll(HEADINGS)) observer.observe(el);
    return () => observer.disconnect();
  }, [container, contentKey]);

  return { items, activeId };
}
