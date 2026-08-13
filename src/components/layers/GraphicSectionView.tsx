"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  t,
  type GraphicItemContent,
  type PortfolioContent,
} from "@/lib/content";
import {
  ExpandableArtGrid,
  type ArtItem,
} from "@/components/ExpandableArtGrid";
import { SortButtons, type SortMode } from "@/components/SortButtons";
import { TagFilter } from "@/components/TagFilter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LOGO_SAFE_INSET_PERCENT, logoDetailHref } from "@/lib/graphic-constants";
import { pathForLayer } from "@/lib/layers";

const SECTION_LABEL: Record<
  string,
  keyof Dictionary["grafico"]
> = {
  covers: "covers",
  logos: "logos",
  personal: "personal",
  illustration: "illustration",
  banners: "banners",
  eventos: "eventos",
  manuals: "brandManuals",
};

type Props = {
  locale: Locale;
  dict: Dictionary;
  content: PortfolioContent;
  section: keyof typeof SECTION_LABEL;
};

function readTags(tags: unknown): string[] {
  return Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : [];
}

export function GraphicSectionView({
  locale,
  dict,
  content,
  section,
}: Props) {
  const [sort, setSort] = useState<SortMode>("year");
  const [tag, setTag] = useState<string | null>(null);
  const labelKey = SECTION_LABEL[section];
  const title = dict.grafico[labelKey] as string;

  const nsfwSlugs = content.tags.filter((x) => x.isNsfw).map((x) => x.slug);
  const tagLabels = {
    ...dict.common.tagLabels,
    ...Object.fromEntries(
      content.tags.map((x) => [
        x.slug,
        locale === "en" ? x.labelEn : x.labelEs,
      ]),
    ),
  };

  const sourceItems: GraphicItemContent[] =
    section === "manuals"
      ? []
      : (content[section as keyof PortfolioContent] as GraphicItemContent[]);

  const items = useMemo(() => {
    if (section === "manuals") {
      return content.brandManuals.map((m) => ({
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
        fit: "contain" as const,
      }));
    }

    const mapped: ArtItem[] = sourceItems.map((c) => ({
      id: c.id,
      src: c.src,
      alt: c.alt,
      title: c.title ?? c.alt,
      year: c.year,
      detail: c.detail ?? c.usage,
      href: c.href,
      hrefLabel: c.hrefLabel,
      tags: readTags(c.tags),
      fit: c.fit ?? "cover",
      relatedSrc: c.relatedSrc,
      gallery: c.gallery?.length ? c.gallery.map((g) => g.src) : undefined,
    }));

    let list = mapped.map((item, index) => ({ item, index }));
    if (tag) list = list.filter(({ item }) => item.tags?.includes(tag));
    list.sort((a, b) => {
      if (sort === "year") {
        const ya =
          Number(a.item.year) ||
          Number(
            String(typeof a.item.title === "string" ? a.item.title : "").match(
              /\b(20\d{2}|19\d{2})\b/,
            )?.[1],
          ) ||
          0;
        const yb =
          Number(b.item.year) ||
          Number(
            String(typeof b.item.title === "string" ? b.item.title : "").match(
              /\b(20\d{2}|19\d{2})\b/,
            )?.[1],
          ) ||
          0;
        if (yb !== ya) return yb - ya;
        return a.index - b.index;
      }
      const ta =
        typeof a.item.title === "string"
          ? a.item.title
          : t(a.item.title!, locale);
      const tb =
        typeof b.item.title === "string"
          ? b.item.title
          : t(b.item.title!, locale);
      const cmp = ta.localeCompare(tb, "en");
      return cmp !== 0 ? cmp : a.index - b.index;
    });
    return list.map(({ item }) => item);
  }, [section, sourceItems, content.brandManuals, locale, dict, sort, tag]);

  const tagList = useMemo(() => {
    const set = new Set<string>();
    sourceItems.forEach((i) => readTags(i.tags).forEach((x) => set.add(x)));
    return Array.from(set).sort();
  }, [sourceItems]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:px-8 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumbs
            ariaLabel={dict.breadcrumbs.aria}
            items={[
              {
                href: pathForLayer(locale, "inicio"),
                label: dict.breadcrumbs.home,
              },
              {
                href: pathForLayer(locale, "grafico"),
                label: dict.grafico.title,
              },
              { label: title },
            ]}
          />
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          <Link
            href={pathForLayer(locale, "grafico")}
            className="mt-2 inline-block text-sm underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            ← {dict.nav.backToGraphic}
          </Link>
        </div>
        <SortButtons
          mode={sort}
          onChange={setSort}
          yearLabel={dict.common.sortByYear}
          alphaLabel={dict.common.sortByName}
        />
      </div>
      {tagList.length > 0 ? (
        <TagFilter
          tags={tagList}
          active={tag}
          onChange={setTag}
          labels={tagLabels}
          clearLabel={dict.common.clearFilter}
        />
      ) : null}
      <ExpandableArtGrid
        items={
          section === "eventos"
            ? items.map((item) => ({
                ...item,
                fit: "cover" as const,
                frame: "square" as const,
              }))
            : section === "logos"
              ? items.map((item) => ({
                  ...item,
                  fit: "contain" as const,
                }))
              : items
        }
        locale={locale}
        cellClassName="bg-sky-pale"
        visitLabel={dict.grafico.visitLink}
        closeLabel={dict.common.close}
        enlargeLabel={dict.common.enlarge}
        tagLabels={tagLabels}
        nsfwLabel={dict.common.nsfwLabel}
        nsfwRevealLabel={dict.common.nsfwReveal}
        nsfwHideLabel={dict.common.nsfwHide}
        nsfwSlugs={nsfwSlugs}
        onTagClick={setTag}
        containPadPercent={
          section === "logos" ? LOGO_SAFE_INSET_PERCENT : undefined
        }
        detailHref={
          section === "eventos"
            ? (item) => `/${locale}/grafico/eventos/${item.id}`
            : section === "logos"
              ? (item) => logoDetailHref(locale, item)
              : undefined
        }
        moreAboutLabel={
          section === "eventos" || section === "logos"
            ? dict.grafico.moreAbout
            : undefined
        }
      />
    </main>
  );
}
