"use client";

import { useEffect, useState } from "react";
import type { LayerId } from "@/lib/layers";

type Props = {
  label: string;
  layer: LayerId;
  getScroller: () => HTMLElement | null;
};

const THRESHOLD = 360;

export function BackToTop({ label, layer, getScroller }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scroller = getScroller();
    if (!scroller) {
      setVisible(false);
      return;
    }
    const onScroll = () => setVisible(scroller.scrollTop > THRESHOLD);
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [getScroller, layer]);

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        getScroller()?.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={`fixed bottom-20 right-4 z-40 flex size-11 items-center justify-center rounded-full bg-ink text-sky-pale shadow-[0_4px_16px_rgba(64,65,121,0.35)] transition-[opacity,transform] duration-200 md:bottom-7 md:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden
      >
        <path
          d="M9 14.5V3.5M9 3.5L4 8.5M9 3.5L14 8.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
