"use client";

import { useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  hrefForBrandGraphic,
  t,
  titleForBrandGraphic,
  type GraphicItemContent,
  type RelatedGraphicPiece,
  type UiProjectContent,
} from "@/lib/content";
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

function relatedGraphicsForProject(
  project: UiProjectContent,
  graphicsBySection: Partial<
    Record<RelatedGraphicPiece["section"], GraphicItemContent[]>
  >,
  locale: Locale,
  viewIdentityLabel: string,
): Array<{ href: string; label: string }> {
  const brandId = project.brandId;
  if (!brandId) return [];
  const links: Array<{ href: string; label: string }> = [];
  for (const [section, items] of Object.entries(graphicsBySection) as Array<
    [RelatedGraphicPiece["section"], GraphicItemContent[] | undefined]
  >) {
    if (!items) continue;
    for (const item of items) {
      if (item.brandId !== brandId) continue;
      const piece: RelatedGraphicPiece = { ...item, section };
      const title = titleForBrandGraphic(piece, locale);
      links.push({
        href: hrefForBrandGraphic(locale, piece),
        label:
          section === "logos" ? `${viewIdentityLabel}: ${title}` : title,
      });
    }
  }
  return links;
}

export function InterfacesCategoryGrid({
  locale,
  dict,
  projects,
  brands,
  relatedGraphicsBySection = {},
}: {
  locale: Locale;
  dict: Dictionary;
  projects: UiProjectContent[];
  brands: BrandRef[];
  relatedGraphicsBySection?: Partial<
    Record<RelatedGraphicPiece["section"], GraphicItemContent[]>
  >;
}) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const base = projects.find((p) => p.id === detailId) ?? null;
  const detail = base
    ? {
        ...base,
        relatedGraphics: relatedGraphicsForProject(
          base,
          relatedGraphicsBySection,
          locale,
          dict.grafico.viewIdentity,
        ),
      }
    : null;

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-12 md:gap-14">
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
            <article key={project.id} className="flex max-w-3xl flex-col gap-3.5">
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
                  className="relative aspect-[644/362] w-full max-w-3xl cursor-zoom overflow-hidden bg-sky-pale text-left surface-glow interactive-media"
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
                  className="text-sm underline underline-offset-2 interactive-ink cursor-nav"
                >
                  {uiCtaLabel(project, dict)}
                </a>
              ) : (
                <span className="cursor-blocked text-sm underline underline-offset-2 opacity-50">
                  {dict.interfaces.prototypeUnavailable}
                </span>
              )}
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
