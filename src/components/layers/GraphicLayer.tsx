"use client";

import {
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Disc3,
  Megaphone,
  Palette,
  PenTool,
  Printer,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  t,
  type LocalizedString,
  type PortfolioContent,
} from "@/lib/content";
import {
  ExpandableArtGrid,
  type ArtItem,
} from "@/components/ExpandableArtGrid";
import { SortButtons, type SortMode } from "@/components/SortButtons";
import { TagFilter } from "@/components/TagFilter";
import { pathForLayer } from "@/lib/layers";
import { LOGO_SAFE_INSET_PERCENT, logoDetailHref } from "@/lib/graphic-constants";

type Props = {
  locale: Locale;
  dict: Dictionary;
  content: PortfolioContent;
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
  gallery?: { src: string }[];
};

type SectionKey =
  | "covers"
  | "logos"
  | "manuals"
  | "illustration"
  | "eventos"
  | "banners"
  | "personal";

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
  const copy = items.map((item, index) => ({ item, index }));
  if (mode === "year") {
    copy.sort((a, b) => {
      const ya = a.item.year ? Number(a.item.year) : Number.NEGATIVE_INFINITY;
      const yb = b.item.year ? Number(b.item.year) : Number.NEGATIVE_INFINITY;
      if (yb !== ya) return yb - ya;
      return a.index - b.index;
    });
  } else {
    copy.sort((a, b) => {
      const cmp = itemLabel(a.item, locale).localeCompare(
        itemLabel(b.item, locale),
        "en",
      );
      return cmp !== 0 ? cmp : a.index - b.index;
    });
  }
  return copy.map(({ item }) => item);
}

export function GraphicLayer({ locale, dict, content }: Props) {
  const limit = content.settings.graphicPreviewLimit;
  const nsfwSlugs = content.tags.filter((t) => t.isNsfw).map((t) => t.slug);
  const tagLabels = Object.fromEntries(
    content.tags.map((t) => [t.slug, locale === "en" ? t.labelEn : t.labelEs]),
  );

  const [sorts, setSorts] = useState<Record<SectionKey, SortMode>>({
    covers: "year",
    logos: "year",
    manuals: "year",
    illustration: "year",
    eventos: "year",
    banners: "year",
    personal: "year",
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
  const isV2Presentation = content.graphicPresentation === "v2";

  const jumps = (
    [
      !isV2Presentation
        ? { id: "grafico-portadas", label: dict.grafico.covers, icon: Disc3 }
        : null,
      { id: "grafico-logos", label: dict.grafico.logos, icon: PenTool },
      {
        id: "grafico-manuales",
        label: dict.grafico.brandManuals,
        icon: BookOpen,
      },
      {
        id: "grafico-ilustracion",
        label: dict.grafico.illustration,
        icon: Palette,
      },
      { id: "grafico-eventos", label: dict.grafico.eventos, icon: Megaphone },
      { id: "grafico-banners", label: dict.grafico.banners, icon: Printer },
      !isV2Presentation
        ? {
            id: "grafico-personal",
            label: dict.grafico.personal,
            icon: Sparkles,
          }
        : null,
    ] as Array<{ id: string; label: string; icon: IconType } | null>
  ).filter((j): j is { id: string; label: string; icon: IconType } => j != null);

  const seeMoreProps = (section: string, total: number) =>
    total > limit
      ? {
          seeMoreHref: `/${locale}/grafico/${section}`,
          seeMoreLabel: dict.grafico.seeMore,
        }
      : {};

  const coverItems = useMemo(() => {
    const mapped = content.covers.slice(0, limit).map((c) => ({
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
    const mapped = content.logos.slice(0, limit).map((logo) => ({
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
      gallery: logo.gallery?.length
        ? logo.gallery.map((g) => g.src)
        : undefined,
      resourceCount: logo.resourceCount,
      fit: "contain" as const,
      brandHubHref: logo.brandId
        ? `/${locale}/marcas/${logo.brandId}`
        : null,
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.logos ?? null),
      sorts.logos,
      locale,
    );
  }, [sorts.logos, locale, tagFilter.logos, content.logos, limit]);

  const manualItems = useMemo(
    () =>
      sortItems(
        manuals.slice(0, limit).map((m) => ({
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
    const mapped = drawings.slice(0, limit).map((item) => ({
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
      gallery: item.gallery?.length
        ? item.gallery.map((g) => g.src)
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
    const mapped = content.banners.slice(0, limit).map((b) => ({
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
      gallery: b.gallery?.length ? b.gallery.map((g) => g.src) : undefined,
      fit:
        "fit" in b && (b.fit === "contain" || b.fit === "cover")
          ? b.fit
          : ("contain" as const),
      frame: "banner" as const,
      brandHubHref: b.brandId ? `/${locale}/marcas/${b.brandId}` : null,
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
    content.banners,
    limit,
  ]);

  const eventoItems = useMemo(() => {
    const mapped = content.eventos.slice(0, limit).map((e) => ({
      id: e.id,
      src: e.src,
      alt: e.alt,
      title: e.title,
      year: e.year?.trim() ? e.year : undefined,
      detail: e.detail,
      href: e.href,
      tags: readTags(e.tags),
      gallery: e.gallery?.length ? e.gallery.map((g) => g.src) : undefined,
      fit: "cover" as const,
      frame: "square" as const,
      brandHubHref: e.brandId ? `/${locale}/marcas/${e.brandId}` : null,
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.eventos ?? null),
      sorts.eventos,
      locale,
    );
  }, [sorts.eventos, locale, tagFilter.eventos, content.eventos, limit]);

  const personalItems = useMemo(() => {
    const mapped = content.personal.slice(0, limit).map((item) => ({
      id: item.id,
      src: item.src,
      alt: item.alt,
      title: item.title ?? item.alt,
      year: item.year?.trim() ? item.year : undefined,
      detail: hasText(item.detail) ? item.detail : undefined,
      href: item.href,
      hrefLabel: item.hrefLabel,
      tags: readTags("tags" in item ? item.tags : []),
      gallery: item.gallery?.length
        ? item.gallery.map((g) => g.src)
        : undefined,
      fit: (("fit" in item && item.fit === "contain"
        ? "contain"
        : "cover") as ArtItem["fit"]),
    }));
    return sortItems(
      applyTagFilter(mapped, tagFilter.personal ?? null),
      sorts.personal,
      locale,
    );
  }, [sorts.personal, locale, tagFilter.personal, content.personal, limit]);

  const coverTagList = useMemo(
    () =>
      uniqueTags(
        content.covers.map((c) => ({ tags: readTags("tags" in c ? c.tags : []) })),
        locale,
      ),
    [locale, content.covers],
  );
  const logoTagList = useMemo(
    () =>
      uniqueTags(
        content.logos.map((l) => ({
          tags: readTags("tags" in l ? l.tags : []),
        })),
        locale,
      ),
    [locale, content.logos],
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
    [locale, content.banners],
  );
  const eventoTagList = useMemo(
    () =>
      uniqueTags(
        content.eventos.map((e) => ({ tags: readTags(e.tags) })),
        locale,
      ),
    [locale, content.eventos],
  );
  const personalTagList = useMemo(
    () =>
      uniqueTags(
        content.personal.map((p) => ({
          tags: readTags("tags" in p ? p.tags : []),
        })),
        locale,
      ),
    [locale, content.personal],
  );

  const gridExtras = {
    visitLabel: dict.grafico.visitLink,
    closeLabel: dict.common.close,
    enlargeLabel: dict.common.enlarge,
    tagLabels: { ...dict.common.tagLabels, ...tagLabels },
    nsfwLabel: dict.common.nsfwLabel,
    nsfwRevealLabel: dict.common.nsfwReveal,
    nsfwHideLabel: dict.common.nsfwHide,
    nsfwSlugs,
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
      <div className="flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-8 sm:gap-8 sm:px-6 md:px-8 lg:px-10">
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
            <h1 className="text-xl font-normal leading-tight text-ink sm:text-2xl md:text-[1.65rem]">
              {dict.grafico.titlePrefix}
              <span className="font-bold">{dict.grafico.titleBold}</span>
            </h1>
            <p className="text-sm text-ink md:text-base">{dict.grafico.subtitle}</p>
            <Link
              href={pathForLayer(locale, "inicio")}
              className="text-sm underline underline-offset-4 opacity-70 transition-opacity hover:opacity-100"
            >
              {dict.nav.backHome} →
            </Link>
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

        {!isV2Presentation ? (
          <>
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
        <div className="w-full">
          <ExpandableArtGrid
            items={coverItems}
            locale={locale}
            onTagClick={(tag) => setTag("covers", tag)}
            {...gridExtras}
            {...seeMoreProps("covers", content.covers.length)}
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
          </>
        ) : null}

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
          containPadPercent={LOGO_SAFE_INSET_PERCENT}
          onTagClick={(tag) => setTag("logos", tag)}
          detailHref={(item) => logoDetailHref(locale, item)}
          moreAboutLabel={dict.grafico.viewDetails}
          brandHubLabel={dict.grafico.viewBrandWork}
          {...gridExtras}
          {...seeMoreProps("logos", content.logos.length)}
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
            {...seeMoreProps("manuals", manuals.length)}
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
            onTagClick={(tag) => setTag("illustration", tag)}
            {...gridExtras}
            {...seeMoreProps("illustration", drawings.length)}
          />
        )}

        <SectionTitle
          id="grafico-eventos"
          icon={Megaphone}
          hint={dict.grafico.hintEventos}
          actions={sortActions("eventos")}
        >
          {dict.grafico.eventos}
        </SectionTitle>
        <TagFilter
          tags={eventoTagList}
          active={tagFilter.eventos ?? null}
          onChange={(tag) => setTag("eventos", tag)}
          labels={dict.common.tagLabels}
          clearLabel={dict.common.clearFilter}
        />
        {eventoItems.length === 0 ? (
          <p className="text-sm text-ink/70 md:text-base">
            {dict.grafico.emptyEventos}
          </p>
        ) : (
          <ExpandableArtGrid
            items={eventoItems}
            locale={locale}
            cellClassName="bg-sky-pale"
            containPadPercent={0}
            onTagClick={(tag) => setTag("eventos", tag)}
            detailHref={(item) => `/${locale}/grafico/eventos/${item.id}`}
            moreAboutLabel={dict.grafico.viewDetails}
            brandHubLabel={dict.grafico.viewBrandWork}
            {...gridExtras}
            {...seeMoreProps("eventos", content.eventos.length)}
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
            brandHubLabel={dict.grafico.viewBrandWork}
            {...gridExtras}
            {...seeMoreProps("banners", content.banners.length)}
          />
        )}

        {!isV2Presentation ? (
          <>
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
        <div className="w-full">
          <ExpandableArtGrid
            items={personalItems}
            locale={locale}
            onTagClick={(tag) => setTag("personal", tag)}
            {...gridExtras}
            {...seeMoreProps("personal", content.personal.length)}
          />
        </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
