"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageLightbox } from "@/components/ImageLightbox";
import type { GraphicFrame } from "@/lib/graphic-gallery";
import { aspectClass } from "@/lib/graphic-gallery";

type Props = {
  items: {
    src: string;
    alt: string;
    label?: string;
    frame?: GraphicFrame;
  }[];
  enlargeLabel: string;
  closeLabel: string;
};

export function LogoResourceGallery({
  items,
  enlargeLabel,
  closeLabel,
}: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const active = items.find((item) => item.src === lightbox);

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <figure key={item.src} className="flex flex-col gap-2">
            <button
              type="button"
              aria-label={`${enlargeLabel}: ${item.alt}`}
              onClick={() => setLightbox(item.src)}
              className={`group relative w-full overflow-hidden bg-sky-pale text-left ${aspectClass(
                item.frame,
              )}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                unoptimized={item.src.startsWith("/assets")}
                className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </button>
            {item.label ? (
              <figcaption className="text-sm text-ink/75">{item.label}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
      <ImageLightbox
        src={lightbox}
        alt={active?.alt ?? ""}
        onClose={() => setLightbox(null)}
        closeLabel={closeLabel}
      />
    </>
  );
}
