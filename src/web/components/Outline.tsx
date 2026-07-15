import type { OutlineItem } from "@/lib/use-document-outline";
import { cn } from "@/lib/utils";

/**
 * A rendered document's structure, as navigation (document-navigation).
 *
 * Lives on the right so it never displaces the navigation you arrived by — the
 * Specs page already spends its left column on the capability list. Collapses
 * out of the way on narrow viewports rather than stacking two nav columns above
 * the content.
 */
export function Outline({
  items,
  activeId,
  onSelect,
}: {
  items: OutlineItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) return null;

  const base = Math.min(...items.map((item) => item.level));

  return (
    <nav
      aria-label="Document outline"
      className="hidden lg:sticky lg:top-20 lg:block lg:self-start"
    >
      <h2 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        On this page
      </h2>
      <ul className="border-border flex flex-col gap-0.5 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              style={{ paddingLeft: `${0.6 + (item.level - base) * 0.6}rem` }}
              className={cn(
                "-ml-px block w-full border-l py-0.5 pr-2 text-left text-xs transition-colors",
                item.requirement && "font-medium",
                item.id === activeId
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
