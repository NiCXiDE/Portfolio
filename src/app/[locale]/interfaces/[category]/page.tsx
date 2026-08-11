import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { loadPortfolioContent } from "@/lib/content";
import { pathForLayer } from "@/lib/layers";
import { InterfacesCategoryGrid } from "@/components/InterfacesCategoryGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  buildPageMetadata,
  interfacesCategoryTitle,
} from "@/lib/seo";

const CATS = [
  "preventas",
  "sistemas-a-medida",
  "proyectos-personales",
  "system-design",
] as const;

function categoryTitle(
  category: (typeof CATS)[number],
  dict: ReturnType<typeof getDictionary>,
) {
  if (category === "preventas") return dict.interfaces.catPreventas;
  if (category === "sistemas-a-medida") return dict.interfaces.catSistemas;
  if (category === "system-design") return dict.interfaces.catSystemDesign;
  return dict.interfaces.catPersonales;
}

export function generateStaticParams() {
  return CATS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale: raw, category } = await params;
  if (!isLocale(raw)) return {};
  if (!CATS.includes(category as (typeof CATS)[number])) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const title = categoryTitle(category as (typeof CATS)[number], dict);
  return buildPageMetadata({
    locale,
    title: interfacesCategoryTitle(locale, title),
    description: dict.meta.interfacesDescription,
    pathAfterLocale: `/interfaces/${category}`,
  });
}

export default async function InterfacesCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale: raw, category } = await params;
  if (!isLocale(raw)) notFound();
  if (!CATS.includes(category as (typeof CATS)[number])) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const content = await loadPortfolioContent();
  const projects = content.uiProjects.filter((p) => p.category === category);
  const title = categoryTitle(category as (typeof CATS)[number], dict);

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
              href: pathForLayer(locale, "interfaces"),
              label: dict.interfaces.titleBold,
            },
            { label: title },
          ]}
        />
        <h1 className="mt-3 font-bigger text-3xl uppercase tracking-wide md:text-4xl">
          {title}
        </h1>
        <Link
          href={pathForLayer(locale, "interfaces")}
          className="mt-2 inline-block text-sm underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          ← {dict.interfaces.titleBold}
        </Link>
      </div>
      <InterfacesCategoryGrid
        locale={locale}
        dict={dict}
        projects={projects}
        brands={content.brands}
      />
    </main>
  );
}
