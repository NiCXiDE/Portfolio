"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { pathForLayer, type LayerId } from "@/lib/layers";
import type { PortfolioContent } from "@/lib/content";

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
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    setMenuOpen(false);
  }, [layer]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const showLeft = showCorners && layer !== "grafico";
  const showRight = showCorners && layer !== "interfaces";

  const closeAnd = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-sky-soft text-sm text-ink sm:text-base">
      {/* Mobile: volver al inicio (si aplica) + burger a la derecha */}
      <div className="flex h-11 items-center justify-between md:hidden">
        {layer !== "inicio" ? (
          <button
            type="button"
            onClick={() => closeAnd(onPortfolio)}
            className="ml-3 text-sm font-normal text-ink transition-opacity hover:opacity-70"
          >
            {dict.nav.backHome}
          </button>
        ) : (
          <span className="ml-3" aria-hidden />
        )}
        <button
          type="button"
          className="mr-2 inline-flex size-9 shrink-0 flex-col items-center justify-center gap-1.5"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span
            className={`block h-0.5 w-5 bg-ink transition ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink transition ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink transition ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-5 py-3 md:grid md:px-6 md:py-4">
        <div className="flex min-h-10 min-w-0 items-center justify-self-start">
          <Link
            href={pathForLayer(locale, "grafico")}
            className={`header-corner group flex max-w-full items-center gap-2 ${
              showLeft ? "is-visible" : ""
            }`}
            aria-label={dict.footer.graphic}
            tabIndex={showLeft ? 0 : -1}
            aria-hidden={!showLeft}
          >
            <span className="relative size-8 shrink-0 md:size-9">
              <Image
                src="/assets/inicio/brand/scribble-mouse.svg"
                alt=""
                fill
                className="object-contain object-left"
              />
            </span>
            <span className="relative size-5 shrink-0 -scale-x-100">
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

        <nav className="flex shrink-0 items-center justify-center gap-5 md:gap-6">
          <button
            type="button"
            onClick={onPortfolio}
            className={`transition-opacity hover:opacity-70 ${
              layer === "inicio" ? "font-bold" : "font-normal"
            }`}
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
        </nav>

        <div className="flex min-h-10 min-w-0 items-center justify-self-end">
          <Link
            href={pathForLayer(locale, "interfaces")}
            className={`header-corner group flex max-w-full items-center gap-2 ${
              showRight ? "is-visible" : ""
            }`}
            aria-label={dict.footer.interfaces}
            tabIndex={showRight ? 0 : -1}
            aria-hidden={!showRight}
          >
            <span className="truncate font-normal text-ink">
              {dict.home.interfaces}
            </span>
            <span className="relative size-5 shrink-0">
              <Image
                src="/assets/inicio/brand/arrow-right.svg"
                alt=""
                fill
                className="object-contain"
              />
            </span>
            <span className="relative size-8 shrink-0 md:size-9">
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

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            id="mobile-nav-menu"
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 pb-3 pt-1">
              <button
                type="button"
                onClick={() => closeAnd(onPortfolio)}
                className={`rounded px-2 py-2.5 text-left transition-opacity hover:opacity-70 ${
                  layer === "inicio" ? "font-bold" : "font-normal"
                }`}
              >
                {dict.nav.portfolio}
              </button>
              <button
                type="button"
                onClick={() => closeAnd(onContact)}
                className="rounded px-2 py-2.5 text-left font-normal transition-opacity hover:opacity-70"
              >
                {dict.nav.contact}
              </button>
              <button
                type="button"
                onClick={() => closeAnd(onAbout)}
                className="rounded px-2 py-2.5 text-left font-normal transition-opacity hover:opacity-70"
              >
                {dict.nav.about}
              </button>
              <Link
                href={pathForLayer(locale, "grafico")}
                onClick={() => setMenuOpen(false)}
                className={`rounded px-2 py-2.5 transition-opacity hover:opacity-70 ${
                  layer === "grafico" ? "font-bold" : "font-normal"
                }`}
              >
                {dict.footer.graphic}
              </Link>
              <Link
                href={pathForLayer(locale, "interfaces")}
                onClick={() => setMenuOpen(false)}
                className={`rounded px-2 py-2.5 transition-opacity hover:opacity-70 ${
                  layer === "interfaces" ? "font-bold" : "font-normal"
                }`}
              >
                {dict.footer.interfaces}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

type FooterProps = {
  locale: Locale;
  dict: Dictionary;
  socialLinks: PortfolioContent["socialLinks"];
  settings: PortfolioContent["settings"];
};

export function Footer({ locale, dict, socialLinks, settings }: FooterProps) {
  const note = settings.note[locale] ?? settings.note.es;
  return (
    <footer className="w-full">
      <div className="flex flex-col gap-8 bg-sky-soft px-6 py-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-10 sm:px-10 md:gap-14 lg:px-20">
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-ink md:text-lg">
            {dict.footer.social}
          </h3>
          <ul className="footer-list flex flex-col gap-2.5 text-sm text-ink md:text-base">
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-70"
                >
                  {link.icon ? (
                    <span className="relative inline-block size-4 shrink-0 sm:size-[1.375rem]">
                      <Image
                        src={link.icon}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </span>
                  ) : null}
                  {link.label}
                </a>
              </li>
            ))}
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
                href={`mailto:${settings.email}`}
                className="transition-opacity hover:opacity-70"
              >
                {settings.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${settings.phone.replace(/\s/g, "")}`}
                className="transition-opacity hover:opacity-70"
              >
                {settings.phone}
              </a>
            </li>
            <li>{note}</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center bg-ink px-6 py-3">
        <p className="font-bigger text-lg uppercase tracking-wide text-sky-pale md:text-2xl">
          {settings.poweredBy}
        </p>
      </div>
    </footer>
  );
}

export function TagCloud({ items }: { items: string[] }) {
  return (
    <div className="flex w-full flex-wrap content-start items-center justify-start gap-x-2.5 gap-y-2 py-2 text-left text-sm text-ink md:content-center md:justify-center md:gap-x-3.5 md:text-center md:text-base">
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="inline-flex max-w-full items-center gap-2.5 whitespace-nowrap md:gap-3.5"
        >
          <span
            aria-hidden
            className="inline-block size-1 shrink-0 rounded-full bg-ink/70"
          />
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}
