"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { PortfolioContent } from "@/lib/content";
import {
  LAYER_ORDER,
  layerFromPathname,
  layerIndex,
  neighborLayer,
  pathForLayer,
  type LayerId,
} from "@/lib/layers";
import { Footer, Header } from "@/components/SiteChrome";
import { BackToTop } from "@/components/BackToTop";
import { StickyMobileCta } from "@/components/StickyMobileCta";
import { JsonLdPerson } from "@/components/JsonLd";
import { HomeLayer } from "@/components/layers/HomeLayer";
import { GraphicLayer } from "@/components/layers/GraphicLayer";
import { InterfacesLayer } from "@/components/layers/InterfacesLayer";

type Props = {
  locale: Locale;
  dict: Dictionary;
  content: PortfolioContent;
  children?: ReactNode;
};

const SLIDE_MS = 420;
const LAYER_COUNT = LAYER_ORDER.length;
const PANE_PCT = 100 / LAYER_COUNT;

const GRAPHIC_SECTIONS =
  /\/grafico\/(covers|logos|personal|illustration|banners|eventos|manuals)(\/[^/]+)?\/?$/;
const INTERFACE_SECTIONS =
  /\/interfaces\/(preventas|sistemas-a-medida|apps-mobile|proyectos-personales|system-design)\/?$/;
const STANDALONE_PAGES = /\/privacidad\/?$/;

function isCatalogDetailPath(pathname: string) {
  return GRAPHIC_SECTIONS.test(pathname) || INTERFACE_SECTIONS.test(pathname);
}

function isStandalonePath(pathname: string) {
  return isCatalogDetailPath(pathname) || STANDALONE_PAGES.test(pathname);
}

export function LayerShell({ locale, dict, content, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const catalogDetail = isStandalonePath(pathname);
  const active = layerFromPathname(pathname);
  const index = layerIndex(active);
  const lock = useRef(false);
  const canAnimate = useRef(false);
  const scrollRefs = useRef<Record<LayerId, HTMLElement | null>>({
    grafico: null,
    inicio: null,
    interfaces: null,
  });
  const detailScrollRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    canAnimate.current = true;
  }, []);

  const getActiveScroller = useCallback(
    () =>
      catalogDetail ? detailScrollRef.current : scrollRefs.current[active],
    [active, catalogDetail],
  );

  const go = useCallback(
    (id: LayerId) => {
      if (lock.current || id === active) return;
      lock.current = true;
      router.push(pathForLayer(locale, id));
      window.setTimeout(() => {
        lock.current = false;
      }, SLIDE_MS + 80);
    },
    [active, locale, router],
  );

  const goDir = useCallback(
    (dir: -1 | 1) => {
      if (catalogDetail) return;
      const next = neighborLayer(active, dir);
      if (next) go(next);
    },
    [active, catalogDetail, go],
  );

  const scrollPaneTo = useCallback(
    (layer: LayerId, selector: string, smooth: boolean) => {
      const scroller = scrollRefs.current[layer];
      const target = scroller?.querySelector(selector) as HTMLElement | null;
      if (!scroller || !target) return;
      const header = scroller.querySelector("header");
      const headerH = header?.getBoundingClientRect().height ?? 0;
      const nextTop =
        scroller.scrollTop +
        (target.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top) -
        headerH -
        8;
      scroller.scrollTo({
        top: Math.max(0, nextTop),
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [],
  );

  useEffect(() => {
    if (catalogDetail) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goDir(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goDir(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [catalogDetail, goDir]);

  const onContact = () => {
    if (catalogDetail) {
      document
        .getElementById("contacto")
        ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    scrollPaneTo(active, "#contacto", !reduceMotion);
  };

  const onAbout = () => {
    const run = () => scrollPaneTo("inicio", "#acerca", !reduceMotion);
    if (active !== "inicio") {
      go("inicio");
      window.setTimeout(run, reduceMotion ? 0 : SLIDE_MS + 40);
      return;
    }
    run();
  };

  const onPortfolio = () => {
    if (active === "inicio" && !catalogDetail) {
      scrollRefs.current.inicio?.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });
      return;
    }
    go("inicio");
    window.setTimeout(() => {
      scrollRefs.current.inicio?.scrollTo({ top: 0, behavior: "auto" });
    }, reduceMotion ? 0 : SLIDE_MS + 40);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (catalogDetail) return;
    if (e.pointerType === "mouse") return;
    touchStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (catalogDetail || !touchStart.current) return;
    const dx = e.clientX - touchStart.current.x;
    const dy = e.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    if (dx < 0) goDir(1);
    else goDir(-1);
  };

  if (catalogDetail) {
    return (
      <div className="relative h-dvh w-full overflow-hidden bg-white">
        <JsonLdPerson
          email={content.settings.email}
          socialLinks={content.socialLinks}
        />
        <div
          ref={(node) => {
            detailScrollRef.current = node;
          }}
          className="site-scroll site-scroll-detail h-full pb-16 md:pb-0"
        >
          <Header
            locale={locale}
            dict={dict}
            layer={active}
            onContact={onContact}
            onAbout={onAbout}
            onPortfolio={onPortfolio}
          />
          {children}
          <Footer
            locale={locale}
            dict={dict}
            socialLinks={content.socialLinks}
            settings={content.settings}
          />
        </div>
        <StickyMobileCta
          label={dict.home.contactCta}
          onContact={onContact}
        />
        <BackToTop
          label={dict.common.backToTop}
          layer={active}
          getScroller={getActiveScroller}
        />
      </div>
    );
  }

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-white"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        touchStart.current = null;
      }}
    >
      <JsonLdPerson
        email={content.settings.email}
        socialLinks={content.socialLinks}
      />
      <motion.div
        className="flex h-full will-change-transform"
        style={{ width: `${LAYER_COUNT * 100}%` }}
        initial={false}
        animate={{ x: `${-index * PANE_PCT}%` }}
        transition={
          reduceMotion || !canAnimate.current
            ? { duration: 0 }
            : {
                type: "tween",
                duration: SLIDE_MS / 1000,
                ease: [0.32, 0.72, 0, 1],
              }
        }
      >
        {LAYER_ORDER.map((id) => (
          <section
            key={id}
            aria-hidden={id !== active}
            className="h-full shrink-0 overflow-hidden"
            style={{
              flex: `0 0 ${PANE_PCT}%`,
              width: `${PANE_PCT}%`,
              maxWidth: `${PANE_PCT}%`,
            }}
          >
            <div
              ref={(node) => {
                scrollRefs.current[id] = node;
              }}
              className="site-scroll pb-16 md:pb-0"
            >
              <Header
                locale={locale}
                dict={dict}
                layer={id}
                onContact={onContact}
                onAbout={onAbout}
                onPortfolio={onPortfolio}
              />
              {id === "grafico" && (
                <GraphicLayer locale={locale} dict={dict} content={content} />
              )}
              {id === "inicio" && (
                <HomeLayer locale={locale} dict={dict} content={content} />
              )}
              {id === "interfaces" && (
                <InterfacesLayer
                  locale={locale}
                  dict={dict}
                  content={content}
                />
              )}
              <Footer
                locale={locale}
                dict={dict}
                socialLinks={content.socialLinks}
                settings={content.settings}
              />
            </div>
          </section>
        ))}
      </motion.div>
      <StickyMobileCta label={dict.home.contactCta} onContact={onContact} />
      <BackToTop
        label={dict.common.backToTop}
        layer={active}
        getScroller={getActiveScroller}
      />
    </div>
  );
}
