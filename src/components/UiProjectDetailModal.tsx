"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { t, type LocalizedString } from "@/lib/content";
import { renderMentionedText } from "@/components/MentionText";
import type { BrandRef } from "@/lib/brands";

export type UiProjectDetail = {
  id: string;
  title: LocalizedString;
  meta: LocalizedString;
  images: readonly string[];
  prototypeUrl: string | null;
  summary: LocalizedString | null;
  client: string | null;
  period: LocalizedString | null;
  duration: LocalizedString | null;
  ctaKind: "prototype" | "visitor" | "live" | null;
};

function resolveCtaKind(
  project: UiProjectDetail,
): "prototype" | "visitor" | "live" {
  if (project.ctaKind) return project.ctaKind;
  const url = project.prototypeUrl ?? "";
  if (url.includes("/admin")) return "visitor";
  return "prototype";
}

export function uiCtaLabel(
  project: UiProjectDetail,
  dict: Dictionary,
): string {
  const kind = resolveCtaKind(project);
  if (kind === "visitor") return dict.interfaces.viewAsVisitor;
  if (kind === "live") return dict.interfaces.viewLive;
  return dict.interfaces.prototype;
}

type Props = {
  project: UiProjectDetail | null;
  locale: Locale;
  dict: Dictionary;
  brands: BrandRef[];
  onClose: () => void;
};

export function UiProjectDetailModal({
  project,
  locale,
  dict,
  brands,
  onClose,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSlide(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const images = project.images;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (images.length < 2) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlide((i) => (i - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSlide((i) => (i + 1) % images.length);
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [project, onClose]);

  if (!mounted) return null;

  const href = project?.prototypeUrl ?? null;
  const images = project?.images ?? [];
  const current = images[slide] ?? images[0] ?? null;
  const summary = project?.summary ? t(project.summary, locale) : "";
  const period = project?.period ? t(project.period, locale) : "";
  const duration = project?.duration ? t(project.duration, locale) : "";
  const brandsById = Object.fromEntries(brands.map((b) => [b.id, b]));

  return createPortal(
    <AnimatePresence>
      {project ? (
        <motion.div
          key={project.id}
          role="dialog"
          aria-modal="true"
          aria-label={t(project.title, locale)}
          className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-5"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        >
          <button
            type="button"
            aria-label={dict.common.close}
            className="absolute inset-0 bg-[#1a1b2e]/82 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 flex max-h-[min(94dvh,960px)] w-full max-w-4xl flex-col overflow-hidden bg-sky-pale text-ink shadow-[0_12px_48px_rgba(0,0,0,0.4)] sm:rounded-sm"
            initial={
              reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label={dict.common.close}
              onClick={onClose}
              className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center bg-background/90 text-ink transition-opacity hover:opacity-80"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>

            {current ? (
              <div className="relative aspect-video w-full shrink-0 bg-ink/10">
                <Image
                  key={current}
                  src={current}
                  alt=""
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
                {images.length > 1 ? (
                  <>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`${i + 1} / ${images.length}`}
                          aria-current={i === slide}
                          className={`size-2 rounded-full transition-opacity ${
                            i === slide
                              ? "bg-ink opacity-100"
                              : "bg-ink/35 hover:opacity-80"
                          }`}
                          onClick={() => setSlide(i)}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label={dict.interfaces.carouselPrev}
                      className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center bg-ink/55 text-sky-pale transition-opacity hover:opacity-90"
                      onClick={() =>
                        setSlide(
                          (i) => (i - 1 + images.length) % images.length,
                        )
                      }
                    >
                      <ArrowLeft className="size-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      aria-label={dict.interfaces.carouselNext}
                      className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center bg-ink/55 text-sky-pale transition-opacity hover:opacity-90"
                      onClick={() =>
                        setSlide((i) => (i + 1) % images.length)
                      }
                    >
                      <ArrowRight className="size-4" strokeWidth={1.75} />
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/55">
                  {dict.interfaces.projectDetail}
                </p>
                <h2 className="mt-1 text-xl font-bold text-ink sm:text-2xl">
                  {t(project.title, locale)}
                </h2>
                <p className="mt-2 text-sm text-ink/75">
                  {renderMentionedText(t(project.meta, locale), brandsById)}
                </p>
              </div>

              {(project.client || period || duration) && (
                <dl className="grid gap-3 text-sm sm:grid-cols-3">
                  {project.client ? (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-ink/50">
                        {dict.interfaces.client}
                      </dt>
                      <dd className="mt-0.5 font-medium">{project.client}</dd>
                    </div>
                  ) : null}
                  {period ? (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-ink/50">
                        {dict.interfaces.period}
                      </dt>
                      <dd className="mt-0.5 font-medium">{period}</dd>
                    </div>
                  ) : null}
                  {duration ? (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-ink/50">
                        {dict.interfaces.duration}
                      </dt>
                      <dd className="mt-0.5 font-medium">{duration}</dd>
                    </div>
                  ) : null}
                </dl>
              )}

              {summary ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink/85">
                  {summary}
                </p>
              ) : (
                <p className="text-sm text-ink/50">
                  {dict.interfaces.detailEmpty}
                </p>
              )}

              {href ? (
                <a
                  href={href}
                  {...(href.startsWith("/")
                    ? {}
                    : { target: "_blank", rel: "noreferrer" })}
                  className="inline-flex bg-ink px-4 py-2.5 text-sm font-medium text-sky-pale transition-opacity hover:opacity-90"
                >
                  {uiCtaLabel(project, dict)}
                </a>
              ) : (
                <p
                  className="text-sm text-ink/45"
                  title={dict.interfaces.prototypeUnavailableHint}
                >
                  {dict.interfaces.prototypeUnavailable}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
