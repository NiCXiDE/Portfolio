"use client";

import { useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { t, type UiProjectContent } from "@/lib/content";
import { MentionedText } from "@/components/MentionText";
import type { BrandRef } from "@/lib/brands";
import {
  UiProjectDetailModal,
  uiCtaLabel,
} from "@/components/UiProjectDetailModal";
import {
  coverSlide,
  mixedPlatformLabel,
  normalizeUiSlides,
} from "@/lib/ui-slides";
import {
  UiPortraitStrip,
  isAllPortraitSlides,
} from "@/components/UiPortraitStrip";

export function InterfacesCategoryGrid({
  locale,
  dict,
  projects,
  brands,
}: {
  locale: Locale;
  dict: Dictionary;
  projects: UiProjectContent[];
  brands: BrandRef[];
}) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = projects.find((p) => p.id === detailId) ?? null;

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        {projects.map((project) => {
          const slides = normalizeUiSlides(project.images);
          const cover = coverSlide(slides);
          const allPortrait = isAllPortraitSlides(slides);
          const mixedLabel = mixedPlatformLabel(
            slides,
            t(project.meta, locale),
            {
              mixed: dict.interfaces.mixedPlatformBadge,
              totem: dict.interfaces.mixedTotemBadge,
            },
          );
          return (
            <article key={project.id} className="flex flex-col gap-2.5">
              <h2 className="text-sm font-bold text-ink sm:text-base">
                {t(project.title, locale)}
              </h2>
              {allPortrait && slides.length > 0 ? (
                <UiPortraitStrip
                  slides={slides}
                  alt={t(project.title, locale)}
                  mixedLabel={mixedLabel ?? undefined}
                  onOpenDetail={() => setDetailId(project.id)}
                  openDetailLabel={dict.interfaces.openDetail}
                />
              ) : cover ? (
                <button
                  type="button"
                  aria-label={dict.interfaces.openDetail}
                  onClick={() => setDetailId(project.id)}
                  className="relative aspect-[644/362] w-full cursor-zoom-in overflow-hidden bg-sky-pale text-left"
                >
                  <Image
                    src={cover.src}
                    alt={t(project.title, locale)}
                    fill
                    className={
                      cover.aspect === "portrait"
                        ? "object-contain object-center"
                        : "object-cover"
                    }
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {mixedLabel ? (
                    <span className="absolute left-2 top-2 bg-ink/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-pale">
                      {mixedLabel}
                    </span>
                  ) : null}
                </button>
              ) : null}
              <p className="text-sm text-ink">
                <MentionedText text={t(project.meta, locale)} brands={brands} />
              </p>
              {project.prototypeUrl ? (
                <a
                  href={project.prototypeUrl}
                  {...(project.prototypeUrl.startsWith("/")
                    ? {}
                    : { target: "_blank", rel: "noreferrer" })}
                  className="text-sm underline underline-offset-2"
                >
                  {uiCtaLabel(project, dict)}
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
      <UiProjectDetailModal
        project={detail}
        locale={locale}
        dict={dict}
        brands={brands}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}
