"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export type DashboardKpi = {
  id: string;
  label: string;
  count: number;
  href: string;
  thumbs: string[];
};

/** px/s — lenta, al estilo editor */
const KPI_MARQUEE_SPEED = 10;
const MIN_TRACK_PX = 320;
const CELL_PX = 72;
const GAP_PX = 8;

function buildLoopThumbs(thumbs: string[]): string[] {
  if (!thumbs.length) return [];
  const cell = CELL_PX + GAP_PX;
  const needed = Math.ceil(MIN_TRACK_PX / cell);
  const copies = Math.max(2, Math.ceil(needed / thumbs.length));
  const base: string[] = [];
  for (let i = 0; i < copies; i++) base.push(...thumbs);
  return [...base, ...base];
}

function ThumbMarquee({ thumbs }: { thumbs: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(40);
  const loop = useMemo(() => buildLoopThumbs(thumbs), [thumbs]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !loop.length) return;

    const measure = () => {
      const half = el.scrollWidth / 2;
      if (half <= 0) return;
      setDuration(Math.max(8, half / KPI_MARQUEE_SPEED));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loop]);

  if (!thumbs.length) {
    return (
      <div className="flex h-[4.5rem] items-center justify-center text-[10px] text-ink/40">
        Sin previews
      </div>
    );
  }

  return (
    <div
      className="kpi-marquee-viewport overflow-hidden"
      data-direction="right"
    >
      <div
        ref={trackRef}
        className="kpi-marquee-track flex w-max gap-2"
        style={{
          ["--kpi-marquee-duration" as string]: `${duration}s`,
        }}
      >
        {loop.map((src, i) => (
          <span
            key={`${src}-${i}`}
            className="relative aspect-square w-[4.5rem] shrink-0 overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="pointer-events-none size-full object-cover object-center"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

export function DashboardKpiGrid({ cards }: { cards: DashboardKpi[] }) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.href}
          className="group block bg-sky-pale px-4 py-4 transition-opacity hover:opacity-90"
        >
          <p className="text-xs uppercase tracking-wide text-ink/50">
            {card.label}
          </p>
          <p className="mt-1 text-3xl font-bold text-ink group-hover:underline">
            {card.count}
          </p>
          <div className="mt-3">
            <ThumbMarquee thumbs={card.thumbs} />
          </div>
        </Link>
      ))}
    </div>
  );
}
