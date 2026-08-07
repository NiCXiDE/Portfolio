"use client";

import { ArrowDownAZ, CalendarArrowDown } from "lucide-react";

export type SortMode = "year" | "alpha";

type Props = {
  mode: SortMode;
  onChange: (mode: SortMode) => void;
  yearLabel: string;
  alphaLabel: string;
};

export function SortButtons({
  mode,
  onChange,
  yearLabel,
  alphaLabel,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={yearLabel}
        aria-pressed={mode === "year"}
        onClick={() => onChange("year")}
        className={`flex size-9 items-center justify-center rounded-full transition-colors ${
          mode === "year"
            ? "bg-ink text-sky-pale"
            : "bg-sky-pale text-ink hover:opacity-80"
        }`}
      >
        <CalendarArrowDown className="size-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label={alphaLabel}
        aria-pressed={mode === "alpha"}
        onClick={() => onChange("alpha")}
        className={`flex size-9 items-center justify-center rounded-full transition-colors ${
          mode === "alpha"
            ? "bg-ink text-sky-pale"
            : "bg-sky-pale text-ink hover:opacity-80"
        }`}
      >
        <ArrowDownAZ className="size-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
