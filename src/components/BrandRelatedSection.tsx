import Link from "next/link";
import type { Locale } from "@/i18n/config";
import {
  hrefForBrandGraphic,
  hrefForBrandUi,
  t,
  titleForBrandGraphic,
  type BrandRelated,
} from "@/lib/content";

export function BrandRelatedSection({
  locale,
  heading,
  related,
  viewUiLabel,
  viewManualLabel = "Manual",
}: {
  locale: Locale;
  heading: string;
  related: BrandRelated;
  viewUiLabel: string;
  viewManualLabel?: string;
}) {
  const links: { href: string; label: string; key: string }[] = [
    ...related.graphics.map((g) => ({
      key: `g-${g.section}-${g.id}`,
      href: hrefForBrandGraphic(locale, g),
      label: titleForBrandGraphic(g, locale),
    })),
    ...related.manuals.map((m) => ({
      key: `m-${m.id}`,
      href: m.pdf,
      label: `${viewManualLabel}: ${t(m.title, locale)}`,
    })),
    ...related.uiProjects.map((p) => ({
      key: `ui-${p.id}`,
      href: hrefForBrandUi(locale),
      label: `${viewUiLabel}: ${t(p.title, locale)}`,
    })),
  ];

  if (links.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 border-t border-ink/10 pt-6">
      <h2 className="text-lg font-bold text-ink md:text-xl">{heading}</h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.key}>
            <Link
              href={link.href}
              {...(link.href.startsWith("http") || link.href.endsWith(".pdf")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              className="text-sm underline underline-offset-4 opacity-80 transition-[color,filter] hover:opacity-100 md:text-base cursor-nav interactive-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
