import { useEffect, useState, type RefObject } from "react";
import { useLocation } from "react-router-dom";

/** How long the arrival marker stays on the targeted section. */
const MARK_MS = 1600;

/**
 * Resolve the URL's targeted section once the document has rendered, scroll to
 * it, and report it so the renderer can mark it (document-navigation).
 *
 * This exists because the browser's native fragment scroll fires while the
 * document is still loading — `api.document(...)` has not resolved, the target
 * does not exist yet, and a cold-opened deep link silently does nothing. So we
 * resolve the fragment ourselves *after* content renders, and again whenever the
 * target or the content changes.
 *
 * The mark is returned rather than written onto the DOM here: it has to survive
 * re-renders, so the renderer applies it declaratively.
 *
 * A fragment with no matching target is not an error — the document simply
 * renders from the top, since a spec may have been edited since the link was made.
 */
export function useFragmentTarget(
  container: RefObject<HTMLElement | null>,
  /** Changes when the rendered content changes. */
  contentKey: unknown,
): string | null {
  const { hash } = useLocation();
  const [targetId, setTargetId] = useState<string | null>(null);

  useEffect(() => {
    const root = container.current;
    if (!root || !hash) {
      setTargetId(null);
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    // Look the id up rather than building a selector string: a hand-edited URL
    // can contain anything, and this needs no escaping to stay safe.
    const target = id ? root.ownerDocument.getElementById(id) : null;
    // Unknown target, or one outside this document → leave it at the top.
    if (!target || !root.contains(target)) {
      setTargetId(null);
      return;
    }

    target.scrollIntoView({ block: "start", behavior: "smooth" });
    setTargetId(id);
    const timer = window.setTimeout(() => setTargetId(null), MARK_MS);
    return () => window.clearTimeout(timer);
  }, [container, hash, contentKey]);

  return targetId;
}
