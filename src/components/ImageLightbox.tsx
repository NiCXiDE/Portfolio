"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Props = {
  src: string | null;
  alt: string;
  onClose: () => void;
  closeLabel?: string;
  kind?: "image" | "pdf";
};

export function ImageLightbox({
  src,
  alt,
  onClose,
  closeLabel = "Cerrar",
  kind = "image",
}: Props) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPdfReady(false);
  }, [src, kind]);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [src, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
          <button
            type="button"
            aria-label={closeLabel}
            className="absolute inset-0 bg-[#1a1b2e]/82 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            className={`relative z-10 flex items-center justify-center ${
              kind === "pdf"
                ? "h-[min(94dvh,960px)] w-[min(96vw,1040px)]"
                : "max-h-[min(94dvh,980px)] max-w-[min(96vw,1200px)]"
            }`}
            initial={
              reduceMotion ? false : { opacity: 0, scale: 0.96, y: 10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className="absolute -right-1 -top-1 z-20 flex size-9 items-center justify-center rounded-full bg-sky-pale text-ink shadow-md transition-opacity hover:opacity-80 sm:-right-3 sm:-top-3"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>

            {kind === "pdf" ? (
              <div className="relative h-full w-full overflow-hidden rounded-sm bg-white shadow-[0_12px_48px_rgba(0,0,0,0.45)]">
                {!pdfReady && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white text-sm text-ink/60">
                    Cargando manual…
                  </div>
                )}
                <iframe
                  src={`${src}#view=FitH`}
                  title={alt}
                  className="h-full w-full border-0"
                  onLoad={() => setPdfReady(true)}
                />
              </div>
            ) : (
              // Native img keeps PNG/SVG/portrait aspect without Next Image constraints
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                className="max-h-[min(94dvh,980px)] max-w-[min(96vw,1200px)] object-contain"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
