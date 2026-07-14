import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  /** A disabled option is shown greyed and cannot be selected. */
  disabled?: boolean;
}

interface Props<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "bg-secondary inline-flex items-center gap-0.5 rounded-lg p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              option.disabled &&
                "hover:text-muted-foreground cursor-not-allowed opacity-40",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
