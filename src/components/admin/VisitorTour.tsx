"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "portfolio-admin-visitor-tour-done";

type TourStep = {
  id: string;
  title: string;
  body: string;
  /** CSS selector for data-tour anchor */
  anchor: string;
  /** Navigates before looking for anchor */
  href?: string;
};

const STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Bienvenido al CMS",
    body: "Esta es una versión espejo del panel con el que se gestiona el portfolio. Podés mirar todo: no se guarda ningún cambio.",
    anchor: "[data-tour='dashboard-title']",
    href: "/admin",
  },
  {
    id: "kpis",
    title: "Resumen visual",
    body: "Las tarjetas muestran cuánto contenido hay por área, con miniaturas en movimiento. Tocá una para ir a esa sección.",
    anchor: "[data-tour='dashboard-kpis']",
    href: "/admin",
  },
  {
    id: "inbox",
    title: "Bandeja de entrada",
    body: "Acá suelen caer piezas nuevas antes de clasificarlas. En la visita real del admin se arrastran archivos; en visitante queda deshabilitada.",
    anchor: "[data-tour='dashboard-inbox']",
    href: "/admin",
  },
  {
    id: "nav-graphic",
    title: "Gráfico",
    body: "Las piezas visuales viven organizadas por sección (portadas, logos, ilustración…). Se publican o se dejan borrador sin tocar el código.",
    anchor: "[data-tour='nav-graphic']",
    href: "/admin",
  },
  {
    id: "nav-interfaces",
    title: "Interfaces",
    body: "Los proyectos UI se cargan con imágenes, categoría y enlace al prototipo. El sitio público toma solo lo marcado como publicado.",
    anchor: "[data-tour='nav-interfaces']",
    href: "/admin",
  },
  {
    id: "nav-testimonials",
    title: "Testimonios",
    body: "Cada testimonio se puede ocultar del sitio sin borrarlo. Lo oculto no aparece en esta visita de vitrina.",
    anchor: "[data-tour='nav-testimonials']",
    href: "/admin",
  },
  {
    id: "nav-ocultos",
    title: "Ocultos",
    body: "Cola de pendientes y contenido que no se muestra afuera. En modo visitante esta bandeja se vacía a propósito.",
    anchor: "[data-tour='nav-ocultos']",
    href: "/admin",
  },
  {
    id: "done",
    title: "Listo para explorar",
    body: "Recorré el menú lateral. Si querés repetir esta guía, usá «Ver guía» en la barra violeta de arriba.",
    anchor: "[data-tour='dashboard-title']",
    href: "/admin",
  },
];

type Pos = { top: number; left: number; placement: "below" | "above" | "right" };

function computePos(el: Element | null): Pos {
  if (!el || typeof window === "undefined") {
    return { top: 96, left: 24, placement: "below" };
  }
  const r = el.getBoundingClientRect();
  const popW = 300;
  const margin = 12;
  let left = Math.min(
    Math.max(margin, r.left),
    window.innerWidth - popW - margin,
  );
  let top = r.bottom + margin;
  let placement: Pos["placement"] = "below";

  if (top + 180 > window.innerHeight) {
    top = Math.max(margin, r.top - 180 - margin);
    placement = "above";
  }
  if (r.left > window.innerWidth * 0.55 && r.width < 200) {
    left = Math.min(r.right + margin, window.innerWidth - popW - margin);
    top = Math.max(margin, r.top);
    placement = "right";
  }
  return { top, left, placement };
}

export function VisitorTour({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 96, left: 24, placement: "below" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!enabled || !mounted) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        setOpen(false);
        return;
      }
    } catch {
      /* ignore */
    }
    setOpen(true);
    setStepIndex(0);
  }, [enabled, mounted]);

  const step = STEPS[stepIndex];

  useLayoutEffect(() => {
    if (!open || !step) return;

    let cancelled = false;

    async function align() {
      if (step.href && pathname !== step.href) {
        router.push(step.href);
        return;
      }
      // wait a tick for paint / navigation
      await new Promise((r) => setTimeout(r, 80));
      if (cancelled) return;
      const el = document.querySelector(step.anchor);
      setPos(computePos(el));
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });

      document.querySelectorAll(".tour-anchor-flash").forEach((node) => {
        node.classList.remove("tour-anchor-flash");
      });
      if (el instanceof HTMLElement) {
        // Restart CSS animation if the same node is targeted again
        void el.offsetWidth;
        el.classList.add("tour-anchor-flash");
        const clearFlash = () => el.classList.remove("tour-anchor-flash");
        el.addEventListener("animationend", clearFlash, { once: true });
        // reduced-motion: no animationend — clear after a beat
        window.setTimeout(clearFlash, 2000);
      }
    }

    void align();

    const onResize = () => {
      const el = document.querySelector(step.anchor);
      setPos(computePos(el));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      document.querySelectorAll(".tour-anchor-flash").forEach((node) => {
        node.classList.remove("tour-anchor-flash");
      });
    };
  }, [open, step, pathname, router]);

  function close(persist: boolean) {
    setOpen(false);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }
  }

  function next() {
    if (stepIndex >= STEPS.length - 1) {
      close(true);
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function prev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  if (!enabled || !mounted || !open || !step) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-live="polite"
    >
      <div
        className="pointer-events-auto absolute w-[min(18.75rem,calc(100vw-1.5rem))] border border-violet-300 bg-violet-600 text-white shadow-lg"
        style={{ top: pos.top, left: pos.left }}
        role="dialog"
        aria-label={step.title}
      >
        <div className="flex items-start justify-between gap-2 border-b border-white/15 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">
            Guía · {stepIndex + 1}/{STEPS.length}
          </p>
          <button
            type="button"
            aria-label="Cerrar guía"
            className="rounded p-0.5 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => close(true)}
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-3 py-3">
          <h3 className="text-sm font-bold">{step.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-white/90">
            {step.body}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-white/15 px-3 py-2">
          <button
            type="button"
            className="text-xs text-white/75 underline-offset-2 hover:underline disabled:opacity-40"
            onClick={prev}
            disabled={stepIndex === 0}
          >
            Anterior
          </button>
          <button
            type="button"
            className="visitor-tour-next bg-white px-3 py-1.5 text-xs font-medium"
            onClick={next}
          >
            {stepIndex >= STEPS.length - 1 ? "Listo" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
