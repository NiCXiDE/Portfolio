"use client";

import { useEffect, useRef, useState } from "react";
import type {
  MarqueeDisplayMode,
  MarqueeDirection,
  MarqueeSectionConfig,
} from "@/lib/home-layout";
import type { NamedListItemContent } from "@/lib/content";

type Props = {
  items: NamedListItemContent[];
  config: MarqueeSectionConfig;
  className?: string;
};

function MarqueeItem({
  item,
  displayMode,
}: {
  item: NamedListItemContent;
  displayMode: MarqueeDisplayMode;
}) {
  const showLogo =
    (displayMode === "logo" || displayMode === "both") && Boolean(item.logo);
  const showName =
    displayMode === "name" ||
    displayMode === "both" ||
    (displayMode === "logo" && !item.logo);

  if (displayMode === "both" && showLogo) {
    return (
      <span className="marquee-item marquee-item--stack">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.logo!} alt="" className="marquee-logo" />
        {showName ? (
          <span className="marquee-label">{item.label}</span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="marquee-item">
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.logo!}
          alt={showName ? "" : item.label}
          className="marquee-logo"
        />
      ) : null}
      {showName ? <span className="marquee-label">{item.label}</span> : null}
    </span>
  );
}

function MarqueeTrack({
  items,
  displayMode,
  direction,
  speed,
}: {
  items: NamedListItemContent[];
  displayMode: MarqueeDisplayMode;
  direction: MarqueeDirection;
  speed: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      const half = el.scrollWidth / 2;
      if (half <= 0) return;
      setDuration(Math.max(8, half / Math.max(speed, 1)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items, speed, displayMode]);

  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <div className="marquee-viewport" data-direction={direction}>
      <div
        ref={trackRef}
        className="marquee-track"
        style={{
          ["--marquee-duration" as string]: `${duration}s`,
        }}
      >
        {loop.map((item, i) => (
          <MarqueeItem
            key={`${item.id}-${i}`}
            item={item}
            displayMode={displayMode}
          />
        ))}
      </div>
    </div>
  );
}

/** Distribute items across N lines (round-robin). */
function splitLines(items: NamedListItemContent[], lines: number) {
  const n = Math.max(1, Math.min(lines, items.length || 1));
  const buckets: NamedListItemContent[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => {
    buckets[i % n].push(item);
  });
  return buckets;
}

export function InfiniteMarquee({ items, config, className = "" }: Props) {
  if (!items.length) return null;

  const lines = splitLines(items, config.lines);

  return (
    <div className={`marquee-stack w-full ${className}`.trim()}>
      {lines.map((lineItems, i) => (
        <MarqueeTrack
          key={i}
          items={lineItems}
          displayMode={config.displayMode}
          direction={config.direction}
          speed={config.speed}
        />
      ))}
    </div>
  );
}
