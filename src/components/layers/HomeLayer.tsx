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
          <FigmaGap className="mx-0.5 shrink-0 self-stretch sm:mx-1 md:mx-2" />
          <EditableSurname />
        </div>
      </div>

      <div className="flex w-full max-w-6xl flex-col items-center gap-8 px-4 pb-12 pt-6 sm:gap-10 sm:px-6 md:px-8 md:pt-8 lg:px-10">
        {/* Designer + original vectors */}
        <div className="relative flex w-full flex-col items-center">
          <div className="relative flex items-center justify-center gap-2 sm:gap-3">
            <p className="hero-drift text-[clamp(1.1rem,3vw,2rem)] font-normal text-ink">
              {dict.home.designer}
            </p>
            <div
              className="pointer-events-none absolute -right-9 top-[-35%] size-9 rotate-[-18deg] sm:-right-14 sm:top-[-40%] sm:size-14 md:-right-16 md:size-16 lg:-right-20 lg:size-20"
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

          {/* Misma composición que desktop; en mobile solo más chico */}
          <div
            id="hero-layer-links"
            className="hero-split mt-2 grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 sm:mt-3 sm:gap-3 md:mt-5 md:gap-6 lg:gap-8"
          >
            <Link
              href={pathForLayer(locale, "grafico")}
              className="hero-drift relative h-11 w-full max-w-[8.5rem] justify-self-end transition-opacity hover:opacity-80 sm:h-16 sm:max-w-[14rem] md:h-[5.5rem] md:max-w-none md:w-[min(100%,26rem)]"
              aria-label={dict.footer.graphic}
            >
              <Image
                src="/assets/inicio/brand/hero-grafico.svg"
                alt=""
                fill
                className="object-contain object-right"
                priority
              />
            </Link>

            <div className="hero-drift flex size-7 shrink-0 items-center justify-center bg-sky-pale sm:size-10 md:size-11">
              <span className="text-base font-bold leading-none text-ink-deep sm:text-2xl md:text-3xl">
                &
              </span>
            </div>

            <Link
              href={pathForLayer(locale, "interfaces")}
              className="hero-drift flex flex-row items-center gap-1 justify-self-start transition-opacity hover:opacity-80 sm:gap-1.5 md:gap-2"
              aria-label={dict.footer.interfaces}
            >
              <span className="text-[clamp(0.8rem,2.7vw,2.15rem)] font-normal leading-none whitespace-nowrap text-ink">
                {dict.home.interfaces}
              </span>
              <span className="relative size-4 shrink-0 sm:size-6 md:size-8">
                <Image
                  src="/assets/inicio/brand/arrow-right.svg"
                  alt=""
                  fill
                  className="object-contain"
                />
              </span>
              <span className="relative size-7 shrink-0 sm:size-10 md:size-16 lg:size-[4.5rem]">
                <Image
                  src="/assets/inicio/brand/ruler.svg"
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

        {/* Acerca — Figma 432:1617 */}
        <div
          id="acerca"
          className="flex w-full scroll-mt-24 justify-center"
        >
          <div className="bio-scene">
            <div className="bio-mesa">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.bio.photo}
                alt={t(content.bio.photoAlt, locale)}
                className="bio-cutout bio-asset"
                draggable={false}
              />
              <p className="bio-wrap-text">{t(content.bio.text, locale)}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.bio.signature}
                alt=""
                aria-hidden
                className="bio-signature bio-asset"
                draggable={false}
              />
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
