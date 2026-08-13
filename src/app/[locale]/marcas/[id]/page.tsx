import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import {
  brandRelatedCount,
  hrefForBrandGraphic,
  loadBrandById,
  relatedByBrand,
  t,
  titleForBrandGraphic,
} from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";
import { pathForLayer } from "@/lib/layers";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export function generateStaticParams() {
  return [{ id: "citf" }, { id: "apsmm" }, { id: "seyier" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const brand = await loadBrandById(id);
  if (!brand) return {};
  return buildPageMetadata({
    locale,
    title: brand.name,
    description:
      locale === "en"
        ? `Work with ${brand.name} — graphic and interface projects.`
        : `Trabajo con ${brand.name}: piezas gráficas e interfaces.`,
    pathAfterLocale: `/marcas/${id}`,
  });
}

export default async function BrandHubPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const brand = await loadBrandById(id);
  if (!brand) notFound();

  const related = await relatedByBrand(id);
  if (brandRelatedCount(related) === 0) notFound();

  const sectionLabel = (section: string) => {
    if (section === "logos") return dict.grafico.logos;
    if (section === "banners") return dict.grafico.banners;
    if (section === "eventos") return dict.grafico.eventos;
    if (section === "covers") return dict.grafico.covers;
    if (section === "illustration") return dict.grafico.illustration;
    if (section === "personal") return dict.grafico.personal;
    return section;
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 md:px-8 lg:px-10">
      <div>
        <Breadcrumbs
          ariaLabel={dict.breadcrumbs.aria}
          items={[
            {
              href: pathForLayer(locale, "inicio"),
              label: dict.breadcrumbs.home,
            },
            { label: brand.name },
          ]}
        />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {brand.logo ? (
            <div className="relative size-16 shrink-0 sm:size-20">
              <Image
                src={brand.logo}
                alt=""
                fill
                className="object-contain object-left"
                unoptimized={brand.logo.startsWith("/assets")}
              />
            </div>
          ) : null}
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {brand.name}
            </h1>
            <p className="mt-1 text-sm text-ink/70 md:text-base">
              {dict.grafico.brandHubIntro}
            </p>
          </div>
        </div>
        <Link
          href={pathForLayer(locale, "inicio")}
          className="mt-3 inline-block text-sm underline underline-offset-4 opacity-70 hover:opacity-100 cursor-nav"
        >
          ← {dict.nav.backHome}
        </Link>
      </div>

      {related.graphics.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-ink md:text-xl">
            {dict.grafico.brandHubGraphics}
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {related.graphics.map((g) => (
              <li key={`${g.section}-${g.id}`}>
                <Link
                  href={hrefForBrandGraphic(locale, g)}
                  className="group flex flex-col gap-2 cursor-nav"
                >
                  <div className="relative aspect-square overflow-hidden bg-sky-pale surface-glow">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      fill
                      className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      unoptimized={g.src.startsWith("/assets")}
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink/50">
                      {sectionLabel(g.section)}
                    </p>
                    <p className="text-sm font-medium text-ink md:text-base">
                      {titleForBrandGraphic(g, locale)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.manuals.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-ink md:text-xl">
            {dict.grafico.brandManuals}
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {related.manuals.map((m) => (
              <li key={m.id}>
                <a
                  href={m.pdf}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-2 cursor-nav"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-sky-pale">
                    <Image
                      src={m.cover}
                      alt=""
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      unoptimized={m.cover.startsWith("/assets")}
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                  <p className="text-sm font-medium text-ink md:text-base">
                    {t(m.title, locale)}
                  </p>
                  <p className="text-sm underline underline-offset-4 opacity-70">
                    {dict.grafico.downloadManual}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.uiProjects.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-ink md:text-xl">
            {dict.interfaces.titleBold}
          </h2>
          <ul className="flex flex-col gap-2">
            {related.uiProjects.map((p) => (
              <li key={p.id}>
                <Link
                  href={pathForLayer(locale, "interfaces")}
                  className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100 md:text-base cursor-nav"
                >
                  {t(p.title, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
