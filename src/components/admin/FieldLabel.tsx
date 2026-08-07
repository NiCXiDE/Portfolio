import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function FieldLabel({
  icon: Icon,
  children,
  hint,
}: {
  icon?: LucideIcon;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1 flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
        {Icon ? <Icon className="size-3.5 opacity-60" strokeWidth={1.75} /> : null}
        {children}
      </span>
      {hint ? <span className="text-xs text-ink/50">{hint}</span> : null}
    </div>
  );
}

export const fieldClass =
  "w-full border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-ink/50";
