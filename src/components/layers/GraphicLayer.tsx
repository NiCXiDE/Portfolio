"use client";

import {
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  BookOpen,
  Disc3,
  Inbox,
  Palette,
  PenTool,
  Printer,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { content, t, type LocalizedString } from "@/lib/content";
import {
  ExpandableArtGrid,
  type ArtItem,
} from "@/components/ExpandableArtGrid";
import { SortButtons, type SortMode } from "@/components/SortButtons";
import { TagFilter } from "@/components/TagFilter";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

type BrandManual = {
  id: string;
  cover: string;
  pdf: string;
  title: LocalizedString;
  year?: string;
  meta?: LocalizedString;
};

type IllustrationItem = {
  id: string;
  src: string;
  alt: string;
  title?: LocalizedString;
  year?: string;
  detail?: LocalizedString;
  href?: string | null;
  hrefLabel?: LocalizedString;
  tags?: string[];
  relatedSrc?: string | null;
  /** contain = recorte sin fondo (celeste + margen); cover = llena el canvas */
  fit?: "cover" | "contain";
};

type SectionKey =
  | "covers"
  | "logos"
  | "manuals"
  | "illustration"
  | "banners"
  | "personal"
  | "pending";

type IconType = ComponentType<LucideProps>;

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

function SectionTitle({
  id,
  icon: Icon,
  children,
  hint,
  actions,
}: {
  id: string;
  icon?: IconType;
  children: ReactNode;
  hint?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <h2
          id={id}
          className="scroll-mt-24 inline-flex items-center gap-2 text-xl font-bold text-ink md:text-2xl"
        >
          {Icon && (
            <Icon className="size-5 shrink-0 md:size-6" strokeWidth={1.75} />
          )}
          {children}
        </h2>
        {actions}
      </div>
      {hint && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink/65 md:text-base">
          {hint}
        </p>
      )}
    </div>
  );
}

function readTags(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function uniqueTags(items: { tags?: string[] }[], locale: Locale): string[] {
  const set = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags ?? []) set.add(tag);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, locale));
}

function applyTagFilter(items: ArtItem[], tag: string | null): ArtItem[] {
  if (!tag) return items;
  return items.filter((item) => item.tags?.includes(tag));
}

function hasText(value: LocalizedString | string | undefined): boolean {
  if (!value) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value.es?.trim() || value.en?.trim());
}

function itemLabel(item: ArtItem, locale: Locale): string {
  if (typeof item.title === "string") return item.title;
  if (item.title) return item.title[locale] || item.title.es;
  return item.alt;
}

function sortItems(
  items: ArtItem[],
  mode: SortMode,
  locale: Locale,
): ArtItem[] {
  const copy = [...items];
  if (mode === "year") {
    copy.sort((a, b) => {
      const ya = a.year ? Number(a.year) : Number.NEGATIVE_INFINITY;
      const yb = b.year ? Number(b.year) : Number.NEGATIVE_INFINITY;
      if (yb !== ya) return yb - ya;
      return itemLabel(a, locale).localeCompare(itemLabel(b, locale), locale);
    });
  } else {
    copy.sort((a, b) =>
      itemLabel(a, locale).localeCompare(itemLabel(b, locale), locale),
    );
  }
  return copy;
}

export function GraphicLayer({ locale, dict }: Props) {
  const [sorts, setSorts] = useState<Record<SectionKey, SortMode>>({
    covers: "year",
    logos: "year",
    manuals: "year",
    illustration: "year",
    banners: "year",
    personal: "year",
    pending: "alpha",
  });
  const [tagFilter, setTagFilter] = useState<
    Partial<Record<SectionKey, string | null>>
  >({});

  const setSort = (key: SectionKey, mode: SortMode) =>
    setSorts((prev) => ({ ...prev, [key]: mode }));

  const setTag = (key: SectionKey, tag: string | null) =>
    setTagFilter((prev) => ({ ...prev, [key]: tag }));

  const manuals = content.brandManuals as readonly BrandManual[];
  const drawings = content.illustration as readonly IllustrationItem[];

  const jumps: { id: string; label: string; icon: IconType }[] = [
    { id: "grafico-portadas", label: dict.grafico.covers, icon: Disc3 },
    { id: "grafico-logos", label: dict.grafico.logos, icon: PenTool },
    { id: "grafico-manuales", label: dict.grafico.brandManuals, icon: BookOpen },
    {
      id: "grafico-ilustracion",
      label: dict.grafico.illustration,
      icon: Palette,
    },
    { id: "grafico-banners", label: dict.grafico.banners, icon: Printer },
    { id: "grafico-personal", label: dict.grafico.personal, icon: Sparkles },
    { id: "grafico-pending", label: dict.grafico.pending, icon: Inbox },
  ];

  const coverItems = useMemo(() => {
    const mapped = content.covers.map((c) => ({
      id: c.id,
      src: c.src,
      alt: c.alt,
      title: c.alt,
      detail: c.usage,
      href: c.href,
      hrefLabel:
        "hrefLabel" in c && c.hrefLabel
          ? c.hrefLabel
          : {
              es: dict.grafico.visitLink,
              en: dict.grafico.visitLink,
            },
      tags: readTags("tags" in c ? c.tags : []),
      fit: "cover" as const,
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.covers ?? null),
      sorts.covers,
      locale,
    );
  }, [sorts.covers, locale, dict.grafico.visitLink, tagFilter.covers]);

  const logoItems = useMemo(() => {
    const mapped = content.logos.map((logo) => ({
      id: logo.id,
      src: logo.src,
      alt: logo.alt,
      title: logo.title,
      year: logo.year?.trim() ? logo.year : undefined,
      detail: hasText(logo.detail) ? logo.detail : undefined,
      href: logo.href,
      hrefLabel: logo.hrefLabel,
      overlaySrc:
        "overlay" in logo && typeof logo.overlay === "string"
          ? logo.overlay
          : undefined,
      tags: readTags("tags" in logo ? logo.tags : []),
      fit: "contain" as const,
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.logos ?? null),
      sorts.logos,
      locale,
    );
  }, [sorts.logos, locale, tagFilter.logos]);

  const manualItems = useMemo(
    () =>
      sortItems(
        manuals.map((m) => ({
          id: m.id,
          src: m.cover,
          alt: t(m.title, locale),
          title: m.title,
          year: m.year,
          detail: m.meta,
          downloadHref: m.pdf,
          downloadLabel: dict.grafico.downloadManual,
          previewKind: "pdf" as const,
          previewSrc: m.pdf,
          enlargeLabel: dict.grafico.viewManual,
          fit: "cover" as const,
          frame: "portrait" as const,
        })),
        sorts.manuals,
        locale,
      ),
    [
      manuals,
      sorts.manuals,
      locale,
      dict.grafico.downloadManual,
      dict.grafico.viewManual,
    ],
  );

  const illustrationItems = useMemo(() => {
    const mapped = drawings.map((item) => ({
      id: item.id,
      src: item.src,
      alt: item.alt,
      title: item.title ?? item.alt,
      year: item.year,
      detail: item.detail,
      href: item.href,
      hrefLabel: item.hrefLabel,
      tags: readTags(item.tags),
      relatedSrc: item.relatedSrc ?? undefined,
      relatedLabel: item.relatedSrc
        ? dict.grafico.relatedTattoo
        : undefined,
      fit:
        "fit" in item && (item.fit === "contain" || item.fit === "cover")
          ? item.fit
          : ("cover" as const),
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.illustration ?? null),
      sorts.illustration,
      locale,
    );
  }, [
    drawings,
    sorts.illustration,
    locale,
    tagFilter.illustration,
    dict.grafico.relatedTattoo,
  ]);

  const bannerItems = useMemo(() => {
    const mapped = content.banners.map((b) => ({
      id: b.id,
      src: b.src,
      alt: b.alt,
      title: b.title,
      year: b.year?.trim() ? b.year : undefined,
      detail: b.detail,
      href: b.href,
      tags: readTags(b.tags),
      relatedSrc: b.relatedSrc ?? undefined,
      relatedLabel: b.relatedSrc ? dict.grafico.relatedPrint : undefined,
      fit: "contain" as const,
      frame: "banner" as const,
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.banners ?? null),
      sorts.banners,
      locale,
    );
  }, [
    sorts.banners,
    locale,
    tagFilter.banners,
    dict.grafico.relatedPrint,
  ]);

  const personalItems = useMemo(() => {
    const mapped = content.personal.map((item) => ({
      id: item.id,
      src: item.src,
      alt: item.alt,
      title: item.title ?? item.alt,
      year: item.year?.trim() ? item.year : undefined,
      detail: hasText(item.detail) ? item.detail : undefined,
      href: item.href,
      hrefLabel: item.hrefLabel,
      tags: readTags("tags" in item ? item.tags : []),
      fit: (("fit" in item && item.fit === "contain"
        ? "contain"
        : "cover") as ArtItem["fit"]),
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.personal ?? null),
      sorts.personal,
      locale,
    );
  }, [sorts.personal, locale, tagFilter.personal]);

  const pendingItems = useMemo(() => {
    const mapped = content.pending.map((c) => ({
      id: c.id,
      src: c.src,
      alt: c.alt,
      title: c.alt,
      detail: c.usage,
      href: c.href,
      tags: readTags("tags" in c ? c.tags : []),
      fit: "cover" as const,
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.pending ?? null),
      sorts.pending,
      locale,
    );
  }, [sorts.pending, locale, tagFilter.pending]);

  const coverTagList = useMemo(
    () =>
      uniqueTags(
        content.covers.map((c) => ({ tags: readTags("tags" in c ? c.tags : []) })),
        locale,
      ),
    [locale],
  );
  const logoTagList = useMemo(
    () =>
      uniqueTags(
        content.logos.map((l) => ({
          tags: readTags("tags" in l ? l.tags : []),
        })),
        locale,
      ),
    [locale],
  );
  const illustrationTagList = useMemo(
    () => uniqueTags(drawings.map((d) => ({ tags: readTags(d.tags) })), locale),
    [drawings, locale],
  );
  const bannerTagList = useMemo(
    () =>
      uniqueTags(
        content.banners.map((b) => ({ tags: readTags(b.tags) })),
        locale,
      ),
    [locale],
  );
  const personalTagList = useMemo(
    () =>
      uniqueTags(
        content.personal.map((p) => ({
          tags: readTags("tags" in p ? p.tags : []),
        })),
        locale,
      ),
    [locale],
  );
  const pendingTagList = useMemo(
    () =>
      uniqueTags(
        content.pending.map((c) => ({
          tags: readTags("tags" in c ? c.tags : []),
        })),
        locale,
      ),
    [locale],
  );

  const gridExtras = {
    visitLabel: dict.grafico.visitLink,
    closeLabel: dict.common.close,
    enlargeLabel: dict.common.enlarge,
    tagLabels: dict.common.tagLabels,
    nsfwLabel: dict.common.nsfwLabel,
    nsfwRevealLabel: dict.common.nsfwReveal,
    nsfwHideLabel: dict.common.nsfwHide,
  };

  const sortActions = (key: SectionKey) => (
    <SortButtons
      mode={sorts[key]}
      onChange={(mode) => setSort(key, mode)}
      yearLabel={dict.common.sortByYear}
      alphaLabel={dict.common.sortByName}
    />
  );

  return (
    <main className="flex w-full flex-col items-center overflow-x-clip">
      <div className="flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-8 sm:gap-8 sm:px-6 md:px-8">
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
            <Image
              src="/assets/grafico/brand/group-1.svg"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="relative h-5 w-[min(100%,14rem)] sm:h-6 sm:w-[min(100%,16rem)]">
              <Image
                src="/assets/grafico/brand/frame-12.svg"
                alt={dict.grafico.title}
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <p className="text-sm text-ink md:text-base">{dict.grafico.subtitle}</p>
          </div>
        </div>

        <nav
          aria-label={dict.grafico.title}
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

        <p className="text-sm text-ink/60 md:text-base">{dict.grafico.expandHint}</p>

        <SectionTitle
          id="grafico-portadas"
          icon={Disc3}
          hint={dict.grafico.hintCovers}
          actions={sortActions("covers")}
        >
          {dict.grafico.covers}
        </SectionTitle>
        <TagFilter
          tags={coverTagList}
          active={tagFilter.covers ?? null}
          onChange={(tag) => setTag("covers", tag)}
          labels={dict.common.tagLabels}
          clearLabel={dict.common.clearFilter}
        />
        <div className="w-full drop-shadow-[0_0_5px_rgba(64,65,121,0.25)]">
          <ExpandableArtGrid
            items={coverItems}
            locale={locale}
            onTagClick={(tag) => setTag("covers", tag)}
            {...gridExtras}
          />
        </div>

        <div className="relative h-8 w-full sm:h-12">
          <Image
            src="/assets/grafico/brand/vector-5-stroke.svg"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <SectionTitle
          id="grafico-logos"
          icon={PenTool}
          hint={dict.grafico.hintLogos}
          actions={sortActions("logos")}
        >
          {dict.grafico.logos}
        </SectionTitle>
        <TagFilter
          tags={logoTagList}
          active={tagFilter.logos ?? null}
          onChange={(tag) => setTag("logos", tag)}
          labels={dict.common.tagLabels}
          clearLabel={dict.common.clearFilter}
        />
        <ExpandableArtGrid
          items={logoItems}
          locale={locale}
          cellClassName="bg-sky-pale"
          containPadPercent={6}
          onTagClick={(tag) => setTag("logos", tag)}
          {...gridExtras}
        />

        <div className="relative h-8 w-full sm:h-12">
          <Image
            src="/assets/grafico/brand/vector-6-stroke.svg"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <SectionTitle
          id="grafico-manuales"
          icon={BookOpen}
          hint={dict.grafico.hintManuals}
          actions={sortActions("manuals")}
        >
          {dict.grafico.brandManuals}
        </SectionTitle>
        {manualItems.length === 0 ? (
          <p className="text-sm text-ink/70 md:text-base">
            {dict.grafico.emptyManuals}
          </p>
        ) : (
          <ExpandableArtGrid
            items={manualItems}
            locale={locale}
            cellClassName="bg-sky-pale"
            {...gridExtras}
          />
        )}

        <SectionTitle
          id="grafico-ilustracion"
          icon={Palette}
          hint={dict.grafico.hintIllustration}
          actions={sortActions("illustration")}
        >
          {dict.grafico.illustration}
        </SectionTitle>
        <TagFilter
          tags={illustrationTagList}
          active={tagFilter.illustration ?? null}
          onChange={(tag) => setTag("illustration", tag)}
          labels={dict.common.tagLabels}
          clearLabel={dict.common.clearFilter}
        />
        {illustrationItems.length === 0 ? (
          <p className="text-sm text-ink/70 md:text-base">
            {dict.grafico.emptyIllustration}
          </p>
        ) : (
          <ExpandableArtGrid
            items={illustrationItems}
            locale={locale}
            cellClassName="bg-sky-pale"
            containPadPercent={6}
            onTagClick={(tag) => setTag("illustration", tag)}
            {...gridExtras}
          />
        )}

        <SectionTitle
          id="grafico-banners"
          icon={Printer}
          hint={dict.grafico.hintBanners}
          actions={sortActions("banners")}
        >
          {dict.grafico.banners}
        </SectionTitle>
        <TagFilter
          tags={bannerTagList}
          active={tagFilter.banners ?? null}
          onChange={(tag) => setTag("banners", tag)}
          labels={dict.common.tagLabels}
          clearLabel={dict.common.clearFilter}
        />
        {bannerItems.length === 0 ? (
          <p className="text-sm text-ink/70 md:text-base">
            {dict.grafico.emptyBanners}
          </p>
        ) : (
          <ExpandableArtGrid
            items={bannerItems}
            locale={locale}
            cellClassName="bg-transparent"
            containPadPercent={0}
            onTagClick={(tag) => setTag("banners", tag)}
            {...gridExtras}
          />
        )}

        <SectionTitle
          id="grafico-personal"
          icon={Sparkles}
          hint={dict.grafico.hintPersonal}
          actions={sortActions("personal")}
        >
          {dict.grafico.personal}
        </SectionTitle>
        <TagFilter
          tags={personalTagList}
          active={tagFilter.personal ?? null}
          onChange={(tag) => setTag("personal", tag)}
          labels={dict.common.tagLabels}
          clearLabel={dict.common.clearFilter}
        />
        <div className="w-full drop-shadow-[0_0_5px_rgba(64,65,121,0.25)]">
          <ExpandableArtGrid
            items={personalItems}
            locale={locale}
            onTagClick={(tag) => setTag("personal", tag)}
            {...gridExtras}
          />
        </div>

        <SectionTitle
          id="grafico-pending"
          icon={Inbox}
          hint={dict.grafico.hintPending}
          actions={sortActions("pending")}
        >
          {dict.grafico.pending}
        </SectionTitle>
        <TagFilter
          tags={pendingTagList}
          active={tagFilter.pending ?? null}
          onChange={(tag) => setTag("pending", tag)}
          labels={dict.common.tagLabels}
          clearLabel={dict.common.clearFilter}
        />
        <ExpandableArtGrid
          items={pendingItems}
          locale={locale}
          cellClassName="bg-sky-pale"
          onTagClick={(tag) => setTag("pending", tag)}
          {...gridExtras}
        />
      </div>
    </main>
  );
}
