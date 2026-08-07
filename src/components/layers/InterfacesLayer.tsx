"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Lightbulb,
  Presentation,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { content, t, type LocalizedString } from "@/lib/content";
import { SortButtons, type SortMode } from "@/components/SortButtons";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

type UiCategory = "preventas" | "sistemas-a-medida" | "proyectos-personales";

type UiProject = {
  id: string;
  category: UiCategory;
  title: LocalizedString;
  meta: LocalizedString;
  images: readonly string[];
  prototypeUrl: string | null;
};

type IconType = ComponentType<LucideProps>;

const CATEGORY_META: {
  id: UiCategory;
  icon: IconType;
}[] = [
  { id: "sistemas-a-medida", icon: LayoutDashboard },
  { id: "preventas", icon: Presentation },
  { id: "proyectos-personales", icon: Lightbulb },
];

const AUTO_MS = 2000;
const slideEase = [0.32, 0.72, 0, 1] as const;

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
  images,
  alt,
  dict,
}: {
  images: readonly string[];
  alt: string;
  dict: Dictionary;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovering, setHovering] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const total = images.length;

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
    }, AUTO_MS);
    return () => window.clearTimeout(id);
    // progressKey reinicia el timer al entrar hover / cambiar slide
  }, [hovering, index, total, reduceMotion, progressKey]);

  if (total === 0) {
    return (
      <div className="relative flex aspect-[644/362] w-full items-center justify-center overflow-hidden bg-sky-pale">
        <span className="text-sm text-ink/50 md:text-base">—</span>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[644/362] w-full overflow-hidden bg-sky-pale"
      onMouseEnter={() => {
        setHovering(true);
        setProgressKey((k) => k + 1);
      }}
      onMouseLeave={() => setHovering(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={images[index]}
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
            src={images[index]}
            alt={`${alt} (${index + 1}/${total})`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </AnimatePresence>

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
            {images.map((_, i) => {
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
                        animation: `carousel-progress ${AUTO_MS}ms linear forwards`,
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

export function InterfacesLayer({ locale, dict }: Props) {
  const projects = content.uiProjects as readonly UiProject[];
  const [sorts, setSorts] = useState<Record<UiCategory, SortMode>>({
    "sistemas-a-medida": "year",
    preventas: "year",
    "proyectos-personales": "year",
  });

  const categoryLabel = (cat: UiCategory) => {
    if (cat === "preventas") return dict.interfaces.catPreventas;
    if (cat === "sistemas-a-medida") return dict.interfaces.catSistemas;
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

  return (
    <main className="flex w-full flex-col items-center overflow-x-clip">
      <div className="flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-8 sm:gap-8 sm:px-6 md:px-8">
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
                    className="inline-flex items-center gap-1.5 underline-offset-4 transition-opacity hover:underline hover:opacity-70"
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
            <section key={cat} className="flex w-full flex-col gap-6">
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
              <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
                {items.map((project) => {
                  const href = project.prototypeUrl;
                  return (
                    <article key={project.id} className="flex flex-col gap-2.5">
                      <h3 className="text-sm font-bold text-ink sm:text-base">
                        {t(project.title, locale)}
                      </h3>
                      <ProjectCarousel
                        images={project.images}
                        alt={t(project.title, locale)}
                        dict={dict}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink">
                        <span>{t(project.meta, locale)}</span>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2 transition-opacity hover:opacity-70"
                          >
                            {dict.interfaces.prototype}
                          </a>
                        ) : (
                          <span
                            className="underline underline-offset-2 opacity-50"
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

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {content.uiList.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 p-2.5">
              {"logo" in item && item.logo && (
                <div className="relative mb-2 h-14 w-40 sm:h-16 sm:w-52">
                  <Image
                    src={item.logo}
                    alt=""
                    fill
                    className="object-contain object-left"
                  />
                </div>
              )}
              {"wordmark" in item && item.wordmark && (
                <p className="mb-1 text-[clamp(1.5rem,3vw,2.75rem)] font-bold leading-tight text-ink">
                  {item.wordmark}
                </p>
              )}
              {"caption" in item && item.caption && (
                <p className="text-sm text-ink">{item.caption}</p>
              )}
              <p className="text-[clamp(1rem,1.8vw,1.625rem)] text-ink">
                {t(item.title, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
