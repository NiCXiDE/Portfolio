import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { t } from "@/lib/content";
import { loadGraphicDetailItemForLocale } from "@/lib/content-v2/graphic-runtime";
import { getGraphicContentSource } from "@/lib/content-v2/graphic-source";
import { buildPageMetadata, graphicLogoTitle } from "@/lib/seo";
import { pathForLayer } from "@/lib/layers";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LogoResourceGallery } from "@/components/LogoResourceGallery";
import { LogoDetailHero } from "@/components/LogoDetailHero";
import { BrandRelatedSection } from "@/components/BrandRelatedSection";
import { relatedByBrand } from "@/lib/content";

function logoDetailIdsFromJson(): string[] {
  const raw = JSON.parse(
    readFileSync(join(process.cwd(), "content/grafico/logos.json"), "utf8"),
  ) as Array<{ id: string; gallery?: string[] }>;
  return raw.filter((e) => (e.gallery?.length ?? 0) > 0).map((e) => e.id);
}

/** Keep legacy static params for default=legacy builds. V2 uses dynamic resolution. */
export function generateStaticParams() {
  return logoDetailIdsFromJson().map((id) => ({ id }));
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
    section: "logos",
    id,
  });
  if (!resolved) return {};
  const dict = getDictionary(locale);
  const title = resolved.item.title
    ? t(resolved.item.title, locale)
    : resolved.item.alt;
  return buildPageMetadata({
    locale,
    title: graphicLogoTitle(locale, title),
    description: resolved.item.detail
      ? t(resolved.item.detail, locale)
      : dict.meta.graphicDescription,
    pathAfterLocale: `/grafico/logos/${id}`,
  });
}

export default async function GraphicLogoDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const resolved = await loadGraphicDetailItemForLocale(locale, {
    section: "logos",
    id,
  });
  // Legacy required gallery; V2 Seyier split means logo detail only when resources exist.
  if (!resolved || resolved.gallery.length === 0) notFound();

  const logo = resolved.item;
  const title = logo.title ? t(logo.title, locale) : logo.alt;
  const detail = logo.detail ? t(logo.detail, locale) : "";
  const tags = logo.tags ?? [];

  // relatedByBrand reads legacy tables — only when Graphic source is legacy.
  const related =
    getGraphicContentSource() === "legacy" && logo.brandId
      ? await relatedByBrand(logo.brandId, { excludeGraphicId: logo.id })
      : null;

  const resourceItems = resolved.gallery.map((g, index) => {
    const fromLabel =
      g.label && typeof g.label === "object"
        ? locale === "en"
          ? g.label.en
          : g.label.es
        : undefined;
    return {
      src: g.src,
      alt: `${title} — ${fromLabel ?? index + 1}`,
      label: fromLabel,
      frame: g.frame,
    };
  });

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
              href: `/${locale}/grafico/logos`,
              label: dict.grafico.logos,
            },
            { label: title },
          ]}
        />
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link
            href={`/${locale}/grafico/logos`}
            className="underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            ← {dict.grafico.backToLogos}
          </Link>
          <Link
            href={pathForLayer(locale, "grafico")}
            className="underline underline-offset-4 opacity-70 hover:opacity-100"
          >
            ← {dict.nav.backToGraphic}
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_1fr] lg:items-start">
        <LogoDetailHero src={logo.src} alt={logo.alt} tags={tags} />

        <div className="flex min-w-0 flex-col gap-6">
          {detail ? (
            <p className="max-w-3xl text-sm leading-relaxed text-ink/85 md:text-base">
              {detail}
            </p>
          ) : null}

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink md:text-xl">
              {dict.grafico.logoResources}
            </h2>
            {resourceItems.length > 0 ? (
              <LogoResourceGallery
                items={resourceItems}
                enlargeLabel={dict.common.enlarge}
                closeLabel={dict.common.close}
              />
            ) : (
              <p className="text-sm text-ink/70 md:text-base">
                {dict.grafico.emptyLogoResources}
              </p>
            )}
          </section>

          {related ? (
            <BrandRelatedSection
              locale={locale}
              heading={dict.grafico.alsoInProject}
              related={related}
              viewUiLabel={dict.grafico.viewUiProject}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
