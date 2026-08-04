"use client";

import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { content, t } from "@/lib/content";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

type Cover = (typeof content.covers)[number];

function CoverCard({ cover, locale }: { cover: Cover; locale: Locale }) {
  const usage =
    cover.usage && typeof cover.usage === "object"
      ? t(cover.usage, locale)
      : "";
  const inner = (
    <>
      <Image
        src={cover.src}
        alt={cover.alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      {usage && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-full bg-ink/85 px-2 py-2 text-center text-[0.65rem] leading-snug text-sky-pale opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:text-xs">
          {usage}
        </span>
      )}
    </>
  );

  const className =
    "group relative aspect-square w-full overflow-hidden outline-none ring-ink/0 transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ink/40";

  if (cover.href) {
    return (
      <a
        href={cover.href}
        target="_blank"
        rel="noreferrer"
        className={className}
        aria-label={usage || cover.alt}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={className} role="img" aria-label={cover.alt}>
      {inner}
    </div>
  );
}

export function GraphicLayer({ locale, dict }: Props) {
  return (
    <main className="flex w-full flex-col items-center overflow-x-clip">
      <div className="flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-8 sm:gap-8 sm:px-6 md:px-8">
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative h-12 w-12 shrink-0 sm:h-16 sm:w-16">
            <Image
              src="/assets/grafico/brand/group-1.svg"
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="relative h-5 w-[min(100%,14rem)] sm:h-6 sm:w-[min(100%,16rem)]">
              <Image
                src="/assets/grafico/brand/frame-12.svg"
                alt={dict.grafico.title}
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <p className="text-sm text-ink md:text-base">{dict.grafico.subtitle}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-ink md:text-2xl">
          {dict.grafico.covers}
        </h2>

        <div className="grid w-full grid-cols-2 gap-3 drop-shadow-[0_0_5px_rgba(64,65,121,0.35)] sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5">
          {content.covers.map((c) => (
            <CoverCard key={c.id} cover={c} locale={locale} />
          ))}
        </div>

        <div className="relative h-8 w-full sm:h-12">
          <Image
            src="/assets/grafico/brand/vector-5-stroke.svg"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <h2 className="text-xl font-bold text-ink md:text-2xl">
          {dict.grafico.logos}
        </h2>

        {/* Logos individuales para responsive — sin filas que se desborden */}
        <div className="grid w-full grid-cols-2 items-center gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6">
          {content.logos.map((logo) => (
            <div
              key={logo.id}
              className="relative mx-auto flex h-[clamp(2.5rem,8vw,5rem)] w-full max-w-[10rem] items-center justify-center sm:max-w-[12rem]"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain"
              />
              {"overlay" in logo && logo.overlay && (
                <div className="absolute inset-[12%] overflow-hidden rounded-full">
                  <Image
                    src={logo.overlay}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="relative h-8 w-full sm:h-12">
          <Image
            src="/assets/grafico/brand/vector-6-stroke.svg"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <h2 className="text-xl font-bold text-ink md:text-2xl">
          {dict.grafico.personal}
        </h2>

        {content.personal.map((item) => (
          <div
            key={item.id}
            className="relative aspect-[747/996] w-full max-w-[373px]"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-cover"
              sizes="(max-width: 800px) 100vw, 373px"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
