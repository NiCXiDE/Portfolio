"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Info, type LucideIcon } from "lucide-react";

function HintInfo({ text }: { text: string }) {
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = window.setTimeout(() => setMounted(false), 300);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!pinned) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setPinned(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPinned(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  return (
    <span
      ref={rootRef}
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-label="Más información"
        aria-expanded={open}
        aria-describedby={mounted ? id : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPinned((v) => !v);
        }}
        className={`inline-flex size-4 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/40 ${
          open ? "text-ink" : "text-ink/40 hover:text-ink/70"
        }`}
      >
        <Info className="size-3.5" strokeWidth={1.75} aria-hidden />
      </button>
      {mounted ? (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute bottom-[calc(100%+0.45rem)] left-1/2 z-30 w-max max-w-[16rem] -translate-x-1/2 border border-ink/10 bg-white px-2.5 py-1.5 text-left text-xs font-normal leading-snug text-ink/75 shadow-sm transition-[opacity,transform] duration-300 ease-out ${
            shown
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0"
          }`}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

export function FieldLabel({
  icon: Icon,
  children,
  hint,
}: {
  icon?: LucideIcon;
  children: ReactNode;
  hint?: string;
  /** @deprecated kept for call-site compat; hints now use the info button */
  hintClassName?: string;
}) {
  return (
    <div className="mb-1">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
        {Icon ? (
          <Icon className="size-3.5 opacity-60" strokeWidth={1.75} />
        ) : null}
        <span>{children}</span>
        {hint ? <HintInfo text={hint} /> : null}
      </span>
    </div>
  );
}

export const fieldClass =
  "w-full border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-ink/50";

/** Extra right padding so the native chevron doesn’t hug the border */
export const selectClass = `${fieldClass} appearance-none pr-11`;
