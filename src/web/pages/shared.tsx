import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

export function CenteredLoader() {
  return (
    <div className="text-muted-foreground flex justify-center py-24">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}

export function BackLink({
  to,
  label = "Back",
}: {
  to: string;
  label?: string;
}) {
  return (
    <Link
      to={to}
      className="text-muted-foreground hover:text-foreground mb-4 -ml-1 inline-flex items-center gap-1.5 text-sm transition-colors"
    >
      <ArrowLeft className="size-4" /> {label}
    </Link>
  );
}
