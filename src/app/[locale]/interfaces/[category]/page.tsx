import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { loadPortfolioContent, t } from "@/lib/content";
import { pathForLayer } from "@/lib/layers";
import { MentionedText } from "@/components/MentionText";

const CATS = [
  "preventas",
  "sistemas-a-medida",
  "proyectos-personales",
  "system-design",
] as const;

export function generateStaticParams() {
  return CATS.map((category) => ({ category }));
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

  const title =
    category === "preventas"
      ? dict.interfaces.catPreventas
      : category === "sistemas-a-medida"
        ? dict.interfaces.catSistemas
        : category === "system-design"
          ? dict.interfaces.catSystemDesign
          : dict.interfaces.catPersonales;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 md:px-8">
      <div>
        <Link
          href={pathForLayer(locale, "interfaces")}
          className="text-sm underline underline-offset-4 opacity-70 hover:opacity-100"
        >
          ← {dict.interfaces.titleBold}
        </Link>
        <h1 className="mt-2 font-bigger text-3xl uppercase tracking-wide md:text-4xl">
          {title}
        </h1>
      </div>
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="flex flex-col gap-2.5">
            <h2 className="text-sm font-bold text-ink sm:text-base">
              {t(project.title, locale)}
            </h2>
            {project.images[0] ? (
              <div className="relative aspect-[644/362] w-full overflow-hidden bg-sky-pale">
                <Image
                  src={project.images[0]}
                  alt={t(project.title, locale)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : null}
            <p className="text-sm text-ink">
              <MentionedText text={t(project.meta, locale)} brands={content.brands} />
            </p>
            {project.prototypeUrl ? (
              <a
                href={project.prototypeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline underline-offset-2"
              >
                {dict.interfaces.prototype}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}
