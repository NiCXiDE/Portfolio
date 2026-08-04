"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MIN_PX = 10;
/** Was 52; +100% → 104 */
const MAX_PX = 104;
const DEFAULT_PX = 24;
const SNAP_STEPS = [14, 28, 48, 72, 96];

type Mode = "loop" | "hold" | "returning";

type Props = {
  className?: string;
};

export function FigmaGap({ className = "" }: Props) {
  const [mode, setMode] = useState<Mode>("loop");
  const [width, setWidth] = useState(DEFAULT_PX);
  const [atEdge, setAtEdge] = useState<"min" | "max" | null>(null);
  const step = useRef(1);
  const resumeTimer = useRef<number | null>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(DEFAULT_PX);
  const btnRef = useRef<HTMLButtonElement>(null);

  const clearResume = () => {
    if (resumeTimer.current) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  };

  const clamp = (w: number) => {
    const next = Math.min(MAX_PX, Math.max(MIN_PX, w));
    if (next <= MIN_PX + 0.5) setAtEdge("min");
    else if (next >= MAX_PX - 0.5) setAtEdge("max");
    else setAtEdge(null);
    return next;
  };

  const scheduleResume = useCallback(() => {
    clearResume();
    resumeTimer.current = window.setTimeout(() => {
      setAtEdge(null);
      // Primero activar transition; en el frame siguiente cambiar width
      // para que el ease-in-out no se saltee.
      setMode("returning");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWidth(DEFAULT_PX);
        });
      });
    }, 2000);
  }, []);

  const holdAt = (w: number) => {
    setMode("hold");
    setWidth(clamp(w));
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
    // Fallback if transitionend doesn't fire
    const t = window.setTimeout(() => setMode("loop"), 700);
    return () => {
      el.removeEventListener("transitionend", onEnd);
      window.clearTimeout(t);
    };
  }, [mode]);

  const onClick = (e: React.MouseEvent) => {
    if (dragging.current) return;
    e.preventDefault();
    const next = SNAP_STEPS[step.current % SNAP_STEPS.length];
    step.current += 1;
    holdAt(next);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = false;
    startX.current = e.clientX;
    startW.current = mode === "loop" ? DEFAULT_PX : width;
    setMode("hold");
    clearResume();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 3) dragging.current = true;
    if (!dragging.current) return;
    setWidth(clamp(startW.current + dx));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    scheduleResume();
    window.setTimeout(() => {
      dragging.current = false;
    }, 0);
  };

  const showMeasure = mode === "hold" || mode === "returning";

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
      className={`figma-gap relative cursor-ew-resize border-0 p-0 outline-none ${
        mode === "loop"
          ? "figma-gap--loop"
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
      {showMeasure && (
        <>
          <span className="figma-gap-label" aria-hidden>
            {Math.round(width)}
          </span>
          <span
            className={`figma-constraint figma-constraint--left ${
              atEdge === "min" ? "is-active" : ""
            }`}
            aria-hidden
          />
          <span
            className={`figma-constraint figma-constraint--right ${
              atEdge === "max" ? "is-active" : ""
            }`}
            aria-hidden
          />
        </>
      )}
    </button>
  );
}
