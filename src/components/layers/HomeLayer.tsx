"use client";

import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { pathForLayer } from "@/lib/layers";
import { TagCloud } from "@/components/SiteChrome";
import { content, t } from "@/lib/content";
import { FigmaGap } from "@/components/FigmaGap";
import { EditableSurname } from "@/components/EditableSurname";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export function HomeLayer({ locale, dict }: Props) {
  return (
    <main className="flex w-full min-w-0 max-w-full flex-col items-center overflow-x-hidden">
      {/* Clip duro: el apellido puede pintar más allá, pero no ensancha ni scrollea */}
      <div className="name-row flex w-full min-w-0 max-w-full items-center justify-center overflow-x-hidden px-4 py-2 sm:px-6 md:px-8">
        <div className="flex w-max max-w-full items-end">
          <h1 className="name-hero-text shrink-0 border border-transparent px-1.5 pb-1.5 pt-1 font-bold text-ink sm:px-2.5 sm:pb-2 sm:pt-1.5">
            Nicolas
          </h1>
          <FigmaGap className="mx-1 hidden shrink-0 self-stretch sm:block md:mx-2" />
          <EditableSurname />
        </div>
      </div>

      <div className="flex w-full max-w-6xl flex-col items-center gap-8 px-4 pb-12 pt-6 sm:gap-10 sm:px-6 md:px-8 md:pt-8 lg:px-10">
        {/* Designer + original vectors */}
        <div className="relative flex w-full flex-col items-center">
          <div className="relative flex items-center justify-center gap-3">
            <p className="hero-drift text-[clamp(1.25rem,3vw,2rem)] font-normal text-ink">
              {dict.home.designer}
            </p>
            <div
              className="pointer-events-none absolute -right-14 top-[-40%] hidden size-14 rotate-[-18deg] sm:-right-16 sm:block sm:size-16 md:-right-20 md:size-20"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/inicio/tech/figma.svg"
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* & como eje central; lados simétricos */}
          <div
            id="hero-layer-links"
            className="hero-split mt-4 grid w-full grid-cols-1 items-center gap-5 md:mt-5 md:grid-cols-[1fr_auto_1fr] md:gap-6 lg:gap-8"
          >
            <Link
              href={pathForLayer(locale, "grafico")}
              className="hero-drift relative mx-auto block h-16 w-full max-w-[18rem] transition-opacity hover:opacity-80 sm:h-20 sm:max-w-[22rem] md:mx-0 md:h-[5.5rem] md:max-w-none md:justify-self-end md:w-[min(100%,26rem)]"
              aria-label={dict.footer.graphic}
            >
              <Image
                src="/assets/inicio/brand/hero-grafico.svg"
                alt=""
                fill
                className="object-contain object-center md:object-right"
                priority
              />
            </Link>

            <div className="hero-drift mx-auto flex size-10 shrink-0 items-center justify-center bg-sky-pale sm:size-11 md:mx-0">
              <span className="text-2xl font-bold leading-none text-ink-deep sm:text-3xl">
                &
              </span>
            </div>

            <Link
              href={pathForLayer(locale, "interfaces")}
              className="hero-drift flex flex-col items-center gap-2 transition-opacity hover:opacity-80 md:flex-row md:items-center md:justify-self-start md:gap-2"
              aria-label={dict.footer.interfaces}
            >
              <span className="relative order-1 size-12 shrink-0 md:order-3 md:size-16 lg:size-[4.5rem]">
                <Image
                  src="/assets/inicio/brand/ruler.svg"
                  alt=""
                  fill
                  className="object-contain"
                />
              </span>
              <span className="order-2 text-[clamp(1.35rem,3.2vw,2.15rem)] font-normal leading-none whitespace-nowrap text-ink md:order-1">
                {dict.home.interfaces}
              </span>
              <span className="relative order-3 size-7 shrink-0 md:order-2 md:size-8">
                <Image
                  src="/assets/inicio/brand/arrow-right.svg"
                  alt=""
                  fill
                  className="object-contain"
                />
              </span>
            </Link>
          </div>
        </div>

        <div className="hero-drift">
          <div className="relative size-9 rotate-90 -scale-y-100 sm:size-10">
            <Image
              src="/assets/inicio/brand/arrow-down.svg"
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Acerca: tamaño anterior; solo centrado horizontal */}
        <div
          id="acerca"
          className="flex w-full scroll-mt-24 justify-center"
        >
          <div className="bio-scene">
            <div className="bio-mesa">
              <span className="bio-shape" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.bio.photo}
                alt={t(content.bio.photoAlt, locale)}
                className="bio-cutout"
              />
              <p className="bio-wrap-text">{t(content.bio.text, locale)}</p>
            </div>
          </div>
        </div>

        <section className="flex w-full flex-col items-center gap-3">
          <h2 className="text-center text-xl font-bold text-ink md:text-2xl">
            {dict.home.companiesTitle}
          </h2>
          <TagCloud items={content.companies} />
        </section>

        <section className="flex w-full flex-col items-center gap-3">
          <h2 className="text-center text-xl font-bold text-ink md:text-2xl">
            {dict.home.pastProjectsTitle}
          </h2>
          <TagCloud items={content.pastProjects} />
        </section>

        <section className="flex w-full flex-col items-center gap-3">
          <h2 className="text-center text-xl font-bold text-ink md:text-2xl">
            {dict.home.currentProjectsTitle}
          </h2>
          <TagCloud items={content.currentProjects} />
        </section>

        <div className="flex w-full flex-col gap-8 md:gap-10">
          <h2 className="text-center text-xl font-bold text-ink md:text-2xl">
            {dict.home.testimonialsTitle}
          </h2>
          {content.testimonials.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 sm:flex-row sm:gap-6"
            >
              <div className="relative aspect-square w-full max-w-[220px] shrink-0 overflow-hidden sm:max-w-[260px]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="260px"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 py-1">
                <p className="text-base leading-relaxed text-ink md:text-lg">
                  {t(item.quote, locale)}
                </p>
                <p className="text-lg font-bold text-ink">{item.name}</p>
                <p className="text-base font-medium text-ink/80">
                  {t(item.role, locale)}
                </p>
                {"company" in item && item.company && (
                  <a
                    href={item.company.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex w-fit max-w-full items-center transition-opacity hover:opacity-70"
                    aria-label={item.company.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.company.logo}
                      alt={item.company.name}
                      className="testimonial-logo"
                    />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
