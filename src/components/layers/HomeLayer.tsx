"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { pathForLayer } from "@/lib/layers";
import { t, type PortfolioContent } from "@/lib/content";
import { FigmaGap } from "@/components/FigmaGap";
import { EditableSurname } from "@/components/EditableSurname";
import { CvDownloadButton } from "@/components/CvDownloadButton";
import { InfiniteMarquee } from "@/components/InfiniteMarquee";
import { MentionedText } from "@/components/MentionText";
import {
  BrandVectorMask,
  ThemeSwapImage,
  isSvgAsset,
} from "@/components/BrandVector";
import type { CSSProperties } from "react";

type Props = {
  locale: Locale;
  dict: Dictionary;
  content: PortfolioContent;
};

export function HomeLayer({ locale, dict, content }: Props) {
  return (
    <main className="flex w-full min-w-0 max-w-full flex-col items-center overflow-x-hidden">
      {/* Clip duro: el apellido puede pintar más allá, pero no ensancha ni scrollea */}
      <div className="name-row flex w-full min-w-0 max-w-full items-center justify-center overflow-x-hidden px-4 py-2 sm:px-6 md:px-8">
        <div className="name-hero-group relative flex w-max max-w-full items-end">
          <h1 className="name-hero-text shrink-0 border border-transparent px-1.5 pb-1.5 pt-1 font-bold text-ink sm:px-2.5 sm:pb-2 sm:pt-1.5">
            Nico
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

          {/* Misma composición simétrica: garabato + flecha + texto */}
          <div
            id="hero-layer-links"
            className="hero-split mt-2 grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 sm:mt-3 sm:gap-3 md:mt-5 md:gap-6 lg:gap-8"
          >
            <Link
              href={pathForLayer(locale, "grafico")}
              className="hero-nudge-left flex flex-row items-center gap-1 justify-self-end transition-[filter] hover:saturate-125 sm:gap-1.5 md:gap-2 cursor-nav interactive-ink"
              aria-label={dict.footer.graphic}
            >
              <span className="relative size-7 shrink-0 sm:size-10 md:size-16 lg:size-[4.5rem]">
                <ThemeSwapImage
                  lightSrc="/assets/inicio/brand/scribble-mouse.svg"
                  darkSrc="/assets/inicio/brand/scribble-mouse-dark.svg"
                  alt=""
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 40px, 72px"
                />
              </span>
              <BrandVectorMask
                src="/assets/inicio/brand/arrow-right.svg"
                className="size-4 shrink-0 -scale-x-100 sm:size-6 md:size-8"
              />
              <span className="text-[clamp(0.8rem,2.7vw,2.15rem)] font-normal leading-none whitespace-nowrap text-ink">
                {dict.home.graphic}
              </span>
            </Link>

            <div className="hero-drift flex shrink-0 items-center justify-center px-0.5 sm:px-1">
              <span className="text-base font-normal leading-none text-ink sm:text-2xl md:text-3xl">
                &
              </span>
            </div>

            <Link
              href={pathForLayer(locale, "interfaces")}
              className="hero-nudge-right flex flex-row items-center gap-1 justify-self-start transition-[filter] hover:saturate-125 sm:gap-1.5 md:gap-2 cursor-nav interactive-ink"
              aria-label={dict.footer.interfaces}
            >
              <span className="text-[clamp(0.8rem,2.7vw,2.15rem)] font-normal leading-none whitespace-nowrap text-ink">
                {dict.home.interfaces}
              </span>
              <BrandVectorMask
                src="/assets/inicio/brand/arrow-right.svg"
                className="size-4 shrink-0 sm:size-6 md:size-8"
              />
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

        {/* Acerca — Figma 432:1617 */}
        <div
          id="acerca"
          className="flex w-full scroll-mt-24 justify-center"
        >
          <div
            className="bio-scene"
            style={
              {
                ["--bio-wrap-shape"]: `url("${content.bio.photo}")`,
              } as CSSProperties
            }
          >
            <div className="bio-mesa">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.bio.photo}
                alt={t(content.bio.photoAlt, locale)}
                className="bio-cutout bio-asset"
                draggable={false}
              />
              <p className="bio-wrap-text">{t(content.bio.text, locale)}</p>
              <div className="bio-meta">
                <CvDownloadButton
                  cvEs={content.bio.cv}
                  cvEn={content.bio.cvEn}
                  label={dict.home.downloadCv}
                  closeLabel={dict.common.close}
                />
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
        </div>

        {content.settings.homeLayout.sectionOrder.map((sectionId) => {
          if (sectionId === "testimonials") {
            return (
              <div
                key={sectionId}
                className="flex w-full flex-col gap-8 md:gap-10"
              >
                <h2 className="text-center text-xl font-bold text-ink md:text-2xl">
                  {dict.home.testimonialsTitle}
                </h2>
                {content.testimonials.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-row items-start gap-3 bg-sky-pale p-3 md:gap-6 md:p-5"
                  >
                    <div className="relative aspect-square w-[110px] shrink-0 overflow-hidden bg-ink/5 md:w-[260px]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 767px) 110px, 260px"
                        />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5 md:gap-2 md:py-1">
                      <p className="text-sm leading-relaxed text-ink md:text-lg">
                        <MentionedText
                          text={t(item.quote, locale)}
                          brands={content.brands}
                        />
                      </p>
                      <p className="text-sm font-bold text-ink md:text-lg">
                        {item.name}
                      </p>
                      <p className="text-sm font-medium text-ink/80 md:text-base">
                        <MentionedText
                          text={t(item.role, locale)}
                          brands={content.brands}
                        />
                      </p>
                      {item.company.href ? (
                        item.company.logo ? (
                          <a
                            href={item.company.href}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex w-fit max-w-full items-center transition-opacity hover:opacity-70"
                            aria-label={item.company.name}
                          >
                            {isSvgAsset(item.company.logo) ? (
                              <BrandVectorMask
                                src={item.company.logo}
                                label={item.company.name}
                                position="left center"
                                className="testimonial-logo"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.company.logo}
                                alt={item.company.name}
                                className="testimonial-logo"
                              />
                            )}
                          </a>
                        ) : (
                          <a
                            href={item.company.href}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-ink underline underline-offset-4 transition-opacity hover:opacity-70 md:text-base"
                          >
                            <ExternalLink
                              className="size-3.5 shrink-0"
                              strokeWidth={1.75}
                            />
                            {item.company.linkLabel
                              ? t(item.company.linkLabel, locale)
                              : item.company.name}
                          </a>
                        )
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            );
          }

          const projectsPresentation =
            content.homeProjectsPresentation ?? "legacy-split";

          // Featured mode: single projects marquee; Current section not rendered.
          if (
            projectsPresentation === "featured" &&
            sectionId === "current_projects"
          ) {
            return null;
          }

          const meta = {
            companies: {
              title: dict.home.companiesTitle,
              items: content.companies,
              kind: "company" as const,
            },
            past_projects: {
              title:
                projectsPresentation === "featured"
                  ? dict.home.featuredProjectsTitle
                  : dict.home.pastProjectsTitle,
              items: content.pastProjects,
              kind: "past_project" as const,
            },
            current_projects: {
              title: dict.home.currentProjectsTitle,
              items: content.currentProjects,
              kind: "current_project" as const,
            },
          }[sectionId];

          if (!meta) return null;

          return (
            <section
              key={sectionId}
              className="flex w-full flex-col items-stretch gap-3 md:items-center"
            >
              <h2 className="text-left text-xl font-bold text-ink md:text-center md:text-2xl">
                {meta.title}
              </h2>
              <InfiniteMarquee
                items={meta.items}
                config={content.settings.homeLayout.marquees[meta.kind]}
                locale={locale}
              />
            </section>
          );
        })}
      </div>
    </main>
  );
}
