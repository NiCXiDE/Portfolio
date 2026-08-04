"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { pathForLayer, type LayerId } from "@/lib/layers";

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
  layer: LayerId;
  onContact: () => void;
  onAbout: () => void;
  onPortfolio: () => void;
};

export function Header({
  locale,
  dict,
  layer,
  onContact,
  onAbout,
  onPortfolio,
}: HeaderProps) {
  const otherLocale = locale === "es" ? "en" : "es";
  const base =
    layer === "inicio" ? `/${otherLocale}` : `/${otherLocale}/${layer}`;

  const [showCorners, setShowCorners] = useState(layer !== "inicio");

  useEffect(() => {
    if (layer !== "inicio") {
      setShowCorners(true);
      return;
    }

    const hero = document.querySelector("#hero-layer-links");
    const scroller = hero?.closest(".site-scroll");
    if (!hero || !scroller) {
      setShowCorners(false);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setShowCorners(!entry.isIntersecting),
      { root: scroller, threshold: 0, rootMargin: "0px" },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [layer]);

  const showLeft = showCorners && layer !== "grafico";
  const showRight = showCorners && layer !== "interfaces";

  return (
    <header className="sticky top-0 z-40 grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 bg-sky-soft px-3 py-2.5 text-sm text-ink sm:gap-3 sm:px-5 sm:py-3 sm:text-base md:px-6 md:py-4">
      {/* Esquina izq: garabato + flecha + texto (sin vector “Gráfico”) */}
      <div className="flex min-h-9 min-w-0 items-center justify-self-start sm:min-h-10">
        <Link
          href={pathForLayer(locale, "grafico")}
          className={`header-corner group flex max-w-full items-center gap-1.5 sm:gap-2 ${
            showLeft ? "is-visible" : ""
          }`}
          aria-label={dict.footer.graphic}
          tabIndex={showLeft ? 0 : -1}
          aria-hidden={!showLeft}
        >
          <span className="relative size-7 shrink-0 sm:size-8 md:size-9">
            <Image
              src="/assets/inicio/brand/scribble-mouse.svg"
              alt=""
              fill
              className="object-contain object-left"
            />
          </span>
          <span className="relative size-4 shrink-0 -scale-x-100 sm:size-5">
            <Image
              src="/assets/inicio/brand/arrow-right.svg"
              alt=""
              fill
              className="object-contain"
            />
          </span>
          <span className="truncate font-normal text-ink">
            {dict.home.graphic}
          </span>
        </Link>
      </div>

      {/* Nav central */}
      <nav className="flex shrink-0 items-center justify-center gap-3 sm:gap-5 md:gap-6">
        <button
          type="button"
          onClick={onPortfolio}
          className="font-bold transition-opacity hover:opacity-70"
        >
          {dict.nav.portfolio}
        </button>
        <button
          type="button"
          onClick={onContact}
          className="font-normal transition-opacity hover:opacity-70"
        >
          {dict.nav.contact}
        </button>
        <button
          type="button"
          onClick={onAbout}
          className="whitespace-nowrap font-normal transition-opacity hover:opacity-70"
        >
          {dict.nav.about}
        </button>
        <Link
          href={base}
          className="rounded border border-ink/20 px-2 py-0.5 text-sm font-medium tracking-wide transition-opacity hover:opacity-70 sm:text-base"
          aria-label={`Switch to ${otherLocale.toUpperCase()}`}
        >
          {dict.nav.lang}
        </Link>
      </nav>

      {/* Esquina der: texto + flecha + regla */}
      <div className="flex min-h-9 min-w-0 items-center justify-self-end sm:min-h-10">
        <Link
          href={pathForLayer(locale, "interfaces")}
          className={`header-corner group flex max-w-full items-center gap-1.5 sm:gap-2 ${
            showRight ? "is-visible" : ""
          }`}
          aria-label={dict.footer.interfaces}
          tabIndex={showRight ? 0 : -1}
          aria-hidden={!showRight}
        >
          <span className="truncate font-normal text-ink">
            {dict.home.interfaces}
          </span>
          <span className="relative size-4 shrink-0 sm:size-5">
            <Image
              src="/assets/inicio/brand/arrow-right.svg"
              alt=""
              fill
              className="object-contain"
            />
          </span>
          <span className="relative size-7 shrink-0 sm:size-8 md:size-9">
            <Image
              src="/assets/inicio/brand/ruler.svg"
              alt=""
              fill
              className="object-contain"
            />
          </span>
        </Link>
      </div>
    </header>
  );
}

type FooterProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Footer({ locale, dict }: FooterProps) {
  return (
    <footer className="w-full">
      <div className="flex flex-col gap-8 bg-sky-soft px-6 py-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-10 sm:px-10 md:gap-14 lg:px-20">
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-ink md:text-lg">
            {dict.footer.social}
          </h3>
          <ul className="footer-list flex flex-col gap-2.5 text-sm text-ink md:text-base">
            <li>
              <a
                href="https://x.com/nicoasinormal"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-70"
              >
                <span className="relative inline-block size-4 shrink-0 sm:size-[1.375rem]">
                  <Image
                    src="/assets/shared/x.svg"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </span>
                {dict.footer.x}
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/nicxayala"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-70"
              >
                <span className="relative inline-block size-4 shrink-0 sm:size-[1.375rem]">
                  <Image
                    src="/assets/shared/instagram.svg"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </span>
                {dict.footer.instagram}
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/nicoayala-design"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-70"
              >
                <span className="relative inline-block size-4 shrink-0 sm:size-[1.375rem]">
                  <Image
                    src="/assets/shared/linkedin.svg"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </span>
                {dict.footer.linkedin}
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-ink md:text-lg">
            {dict.footer.navigation}
          </h3>
          <ul className="footer-list flex flex-col gap-2.5 text-sm text-ink md:text-base">
            <li>
              <Link
                href={pathForLayer(locale, "inicio")}
                className="transition-opacity hover:opacity-70"
              >
                {dict.footer.home}
              </Link>
            </li>
            <li>
              <Link
                href={pathForLayer(locale, "grafico")}
                className="transition-opacity hover:opacity-70"
              >
                {dict.footer.graphic}
              </Link>
            </li>
            <li>
              <Link
                href={pathForLayer(locale, "interfaces")}
                className="transition-opacity hover:opacity-70"
              >
                {dict.footer.interfaces}
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex max-w-xl flex-col gap-4" id="contacto">
          <h3 className="text-base font-bold text-ink md:text-lg">
            {dict.footer.contact}
          </h3>
          <ul className="footer-list flex flex-col gap-2.5 text-sm text-ink md:text-base">
            <li>
              <a
                href={`mailto:${dict.footer.email}`}
                className="transition-opacity hover:opacity-70"
              >
                {dict.footer.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${dict.footer.phone.replace(/\s/g, "")}`}
                className="transition-opacity hover:opacity-70"
              >
                {dict.footer.phone}
              </a>
            </li>
            <li>{dict.footer.note}</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center bg-ink px-6 py-3">
        <p className="font-bigger text-lg uppercase tracking-wide text-sky-pale md:text-2xl">
          POWERED BY PUSH
        </p>
      </div>
    </footer>
  );
}

export function TagCloud({ items }: { items: string[] }) {
  return (
    <div className="flex w-full flex-wrap content-center items-center justify-center gap-y-2 py-2 text-center text-sm text-ink md:text-base">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="inline-flex max-w-full items-center whitespace-nowrap"
        >
          {i > 0 && (
            <span
              aria-hidden
              className="mx-2.5 inline-block size-1 shrink-0 rounded-full bg-ink/70 md:mx-3.5"
            />
          )}
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}
