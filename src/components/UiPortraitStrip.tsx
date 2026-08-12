"use client";

import Image from "next/image";
import type { UiSlide } from "@/lib/ui-slides";

type Props = {
  slides: readonly UiSlide[];
  alt: string;
  mixedLabel?: string;
  onOpenDetail?: () => void;
  openDetailLabel?: string;
  className?: string;
  sizes?: string;
};

/** Up to three portrait screens in a landscape interface frame. */
export function UiPortraitStrip({
  slides,
  alt,
  mixedLabel,
  onOpenDetail,
  openDetailLabel,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: Props) {
  const visible = slides.slice(0, 3);
  const frameClass = `relative aspect-[644/362] w-full overflow-hidden bg-sky-pale ${className}`;

  const content = (
    <>
      <div className="flex h-full w-full items-center justify-center gap-1 px-2 sm:gap-2 sm:px-3">
        {visible.map((slide) => (
          <div
            key={slide.src}
            className="relative aspect-[9/16] h-[88%] max-h-full w-full max-w-[32%] shrink-0 overflow-hidden"
          >
            <Image
              src={slide.src}
              alt={alt}
              fill
              className="object-contain object-center"
              sizes={sizes}
            />
          </div>
        ))}
      </div>
      {mixedLabel ? (
        <span className="pointer-events-none absolute left-2 top-2 z-10 bg-ink/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-pale">
          {mixedLabel}
        </span>
      ) : null}
      {onOpenDetail ? (
        <span className="absolute inset-0 z-[1] cursor-zoom-in" aria-hidden />
      ) : null}
    </>
  );

  if (onOpenDetail) {
    return (
      <button
        type="button"
        aria-label={openDetailLabel}
        onClick={onOpenDetail}
        className={`${frameClass} text-left`}
      >
        {content}
      </button>
    );
  }

  return <div className={frameClass}>{content}</div>;
}

export function isAllPortraitSlides(slides: readonly UiSlide[]) {
  return slides.length > 0 && slides.every((s) => s.aspect === "portrait");
}
