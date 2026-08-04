"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  LAYER_ORDER,
  layerFromPathname,
  layerIndex,
  neighborLayer,
  pathForLayer,
  type LayerId,
} from "@/lib/layers";
import { Footer, Header } from "@/components/SiteChrome";
import { HomeLayer } from "@/components/layers/HomeLayer";
import { GraphicLayer } from "@/components/layers/GraphicLayer";
import { InterfacesLayer } from "@/components/layers/InterfacesLayer";

type Props = {
  locale: Locale;
  dict: Dictionary;
  children?: ReactNode;
};

const SLIDE_MS = 420;

export function LayerShell({ locale, dict }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const active = layerFromPathname(pathname);
  const index = layerIndex(active);
  const lock = useRef(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const [paneW, setPaneW] = useState(0);
  const scrollRefs = useRef<Record<LayerId, HTMLElement | null>>({
    grafico: null,
    inicio: null,
    interfaces: null,
  });
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Ancho real del shell (no 100vw) para evitar desfase por scrollbar / resize
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const measure = () => setPaneW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      const next = neighborLayer(active, dir);
      if (next) go(next);
    },
    [active, go],
  );

  /** Scroll vertical solo dentro del pane activo — nunca scrollIntoView (rompe el traslape). */
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
  }, [goDir]);

  const onContact = () => {
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
    if (active === "inicio") {
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
    if (e.pointerType === "mouse") return;
    touchStart.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!touchStart.current) return;
    const dx = e.clientX - touchStart.current.x;
    const dy = e.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    if (dx < 0) goDir(1);
    else goDir(-1);
  };

  return (
    <div
      ref={shellRef}
      className="relative h-dvh w-full overflow-hidden bg-white"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        touchStart.current = null;
      }}
    >
      <motion.div
        className="flex h-full will-change-transform"
        initial={false}
        animate={{ x: paneW ? -index * paneW : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                type: "tween",
                duration: SLIDE_MS / 1000,
                ease: [0.32, 0.72, 0, 1],
              }
        }
        style={{
          width: paneW ? paneW * LAYER_ORDER.length : "100%",
          maxWidth: paneW ? paneW * LAYER_ORDER.length : "100%",
        }}
      >
        {LAYER_ORDER.map((id) => (
          <section
            key={id}
            aria-hidden={id !== active}
            className="h-full shrink-0 overflow-hidden"
            style={{
              width: paneW || "100%",
              minWidth: paneW || "100%",
              maxWidth: paneW || "100%",
              flex: paneW ? `0 0 ${paneW}px` : "0 0 100%",
            }}
          >
            <div
              ref={(node) => {
                scrollRefs.current[id] = node;
              }}
              className="site-scroll"
            >
              <Header
                locale={locale}
                dict={dict}
                layer={id}
                onContact={onContact}
                onAbout={onAbout}
                onPortfolio={onPortfolio}
              />
              {id === "grafico" && <GraphicLayer locale={locale} dict={dict} />}
              {id === "inicio" && <HomeLayer locale={locale} dict={dict} />}
              {id === "interfaces" && (
                <InterfacesLayer locale={locale} dict={dict} />
              )}
              <Footer locale={locale} dict={dict} />
            </div>
          </section>
        ))}
      </motion.div>
    </div>
  );
}
