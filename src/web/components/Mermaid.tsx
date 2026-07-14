import { useEffect, useId, useRef, useState } from "react";
import { useIsDarkTheme } from "@/lib/theme";

type State =
  | { status: "drawing" }
  | { status: "drawn"; svg: string }
  | { status: "failed" };

type MermaidApi = (typeof import("mermaid"))["default"];
let loading: Promise<MermaidApi> | null = null;

/**
 * Load mermaid once and share it. Memoizing matters beyond tidiness: a document
 * with several diagrams would otherwise fire one dynamic import per diagram,
 * concurrently, and they do not reliably all settle — one diagram would draw and
 * the rest would sit at "drawing" forever.
 */
function loadMermaid(): Promise<MermaidApi> {
  loading ??= import("mermaid").then((module) => module.default);
  return loading;
}

/**
 * A `mermaid` fence rendered as a diagram (markdown-rendering).
 *
 * Mermaid is imported dynamically, so it is absent from the initial bundle and
 * fetched only by documents that actually contain a diagram — today's corpus has
 * none, so this change costs real users nothing until they write one.
 *
 * Two failure modes are handled deliberately:
 *  - Mermaid throws on malformed input, and document content comes from an
 *    arbitrary project that may be mid-edit (an agent could be writing the file
 *    as it is watched and re-rendered). An uncaught throw would turn a typo in
 *    one diagram into a blank document, so rendering is contained and degrades
 *    to the fence's source.
 *  - Diagrams are drawn output, not styled DOM, so CSS cannot restyle them after
 *    the fact — a diagram drawn for the light theme really is a white rectangle
 *    in a dark document. They are re-rendered when the theme changes.
 */
export function Mermaid({ source }: { source: string }) {
  const [state, setState] = useState<State>({ status: "drawing" });
  const dark = useIsDarkTheme();
  // Mermaid needs a unique id per render target.
  const id = useId().replace(/:/g, "");
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setState({ status: "drawing" });

    void (async () => {
      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          theme: dark ? "dark" : "default",
          // Do not trust the diagram source either: it is project content.
          securityLevel: "strict",
          fontFamily: "var(--font-sans)",
        });
        const { svg } = await mermaid.render(`mmd-${id}`, source);
        if (active) setState({ status: "drawn", svg });
      } catch {
        if (active) setState({ status: "failed" });
      }
    })();

    return () => {
      active = false;
    };
  }, [source, dark, id]);

  if (state.status === "failed") {
    return (
      <div className="md-code">
        <p className="text-muted-foreground mb-1 text-xs">
          This diagram could not be rendered.
        </p>
        <pre>
          <code>{source}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={container}
      className="md-mermaid"
      // Reserve space so the document does not reflow as diagrams draw in.
      data-drawing={state.status === "drawing" ? "" : undefined}
      // Mermaid returns SVG markup it generated and sanitized itself. This is
      // the component's own container, not the markdown pipeline — rehype-raw
      // stays off, so project markdown still cannot inject markup.
      dangerouslySetInnerHTML={
        state.status === "drawn" ? { __html: state.svg } : undefined
      }
    />
  );
}
