"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MIN_PX = 16;
const MAX_PX = 500;
const DEFAULT_PX = 24;
const SNAP_STEPS = [16, 24, 48, 96, 200, 350, 500];
const SPACING_CLASS = "name-hero-group--spacing";

type Mode = "loop" | "hold" | "returning";

type Props = {
  className?: string;
};

type AlignGuides = {
  h: { top: number; left: number; width: number };
  v: { top: number; left: number; height: number };
};

/**
 * Caras de Nicolas / Ayala en viewport.
 * min → caras internas | max → caras externas
 */
type FaceBounds = {
  /** Izquierda de Nicolas (cara externa izq.) */
  outerLeft: number;
  /** Derecha de Nicolas (cara interna izq.) */
  innerLeft: number;
  /** Izquierda de Ayala (cara interna der.) */
  innerRight: number;
  /** Derecha de Ayala (cara externa der.) */
  outerRight: number;
  top: number;
  height: number;
};

export function FigmaGap({ className = "" }: Props) {
  const [mode, setMode] = useState<Mode>("loop");
  const [width, setWidth] = useState(DEFAULT_PX);
  const [atEdge, setAtEdge] = useState<"min" | "max" | null>(null);
  const [guides, setGuides] = useState<AlignGuides | null>(null);
  const [faces, setFaces] = useState<FaceBounds | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);
  const step = useRef(1);
  const resumeTimer = useRef<number | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(DEFAULT_PX);
  const btnRef = useRef<HTMLButtonElement>(null);
  const parentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearResume = () => {
    if (resumeTimer.current) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  };

  const clamp = (w: number) => Math.min(MAX_PX, Math.max(MIN_PX, w));

  const syncEdge = useCallback((w: number) => {
    if (w <= MIN_PX) setAtEdge("min");
    else if (w >= MAX_PX) setAtEdge("max");
    else setAtEdge(null);
  }, []);

  const measureGuides = useCallback(() => {
    const btn = btnRef.current;
    const parent = parentRef.current ?? btn?.parentElement;
    if (!btn || !parent) {
      setGuides(null);
      setFaces(null);
      return;
    }
    parentRef.current = parent;

    const parentRect = parent.getBoundingClientRect();
    // No usar first/last: el portal del marco de selección se appenda al padre
    const nicolasEl = parent.querySelector(":scope > h1");
    const ayalaEl = parent.querySelector(".surname-box");
    const nicolas = nicolasEl?.getBoundingClientRect() ?? parentRect;
    const ayala = ayalaEl?.getBoundingClientRect() ?? parentRect;
    // Caras internas = bordes del gap arrastrable (alineado con el arrastre)
    const gap = btn.getBoundingClientRect();

    setFaces({
      outerLeft: nicolas.left,
      innerLeft: gap.left,
      innerRight: gap.right,
      outerRight: ayala.right,
      top: parentRect.top,
      height: Math.max(parentRect.height, 1),
    });

    const row = parent.closest(".name-row") as HTMLElement | null;
    const scroll = parent.closest(".site-scroll") as HTMLElement | null;
    const frame = scroll ?? row;
    const frameRect = frame?.getBoundingClientRect();
    const wallLeft = Math.max(0, frameRect?.left ?? 0);
    const wallTop = Math.max(0, frameRect?.top ?? 0);

    const centerX = parentRect.left + parentRect.width / 2;
    const midY = parentRect.top + parentRect.height / 2;

    setGuides({
      h: {
        top: midY,
        left: wallLeft,
        width: Math.max(0, parentRect.left - wallLeft),
      },
      v: {
        top: wallTop,
        left: centerX,
        height: Math.max(0, parentRect.top - wallTop),
      },
    });
  }, []);

  const scheduleResume = useCallback(() => {
    clearResume();
    resumeTimer.current = window.setTimeout(() => {
      setAtEdge(null);
      setPointer(null);
      setMode("returning");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWidth(DEFAULT_PX);
        });
      });
    }, 2000);
  }, []);

  const holdAt = (w: number, clientX?: number, clientY?: number) => {
    const next = clamp(w);
    setMode("hold");
    setWidth(next);
    syncEdge(next);
    if (clientX != null && clientY != null) {
      setPointer({ x: clientX, y: clientY });
    }
    scheduleResume();
  };

  useEffect(() => () => clearResume(), []);

  useEffect(() => {
    if (mode !== "returning") return;
    const el = btnRef.current;
    if (!el) return;

    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "width") return;
      setMode("loop");
    };

    el.addEventListener("transitionend", onEnd);
    const t = window.setTimeout(() => setMode("loop"), 700);
    return () => {
      el.removeEventListener("transitionend", onEnd);
      window.clearTimeout(t);
    };
  }, [mode]);

  const showMeasure = mode === "hold" || mode === "returning";

  useEffect(() => {
    if (!showMeasure) {
      setAtEdge(null);
      return;
    }
    syncEdge(width);
  }, [width, showMeasure, syncEdge]);

  useEffect(() => {
    const parent = parentRef.current ?? btnRef.current?.parentElement;
    if (!parent) return;
    parentRef.current = parent;
    if (showMeasure) parent.classList.add(SPACING_CLASS);
    else parent.classList.remove(SPACING_CLASS);
    return () => parent.classList.remove(SPACING_CLASS);
  }, [showMeasure]);

  useLayoutEffect(() => {
    if (!showMeasure) {
      setGuides(null);
      setFaces(null);
      return;
    }
    measureGuides();
    const parent = parentRef.current;
    if (!parent) return;

    const ro = new ResizeObserver(() => measureGuides());
    ro.observe(parent);
    if (btnRef.current) ro.observe(btnRef.current);
    const nicolasEl = parent.querySelector(":scope > h1");
    const ayalaEl = parent.querySelector(".surname-box");
    if (nicolasEl) ro.observe(nicolasEl);
    if (ayalaEl) ro.observe(ayalaEl);
    window.addEventListener("resize", measureGuides);
    window.addEventListener("scroll", measureGuides, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureGuides);
      window.removeEventListener("scroll", measureGuides, true);
    };
  }, [showMeasure, width, measureGuides]);

  const onClick = (e: React.MouseEvent) => {
    if (dragging.current) return;
    e.preventDefault();
    const next = SNAP_STEPS[step.current % SNAP_STEPS.length];
    step.current += 1;
    holdAt(next, e.clientX, e.clientY);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = false;
    startX.current = e.clientX;
    startW.current = mode === "loop" ? DEFAULT_PX : width;
    setPointer({ x: e.clientX, y: e.clientY });
    setMode("hold");
    clearResume();
    syncEdge(mode === "loop" ? DEFAULT_PX : width);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setPointer({ x: e.clientX, y: e.clientY });
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) dragging.current = true;
    if (!dragging.current) return;
    const next = clamp(startW.current + dx);
    setWidth(next);
    syncEdge(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setPointer({ x: e.clientX, y: e.clientY });
    scheduleResume();
    window.setTimeout(() => {
      dragging.current = false;
    }, 0);
  };

  const parent = parentRef.current ?? btnRef.current?.parentElement ?? null;

  const limitLines =
    faces && atEdge === "min"
      ? [faces.innerLeft, faces.innerRight]
      : faces && atEdge === "max"
        ? [faces.outerLeft, faces.outerRight]
        : null;

  return (
    <button
      ref={btnRef}
      type="button"
      aria-label="Ajustar espacio (estilo Figma)"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`figma-gap relative cursor-ew-resize p-0 outline-none ${
        mode === "loop"
          ? "figma-gap--loop border-0"
          : mode === "returning"
            ? "figma-gap--returning"
            : "figma-gap--hold"
      } ${className}`}
      style={
        mode !== "loop"
          ? {
              width,
              animation: "none",
            }
          : undefined
      }
    >
      {showMeasure && parent
        ? createPortal(
            <span className="figma-group-frame" aria-hidden>
              <span className="figma-group-handle figma-group-handle--tl" />
              <span className="figma-group-handle figma-group-handle--tr" />
              <span className="figma-group-handle figma-group-handle--bl" />
              <span className="figma-group-handle figma-group-handle--br" />
            </span>,
            parent,
          )
        : null}

      {mounted &&
      showMeasure &&
      guides &&
      createPortal(
        <>
          <span
            className="figma-align-guide-h"
            style={{
              top: guides.h.top,
              left: guides.h.left,
              width: guides.h.width,
            }}
            aria-hidden
          />
          <span
            className="figma-align-guide-v"
            style={{
              top: guides.v.top,
              left: guides.v.left,
              height: guides.v.height,
            }}
            aria-hidden
          />
        </>,
        document.body,
      )}

      {mounted &&
      showMeasure &&
      faces &&
      limitLines &&
      createPortal(
        <>
          {limitLines.map((x, i) => (
            <span
              key={`${atEdge}-${i}`}
              className="figma-constraint-fixed is-active"
              style={{
                left: x - 1,
                top: faces.top,
                height: faces.height,
              }}
              aria-hidden
            />
          ))}
        </>,
        document.body,
      )}

      {mounted &&
      showMeasure &&
      pointer &&
      createPortal(
        <span
          className="figma-gap-label figma-gap-label--cursor"
          style={{
            left: pointer.x - 10,
            top: pointer.y + 16,
          }}
          aria-hidden
        >
          {Math.round(width)}
        </span>,
        document.body,
      )}
    </button>
  );
}
