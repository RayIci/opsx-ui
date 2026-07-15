import { useState } from "react";
import { Link2, Check } from "lucide-react";

/**
 * Copy a link addressing this heading (document-navigation), so a precise
 * reference — usually to a single requirement — can be shared without
 * hand-building the URL.
 */
export function HeadingAnchor({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Link copied" : "Copy link to this section"}
      aria-label={copied ? "Link copied" : "Copy link to this section"}
      className="text-muted-foreground hover:text-foreground ml-1.5 inline-flex size-5 shrink-0 translate-y-[0.05em] items-center justify-center rounded opacity-0 transition-opacity group-hover/h:opacity-100 focus-visible:opacity-100"
    >
      {copied ? (
        <Check className="text-op-added size-3" />
      ) : (
        <Link2 className="size-3" />
      )}
    </button>
  );
}
