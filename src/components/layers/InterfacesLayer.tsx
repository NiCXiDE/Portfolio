"use client";

import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { content, t } from "@/lib/content";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export function InterfacesLayer({ locale, dict }: Props) {
  return (
    <main className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-8 sm:gap-10 sm:px-6 md:px-8">
        {/* Techito: rulers pinned top-left of this section */}
        <div className="relative w-full pt-12 pl-12 sm:pt-14 sm:pl-14">
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 size-16 sm:size-20 md:size-24"
            aria-hidden
          >
            <Image
              src="/assets/interfaces/brand/ruler.svg"
              alt=""
              fill
              className="object-contain object-left-top"
              priority
            />
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            <h1 className="text-2xl font-normal leading-tight text-ink sm:text-3xl md:text-4xl">
              {dict.interfaces.titlePrefix}
              <span className="font-bold">{dict.interfaces.titleBold}</span>
            </h1>
            <p className="text-base text-ink md:text-lg">
              {dict.interfaces.subtitle}
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          {content.uiProjects.map((project) => {
            const href = project.prototypeUrl;
            return (
              <article key={project.id} className="flex flex-col gap-2.5">
                <h3 className="text-sm font-bold text-ink sm:text-base">
                  {t(project.title, locale)}
                </h3>
                <div className="relative aspect-[644/362] w-full overflow-hidden bg-sky-pale">
                  {project.kind === "image" &&
                    "image" in project &&
                    project.image && (
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="relative h-2/5 w-2/5">
                          <Image
                            src={project.image}
                            alt=""
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  {project.kind === "text" && "label" in project && (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[clamp(2rem,4vw,4.5rem)] font-bold text-ink">
                        {project.label}
                      </span>
                    </div>
                  )}
                  {project.kind === "proxi" && (
                    <div className="flex h-full items-center justify-center gap-1 px-6">
                      <span className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-ink">
                        Pr
                      </span>
                      <span className="relative mx-1 size-[clamp(2rem,4vw,4rem)]">
                        <Image
                          src="/assets/interfaces/brand/subtract.svg"
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </span>
                      <span className="text-[clamp(2.5rem,5vw,5rem)] font-bold text-ink">
                        i
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink">
                  <span>{t(project.meta, locale)}</span>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 transition-opacity hover:opacity-70"
                    >
                      {dict.interfaces.prototype}
                    </a>
                  ) : (
                    <span
                      className="underline underline-offset-2 opacity-50"
                      title="TODO: prototypeUrl en content/interfaces/projects.json"
                    >
                      {dict.interfaces.prototype}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {content.uiList.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 p-2.5">
              {"logo" in item && item.logo && (
                <div className="relative mb-2 h-14 w-40 sm:h-16 sm:w-52">
                  <Image
                    src={item.logo}
                    alt=""
                    fill
                    className="object-contain object-left"
                  />
                </div>
              )}
              {"wordmark" in item && item.wordmark && (
                <p className="mb-1 text-[clamp(1.5rem,3vw,2.75rem)] font-bold leading-tight text-ink">
                  {item.wordmark}
                </p>
              )}
              {"caption" in item && item.caption && (
                <p className="text-sm text-ink">{item.caption}</p>
              )}
              <p className="text-[clamp(1rem,1.8vw,1.625rem)] text-ink">
                {t(item.title, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
