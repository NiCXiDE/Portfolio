"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Props = {
  cvEs: string;
  cvEn: string;
  /** Label on the trigger button (follows site locale). */
  label: string;
  closeLabel?: string;
};

/**
 * Modal with fixed bilingual CTAs so Google Translate (or similar) cannot
 * hide the language the visitor actually wants for the PDF.
 */
export function CvDownloadButton({
  cvEs,
  cvEn,
  label,
  closeLabel = "Cerrar",
}: Props) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const hasEs = Boolean(cvEs);
  const hasEn = Boolean(cvEn);
  const both = hasEs && hasEn;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  if (!hasEs && !hasEn) return null;

  if (!both) {
    const href = hasEs ? cvEs : cvEn;
    return (
      <a
        href={href}
        download
        target="_blank"
        rel="noreferrer"
        className="bio-cv"
      >
        <Download className="size-4 shrink-0" strokeWidth={1.75} />
        {label}
      </a>
    );
  }

  return (
    <>
      <button type="button" className="bio-cv" onClick={() => setOpen(true)}>
        <Download className="size-4 shrink-0" strokeWidth={1.75} />
        {label}
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="cv-download"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                >
                  <button
                    type="button"
                    aria-label={closeLabel}
                    className="absolute inset-0 bg-[#1a1b2e]/75 backdrop-blur-[2px]"
                    onClick={() => setOpen(false)}
                  />

                  <motion.div
                    className="relative z-10 w-full max-w-md border border-ink/10 bg-sky-pale p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:p-6"
                    initial={
                      reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 4 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      aria-label={closeLabel}
                      onClick={() => setOpen(false)}
                      className="absolute right-3 top-3 flex size-8 items-center justify-center text-ink/70 transition-opacity hover:opacity-80"
                    >
                      <X className="size-5" strokeWidth={1.75} />
                    </button>

                    <h2
                      id={titleId}
                      className="pr-8 text-base font-bold leading-snug text-ink sm:text-lg"
                    >
                      Elegí el idioma del archivo
                      <span className="mt-1 block text-sm font-medium text-ink/65">
                        Choose the file language
                      </span>
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">
                      Así podés bajar el CV aunque el traductor automático haya
                      cambiado el idioma de la página.
                      <span className="mt-1 block text-ink/55">
                        So you can download the résumé even if an automatic
                        translator changed the page language.
                      </span>
                    </p>

                    <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                      <a
                        href={cvEs}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 bg-ink px-3 py-2.5 text-sm font-medium text-sky-pale transition-opacity hover:opacity-90"
                        onClick={() => setOpen(false)}
                      >
                        <Download className="size-4 shrink-0" strokeWidth={1.75} />
                        Descargar CV
                      </a>
                      <a
                        href={cvEn}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 border border-ink/25 bg-white px-3 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90"
                        onClick={() => setOpen(false)}
                      >
                        <Download className="size-4 shrink-0" strokeWidth={1.75} />
                        Download résumé
                      </a>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
