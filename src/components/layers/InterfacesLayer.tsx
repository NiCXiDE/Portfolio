"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BrandVectorMask,
  isSvgAsset,
} from "@/components/BrandVector";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Lightbulb,
  Network,
  Presentation,
  Smartphone,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  hrefForBrandGraphic,
  t,
  titleForBrandGraphic,
  type LocalizedString,
  type PortfolioContent,
  type RelatedGraphicPiece,
} from "@/lib/content";
import { SortButtons, type SortMode } from "@/components/SortButtons";
import { pathForLayer } from "@/lib/layers";
import { renderMentionedText } from "@/components/MentionText";
import type { UiCategory } from "@/db/entities";
import {
  UiProjectDetailModal,
  uiCtaLabel,
  type UiProjectDetail,
} from "@/components/UiProjectDetailModal";
import {
  mixedPlatformLabel,
  normalizeUiSlides,
  type UiSlide,
} from "@/lib/ui-slides";
import {
  UiPortraitStrip,
  isAllPortraitSlides,
} from "@/components/UiPortraitStrip";

type Props = {
  locale: Locale;
  dict: Dictionary;
  content: PortfolioContent;
};

type UiProject = UiProjectDetail & { category: UiCategory };

function relatedGraphicsForProject(
  project: { brandId?: string | null },
  content: PortfolioContent,
  locale: Locale,
  viewIdentityLabel: string,
): Array<{ href: string; label: string }> {
  const brandId = project.brandId;
  if (!brandId) return [];
  const buckets: Array<{
    section: RelatedGraphicPiece["section"];
    items: PortfolioContent["logos"];
  }> = [
    { section: "logos", items: content.logos },
    { section: "banners", items: content.banners },
    { section: "eventos", items: content.eventos },
    { section: "covers", items: content.covers },
    { section: "illustration", items: content.illustration },
    { section: "personal", items: content.personal },
  ];
  const links: Array<{ href: string; label: string }> = [];
  for (const { section, items } of buckets) {
    for (const item of items) {
      if (item.brandId !== brandId) continue;
      const piece: RelatedGraphicPiece = { ...item, section };
      const title = titleForBrandGraphic(piece, locale);
      links.push({
        href: hrefForBrandGraphic(locale, piece),
        label:
          section === "logos"
            ? `${viewIdentityLabel}: ${title}`
            : title,
      });
    }
  }
  return links;
}

type IconType = ComponentType<LucideProps>;

const CATEGORY_META: {
  id: UiCategory;
  icon: IconType;
}[] = [
  { id: "sistemas-a-medida", icon: LayoutDashboard },
  { id: "preventas", icon: Presentation },
  { id: "apps-mobile", icon: Smartphone },
  { id: "proyectos-personales", icon: Lightbulb },
  { id: "system-design", icon: Network },
];

const slideEase = [0.22, 1, 0.36, 1] as const;

function scrollWithinPane(targetId: string) {
  const target = document.getElementById(targetId);
  const scroller = target?.closest(".site-scroll") as HTMLElement | null;
  if (!target || !scroller) return;
  const header = scroller.querySelector("header");
  const headerH = header?.getBoundingClientRect().height ?? 0;
  const nextTop =
    scroller.scrollTop +
    (target.getBoundingClientRect().top - scroller.getBoundingClientRect().top) -
    headerH -
    8;
  scroller.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
}

function yearFromMeta(meta: LocalizedString, locale: Locale): number {
  const text = t(meta, locale);
  const match = text.match(/\b(20\d{2}|19\d{2})\b/);
  return match ? Number(match[1]) : Number.NEGATIVE_INFINITY;
}

function sortProjects(
  items: UiProject[],
  mode: SortMode,
  locale: Locale,
): UiProject[] {
  const copy = [...items];
  if (mode === "year") {
    copy.sort((a, b) => {
      const ya = yearFromMeta(a.meta, locale);
      const yb = yearFromMeta(b.meta, locale);
      if (yb !== ya) return yb - ya;
      return t(a.title, locale).localeCompare(t(b.title, locale), locale);
    });
  } else {
    copy.sort((a, b) =>
      t(a.title, locale).localeCompare(t(b.title, locale), locale),
    );
  }
  return copy;
}

function ProjectCarousel({
  slides,
  alt,
  dict,
  autoMs,
  onOpenDetail,
  mixedLabel,
}: {
  slides: readonly UiSlide[];
  alt: string;
  dict: Dictionary;
  autoMs: number;
  onOpenDetail?: () => void;
  mixedLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovering, setHovering] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const total = slides.length;
  const current = slides[index];
  const frameClass =
    "relative aspect-[644/362] w-full max-w-3xl overflow-hidden bg-sky-pale surface-glow";

  const goTo = (next: number, dir: 1 | -1) => {
    setDirection(dir);
    setIndex(((next % total) + total) % total);
    setProgressKey((k) => k + 1);
  };

  const go = (dir: -1 | 1) => {
    goTo(index + dir, dir);
  };

  useEffect(() => {
    if (!hovering || total <= 1 || reduceMotion) return;
    const id = window.setTimeout(() => {
      goTo(index + 1, 1);
    }, autoMs);
    return () => window.clearTimeout(id);
  }, [hovering, index, total, reduceMotion, progressKey, autoMs]);

  if (total === 0) {
    return (
      <button
        type="button"
        aria-label={dict.interfaces.openDetail}
        onClick={onOpenDetail}
        className="relative flex aspect-[644/362] w-full max-w-3xl cursor-zoom items-center justify-center overflow-hidden bg-sky-pale surface-glow disabled:cursor-blocked"
        disabled={!onOpenDetail}
      >
        <span className="text-sm text-ink/50 md:text-base">-</span>
      </button>
    );
  }

  if (isAllPortraitSlides(slides)) {
    return (
      <UiPortraitStrip
        slides={slides}
        alt={alt}
        mixedLabel={mixedLabel}
        onOpenDetail={onOpenDetail}
        openDetailLabel={dict.interfaces.openDetail}
      />
    );
  }

  return (
    <div
      className={frameClass}
      onMouseEnter={() => {
        setHovering(true);
        setProgressKey((k) => k + 1);
      }}
      onMouseLeave={() => setHovering(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current.src}
          custom={direction}
          variants={{
            enter: (d: number) =>
              reduceMotion
                ? { opacity: 0 }
                : { x: `${d * 100}%`, opacity: 0.85 },
            center: { x: 0, opacity: 1 },
            exit: (d: number) =>
              reduceMotion
                ? { opacity: 0 }
                : { x: `${d * -100}%`, opacity: 0.85 },
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduceMotion ? 0.15 : 0.38, ease: slideEase }}
          className="absolute inset-0"
        >
          <Image
            src={current.src}
            alt={`${alt} (${index + 1}/${total})`}
            fill
            className={
              current.aspect === "portrait"
                ? "object-contain object-center"
                : "object-cover object-top"
            }
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </AnimatePresence>

      {mixedLabel ? (
        <span className="pointer-events-none absolute left-2 top-2 z-10 bg-ink/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky-pale">
          {mixedLabel}
        </span>
      ) : null}

      {onOpenDetail ? (
        <button
          type="button"
          aria-label={dict.interfaces.openDetail}
          onClick={onOpenDetail}
          className="absolute inset-0 z-[1] cursor-zoom"
        />
      ) : null}

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label={dict.interfaces.carouselPrev}
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 text-sky-pale transition-opacity hover:opacity-80"
          >
            <ChevronLeft className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={dict.interfaces.carouselNext}
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-ink/80 text-sky-pale transition-opacity hover:opacity-80"
          >
            <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
          <div className="absolute bottom-2 left-0 right-0 z-10 flex items-center justify-center gap-1.5">
            {slides.map((_, i) => {
              const active = i === index;
              if (!active) {
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${i + 1}`}
                    onClick={() => goTo(i, i > index ? 1 : -1)}
                    className="size-1.5 rounded-full bg-ink/30 transition-colors hover:bg-ink/50"
                  />
                );
              }
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${i + 1}`}
                  onClick={() => setProgressKey((k) => k + 1)}
                  className="relative h-1.5 w-6 overflow-hidden rounded-full bg-ink/25"
                >
                  {hovering && !reduceMotion ? (
                    <span
                      key={progressKey}
                      className="absolute inset-y-0 left-0 bg-ink"
                      style={{
                        animation: `carousel-progress ${autoMs}ms linear forwards`,
                      }}
                    />
                  ) : (
                    <span className="absolute inset-0 bg-ink" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function InterfacesLayer({ locale, dict, content }: Props) {
  const projects = content.uiProjects as readonly UiProject[];
  const autoMs = content.settings.carouselIntervalMs;
  const brandsById = useMemo(
    () => Object.fromEntries(content.brands.map((b) => [b.id, b])),
    [content.brands],
  );
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sorts, setSorts] = useState<Record<UiCategory, SortMode>>({
    "sistemas-a-medida": "year",
    preventas: "year",
    "apps-mobile": "year",
    "proyectos-personales": "year",
    "system-design": "year",
  });

  const detailProject = (() => {
    const project = projects.find((p) => p.id === detailId) ?? null;
    if (!project) return null;
    return {
      ...project,
      relatedGraphics: relatedGraphicsForProject(
        project,
        content,
        locale,
        dict.grafico.viewIdentity,
      ),
    };
  })();
  const categoryLabel = (cat: UiCategory) => {
    if (cat === "preventas") return dict.interfaces.catPreventas;
    if (cat === "sistemas-a-medida") return dict.interfaces.catSistemas;
    if (cat === "system-design") return dict.interfaces.catSystemDesign;
    if (cat === "apps-mobile") return dict.interfaces.catAppsMobile;
    return dict.interfaces.catPersonales;
  };

  const jumps = CATEGORY_META.map((c) => ({
    id: `ui-${c.id}`,
    label: categoryLabel(c.id),
    icon: c.icon,
  })).filter((j) =>
    projects.some((p) => p.category === j.id.replace(/^ui-/, "") as UiCategory),
  );

  const sortedByCategory = useMemo(() => {
    const map = {} as Record<UiCategory, UiProject[]>;
    for (const cat of CATEGORY_META.map((c) => c.id)) {
      map[cat] = sortProjects(
        projects.filter((p) => p.category === cat),
        sorts[cat],
        locale,
      );
    }
    return map;
  }, [projects, sorts, locale]);

  const orphanedListItems = useMemo(() => {
    const projectIds = new Set(projects.map((p) => p.id));
    return content.uiList.filter((item) => {
      if (projectIds.has(item.id)) return false;
      if (
        "caption" in item &&
        typeof item.caption === "string" &&
        projectIds.has(item.caption)
      ) {
        return false;
      }
      return true;
    });
  }, [content.uiList, projects]);

  return (
    <main className="flex w-full flex-col items-center overflow-x-clip">
      <div className="flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-8 sm:gap-8 sm:px-6 md:px-8 lg:px-10">
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
            <Image
              src="/assets/interfaces/brand/ruler.svg"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <h1 className="text-xl font-normal leading-tight text-ink sm:text-2xl md:text-[1.65rem]">
              {dict.interfaces.titlePrefix}
              <span className="font-bold">{dict.interfaces.titleBold}</span>
            </h1>
            <p className="text-sm text-ink md:text-base">
              {dict.interfaces.subtitle}
            </p>
          </div>
        </div>

        {jumps.length > 0 && (
          <nav
            aria-label={dict.interfaces.titleBold}
            className="flex w-full flex-wrap gap-x-1 gap-y-2 text-sm text-ink md:text-base"
          >
            {jumps.map((j, i) => {
              const Icon = j.icon;
              return (
                <span key={j.id} className="inline-flex items-center">
                  {i > 0 && (
                    <span aria-hidden className="mx-2 text-ink/35">
                      ·
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => scrollWithinPane(j.id)}
                    className="inline-flex items-center gap-1.5 underline-offset-4 interactive-ink hover:underline"
                  >
                    <Icon
                      className="size-3.5 shrink-0 opacity-80"
                      strokeWidth={1.75}
                    />
                    {j.label}
                  </button>
                </span>
              );
            })}
          </nav>
        )}

        {CATEGORY_META.map(({ id: cat, icon: Icon }) => {
          const items = sortedByCategory[cat];
          if (items.length === 0) return null;
          return (
            <section key={cat} className="flex w-full flex-col gap-8">
              <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <h2
                  id={`ui-${cat}`}
                  className="scroll-mt-24 inline-flex items-center gap-2 text-xl font-bold text-ink md:text-2xl"
                >
                  <Icon
                    className="size-5 shrink-0 md:size-6"
                    strokeWidth={1.75}
                  />
                  {categoryLabel(cat)}
                </h2>
                <SortButtons
                  mode={sorts[cat]}
                  onChange={(mode) =>
                    setSorts((prev) => ({ ...prev, [cat]: mode }))
                  }
                  yearLabel={dict.common.sortByYear}
                  alphaLabel={dict.common.sortByName}
                />
              </div>
              <div className="grid w-full grid-cols-1 gap-12 md:gap-14">
                {items.map((project) => {
                  const href = project.prototypeUrl;
                  return (
                    <article key={project.id} className="flex max-w-3xl flex-col gap-3.5">
                      <h3 className="text-sm font-bold text-ink sm:text-base">
                        {t(project.title, locale)}
                      </h3>
                      <ProjectCarousel
                        slides={normalizeUiSlides(project.images)}
                        alt={t(project.title, locale)}
                        dict={dict}
                        autoMs={autoMs}
                        onOpenDetail={() => setDetailId(project.id)}
                        mixedLabel={
                          mixedPlatformLabel(
                            normalizeUiSlides(project.images),
                            t(project.meta, locale),
                            {
                              mixed: dict.interfaces.mixedPlatformBadge,
                              totem: dict.interfaces.mixedTotemBadge,
                            },
                          ) ?? undefined
                        }
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink">
                        <span>
                          {renderMentionedText(
                            t(project.meta, locale),
                            brandsById,
                          )}
                        </span>
                        {href ? (
                          <a
                            href={href}
                            {...(href.startsWith("/")
                              ? {}
                              : { target: "_blank", rel: "noreferrer" })}
                            className="underline underline-offset-2 interactive-ink cursor-nav"
                          >
                            {uiCtaLabel(project, dict)}
                          </a>
                        ) : (
                          <span
                            className="cursor-blocked underline underline-offset-2 opacity-50"
                            title={dict.interfaces.prototypeUnavailableHint}
                          >
                            {dict.interfaces.prototypeUnavailable}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        {orphanedListItems.length > 0 ? (
          <section className="flex w-full flex-col gap-6">
            <h2 className="text-xl font-bold text-ink md:text-2xl">
              {dict.interfaces.orphanListHeading}
            </h2>
            <div className="grid w-full grid-cols-1 gap-6 md:gap-8">
              {orphanedListItems.map((item) => {
                const logo =
                  "logo" in item && typeof item.logo === "string"
                    ? item.logo
                    : null;
                const wordmark =
                  "wordmark" in item && typeof item.wordmark === "string"
                    ? item.wordmark
                    : null;
                const caption =
                  "caption" in item && typeof item.caption === "string"
                    ? item.caption
                    : null;
                return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-2.5 border border-ink/10 bg-white p-3 sm:p-4"
                  >
                    <div className="relative flex aspect-[644/362] w-full max-w-3xl items-center justify-center overflow-hidden bg-sky-pale surface-glow">
                      {logo ? (
                        isSvgAsset(logo) ? (
                          <BrandVectorMask
                            src={logo}
                            className="h-16 w-40 sm:h-20 sm:w-52"
                            position="left center"
                          />
                        ) : (
                          <div className="relative h-16 w-40 sm:h-20 sm:w-52">
                            <Image
                              src={logo}
                              alt=""
                              fill
                              className="object-contain object-left"
                            />
                          </div>
                        )
                      ) : wordmark ? (
                        <p className="px-4 text-center text-[clamp(1.25rem,3vw,2rem)] font-bold leading-tight text-ink">
                          {wordmark}
                        </p>
                      ) : (
                        <span className="text-sm text-ink/35">
                          {dict.interfaces.placeholderVisual}
                        </span>
                      )}
                    </div>
                    {caption ? (
                      <p className="text-sm text-ink/70">{caption}</p>
                    ) : null}
                    <p className="text-sm font-bold text-ink sm:text-base">
                      {t(item.title, locale)}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <p className="mt-10 max-w-xl text-sm text-ink/70 sm:text-base">
          {dict.interfaces.cmsCta}{" "}
          <Link
            href="/admin/login"
            className="font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            {dict.interfaces.cmsCtaLink}
          </Link>
        </p>
      </div>

      <UiProjectDetailModal
        project={detailProject}
        locale={locale}
        dict={dict}
        brands={content.brands}
        onClose={() => setDetailId(null)}
      />
    </main>
  );
}
