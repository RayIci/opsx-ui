import type { ActivityEntry } from "@shared/contracts";
import { ActivityFeed } from "./ActivityFeed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  entries: ActivityEntry[];
  live: boolean;
}

/**
 * The activity feed as an on-demand, right-side slide-over. Closed by default
 * and available on every route; opened from the shell header. A backdrop
 * dismisses it, and the panel itself never occupies the main layout.
 */
export function ActivityDrawer({ open, onClose, entries, live }: Props) {
  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-20 bg-black/30 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-label="Activity"
        aria-hidden={!open}
        className={cn(
          "bg-background border-border fixed inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-end px-2 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close activity"
          >
            <X />
          </Button>
        </div>
        <div className="min-h-0 flex-1 px-4 pb-4">
          <ActivityFeed entries={entries} live={live} />
        </div>
      </aside>
    </>
  );
}
