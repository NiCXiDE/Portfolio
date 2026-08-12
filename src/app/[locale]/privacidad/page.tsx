import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { pathForLayer } from "@/lib/layers";
import { buildPageMetadata, privacyTitle } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  return buildPageMetadata({
    locale,
    title: privacyTitle(locale),
    description: dict.meta.privacyDescription,
    pathAfterLocale: "/privacidad",
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 md:px-8 md:py-12">
      <Breadcrumbs
        ariaLabel={dict.breadcrumbs.aria}
        items={[
          { href: pathForLayer(locale, "inicio"), label: dict.breadcrumbs.home },
          { label: dict.privacy.title },
        ]}
      />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {dict.privacy.title}
        </h1>
        <p className="text-sm text-ink/60">{dict.privacy.updated}</p>
        <p className="text-sm leading-relaxed text-ink/85 md:text-base">
          {dict.privacy.intro}
        </p>
      </header>
      <div className="flex flex-col gap-6">
        {dict.privacy.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-1.5">
            <h2 className="text-base font-bold text-ink md:text-lg">
              {section.heading}
            </h2>
            <p className="text-sm leading-relaxed text-ink/80 md:text-base">
              {section.body}
            </p>
          </section>
        ))}
      </div>
      <p className="pt-2 text-sm">
        <Link
          href={pathForLayer(locale, "inicio")}
          className="underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          ← {dict.nav.backHome}
        </Link>
      </p>
    </main>
  );
}
