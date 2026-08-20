import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { relatedByBrand, t } from "@/lib/content";
import { loadGraphicDetailItemForLocale } from "@/lib/content-v2/graphic-runtime";
import { getGraphicContentSource } from "@/lib/content-v2/graphic-source";
import { buildPageMetadata, graphicEventTitle } from "@/lib/seo";
import { pathForLayer } from "@/lib/layers";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  ExpandableArtGrid,
  type ArtItem,
} from "@/components/ExpandableArtGrid";
import { BrandRelatedSection } from "@/components/BrandRelatedSection";

function eventIdsFromJson(): string[] {
  const raw = JSON.parse(
    readFileSync(join(process.cwd(), "content/grafico/eventos.json"), "utf8"),
  ) as Array<{ id: string }>;
  return raw.map((e) => e.id);
}

/** Keep legacy static params for default=legacy builds. */
export function generateStaticParams() {
  return eventIdsFromJson().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const resolved = await loadGraphicDetailItemForLocale(locale, {
    section: "eventos",
    id,
  });
  if (!resolved) return {};
  const dict = getDictionary(locale);
  const title = resolved.item.title
    ? t(resolved.item.title, locale)
    : resolved.item.alt;
  return buildPageMetadata({
    locale,
    title: graphicEventTitle(locale, title),
    description: resolved.item.detail
      ? t(resolved.item.detail, locale)
      : dict.meta.graphicDescription,
    pathAfterLocale: `/grafico/eventos/${id}`,
  });
}

export default async function GraphicEventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const resolved = await loadGraphicDetailItemForLocale(locale, {
    section: "eventos",
    id,
  });
  if (!resolved) notFound();

  const event = resolved.item;
  const title = event.title ? t(event.title, locale) : event.alt;
  const detail = event.detail ? t(event.detail, locale) : "";
  const related =
    getGraphicContentSource() === "legacy" && event.brandId
      ? await relatedByBrand(event.brandId, { excludeGraphicId: event.id })
      : null;
  const resourceItems: ArtItem[] = resolved.gallery.map((g, index) => ({
    id: `${event.id}-res-${index}`,
    src: g.src,
    alt: `${title} ${index + 1}`,
    title: `${title} ${index + 1}`,
    fit: "contain" as const,
    frame: "square" as const,
  }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
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
            {
              href: `/${locale}/grafico/eventos`,
              label: dict.grafico.eventos,
            },
            { label: title },
          ]}
        />
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        <Link
          href={`/${locale}/grafico/eventos`}
          className="mt-2 inline-block text-sm underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          ← {dict.grafico.backToEvents}
        </Link>
      </div>

      {event.relatedSrc ? (
        <div className="relative aspect-video w-full overflow-hidden bg-sky-pale">
          <Image
            src={event.relatedSrc}
            alt={title}
            fill
            priority
            unoptimized={event.relatedSrc.startsWith("/assets")}
            className="object-contain object-center"
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        </div>
      ) : null}

      {detail ? (
        <p className="max-w-3xl text-sm leading-relaxed text-ink/85 md:text-base">
          {detail}
        </p>
      ) : null}

      {resourceItems.length > 0 ? (
        <ExpandableArtGrid
          items={resourceItems}
          locale={locale}
          cellClassName="bg-sky-pale"
          containPadPercent={4}
          visitLabel={dict.grafico.visitLink}
          closeLabel={dict.common.close}
          enlargeLabel={dict.common.enlarge}
          tagLabels={dict.common.tagLabels}
          nsfwLabel={dict.common.nsfwLabel}
          nsfwRevealLabel={dict.common.nsfwReveal}
          nsfwHideLabel={dict.common.nsfwHide}
        />
      ) : (
        <p className="text-sm text-ink/70 md:text-base">
          {dict.grafico.emptyEventResources}
        </p>
      )}

      {related ? (
        <BrandRelatedSection
          locale={locale}
          heading={dict.grafico.alsoInProject}
          related={related}
          viewUiLabel={dict.grafico.viewUiProject}
        />
      ) : null}
    </main>
  );
}
