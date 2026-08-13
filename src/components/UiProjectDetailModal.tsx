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
import type { UiCategory } from "@/db/entities";
import {
  normalizeUiSlides,
  type UiSlide,
} from "@/lib/ui-slides";
import { isAllPortraitSlides } from "@/components/UiPortraitStrip";
import { MOTION_EASE } from "@/lib/motion";

export type UiProjectDetail = {
  id: string;
  title: LocalizedString;
  meta: LocalizedString;
  images: readonly (string | UiSlide)[];
  prototypeUrl: string | null;
  summary: LocalizedString | null;
  client: string | null;
  period: LocalizedString | null;
  duration: LocalizedString | null;
  ctaKind: "prototype" | "visitor" | "live" | null;
  category?: UiCategory;
  brandId?: string | null;
  relatedGraphics?: Array<{ href: string; label: string }>;
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

  const slides = normalizeUiSlides(project?.images ?? []);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (slides.length < 2) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlide((i) => (i - 1 + slides.length) % slides.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSlide((i) => (i + 1) % slides.length);
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [project, onClose, slides.length]);

  if (!mounted) return null;

  const href = project?.prototypeUrl ?? null;
  const current = slides[slide] ?? slides[0] ?? null;
  const isPortrait = current?.aspect === "portrait";
  const sideCarousel =
    project?.category === "apps-mobile" || isAllPortraitSlides(slides);
  const summary = project?.summary ? t(project.summary, locale) : "";
  const period = project?.period ? t(project.period, locale) : "";
  const duration = project?.duration ? t(project.duration, locale) : "";
  const brandsById = Object.fromEntries(brands.map((b) => [b.id, b]));

  const portraitFrameClass = sideCarousel
    ? "relative aspect-[9/16] h-[min(58dvh,30rem)] w-auto max-w-[min(92%,17rem)] overflow-hidden bg-[color-mix(in_srgb,var(--sky-pale)_82%,var(--ink)_18%)] sm:h-[min(72dvh,36rem)] sm:max-w-[min(100%,19rem)]"
    : "relative aspect-[9/16] h-[min(48dvh,26rem)] w-auto max-w-[min(100%,14rem)] overflow-hidden bg-[color-mix(in_srgb,var(--sky-pale)_82%,var(--ink)_18%)]";

  const mediaPanelClass =
    "bg-[color-mix(in_srgb,var(--sky-pale)_82%,var(--ink)_18%)]";

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
          transition={{ duration: 0.26, ease: MOTION_EASE }}
        >
          <button
            type="button"
            aria-label={dict.common.close}
            className="absolute inset-0 bg-[#1a1b2e]/82 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            className={`relative z-10 flex max-h-[min(94dvh,960px)] w-full overflow-hidden bg-sky-pale text-ink shadow-[0_12px_48px_rgba(0,0,0,0.4)] sm:rounded-sm ${
              sideCarousel
                ? "max-w-6xl flex-col sm:flex-row"
                : "max-w-4xl flex-col"
            }`}
            initial={
              reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.32, ease: MOTION_EASE }}
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
              <div
                className={
                  sideCarousel
                    ? `relative flex w-full shrink-0 items-center justify-center ${mediaPanelClass} px-3 py-4 sm:min-h-0 sm:w-[min(54%,26rem)] sm:flex-1 sm:px-4 sm:py-6`
                    : `relative w-full shrink-0 ${mediaPanelClass} ${
                        isPortrait
                          ? "flex min-h-[min(52dvh,28rem)] items-center justify-center py-4"
                          : "aspect-video"
                      }`
                }
              >
                <div
                  className={
                    isPortrait
                      ? portraitFrameClass
                      : "absolute inset-0"
                  }
                >
                  <Image
                    key={current.src}
                    src={current.src}
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes={
                      sideCarousel && isPortrait
                        ? "304px"
                        : isPortrait
                          ? "224px"
                          : "(max-width: 896px) 100vw, 896px"
                    }
                  />
                </div>
                {slides.length > 1 ? (
                  <>
                    <div
                      className={`absolute z-10 flex gap-1.5 ${
                        sideCarousel
                          ? "bottom-3 left-1/2 -translate-x-1/2"
                          : "bottom-3 left-1/2 -translate-x-1/2"
                      }`}
                    >
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`${i + 1} / ${slides.length}`}
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
                      className="absolute left-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/55 text-sky-pale transition-opacity hover:opacity-90"
                      onClick={() =>
                        setSlide(
                          (i) => (i - 1 + slides.length) % slides.length,
                        )
                      }
                    >
                      <ArrowLeft className="size-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      aria-label={dict.interfaces.carouselNext}
                      className="absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/55 text-sky-pale transition-opacity hover:opacity-90"
                      onClick={() =>
                        setSlide((i) => (i + 1) % slides.length)
                      }
                    >
                      <ArrowRight className="size-4" strokeWidth={1.75} />
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}

            <div
              className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 ${
                sideCarousel ? "sm:border-l sm:border-ink/10" : ""
              }`}
            >
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

              {project.relatedGraphics && project.relatedGraphics.length > 0 ? (
                <div className="space-y-2 border-t border-ink/10 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink/55">
                    {dict.grafico.alsoInProject}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {project.relatedGraphics.map((link) => (
                      <li key={link.href + link.label}>
                        <a
                          href={link.href}
                          className="text-sm underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
