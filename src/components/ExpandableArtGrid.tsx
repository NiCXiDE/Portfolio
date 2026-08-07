"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { BookOpen, Download, ExternalLink, Maximize2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Locale } from "@/i18n/config";
import { t, type LocalizedString } from "@/lib/content";
import { ImageLightbox } from "@/components/ImageLightbox";

export type ArtItem = {
  id: string;
  src: string;
  alt: string;
  title?: LocalizedString | string;
  year?: string;
  detail?: LocalizedString | string;
  href?: string | null;
  hrefLabel?: LocalizedString | string;
  downloadHref?: string | null;
  downloadLabel?: string;
  overlaySrc?: string;
  fit?: "cover" | "contain";
  frame?: "square" | "portrait" | "banner";
  previewKind?: "image" | "pdf";
  previewSrc?: string | null;
  enlargeLabel?: string;
  /** Imagen relacionada (tattoo IRL, banner impreso, etc.) */
  relatedSrc?: string | null;
  relatedLabel?: string;
  /** Tags libres: nsfw, pixel-art, vector, fan-art, grime, … */
  tags?: string[];
};

type Props = {
  items: ArtItem[];
  locale: Locale;
  cellClassName?: string;
  visitLabel?: string;
  containPadPercent?: number;
  closeLabel?: string;
  enlargeLabel?: string;
  tagLabels?: Record<string, string>;
  nsfwLabel?: string;
  nsfwRevealLabel?: string;
  nsfwHideLabel?: string;
  onTagClick?: (tag: string) => void;
};

function loc(
  value: LocalizedString | string | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return t(value, locale);
}

const ease = [0.32, 0.72, 0, 1] as const;
const layoutSpring = {
  type: "spring" as const,
  stiffness: 340,
  damping: 34,
  mass: 0.9,
};

export function ExpandableArtGrid({
  items,
  locale,
  cellClassName = "bg-white",
  visitLabel = "Visitar",
  containPadPercent = 6,
  closeLabel = "Cerrar",
  enlargeLabel = "Ver en tamaño completo",
  tagLabels = {},
  nsfwLabel = "NSFW",
  nsfwRevealLabel = "Ver a discreción",
  nsfwHideLabel = "Ocultar",
  onTagClick,
}: Props) {
  const reduceMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingOpenId = useRef<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [revealedNsfw, setRevealedNsfw] = useState<Set<string>>(
    () => new Set(),
  );
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
    kind: "image" | "pdf";
  } | null>(null);

  const close = useCallback(() => {
    pendingOpenId.current = null;
    setOpenId(null);
    setCollapsedIds(new Set());
  }, []);

  const measureAndOpen = useCallback((id: string) => {
    const grid = gridRef.current;
    if (!grid) {
      setOpenId(id);
      setCollapsedIds(new Set());
      return;
    }
    const cells = Array.from(
      grid.querySelectorAll<HTMLElement>("[data-art-id]"),
    ).filter((el) => !el.classList.contains("hidden"));

    const openEl = cells.find((c) => c.dataset.artId === id);
    if (!openEl) {
      setOpenId(id);
      setCollapsedIds(new Set());
      return;
    }

    const openTop = openEl.getBoundingClientRect().top;
    const openLeft = openEl.getBoundingClientRect().left;
    const before = new Set<string>();

    for (const cell of cells) {
      const cellId = cell.dataset.artId;
      if (!cellId || cellId === id) continue;
      const rect = cell.getBoundingClientRect();
      const sameRow = Math.abs(rect.top - openTop) < 12;
      if (sameRow && rect.left < openLeft - 2) {
        before.add(cellId);
      }
    }

    setCollapsedIds(before);
    setOpenId(id);

    requestAnimationFrame(() => {
      openEl.scrollIntoView({
        block: "nearest",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [reduceMotion]);

  const openItem = useCallback(
    (id: string) => {
      // Si ya hay uno abierto, cerrar primero y medir sobre grilla limpia
      // (si no, quedan huecos/espacio vacío al saltar de ítem).
      if (openId && openId !== id) {
        pendingOpenId.current = id;
        setOpenId(null);
        setCollapsedIds(new Set());
        return;
      }
      measureAndOpen(id);
    },
    [openId, measureAndOpen],
  );

  useLayoutEffect(() => {
    if (openId !== null) return;
    const pending = pendingOpenId.current;
    if (!pending) return;
    pendingOpenId.current = null;
    const frame = requestAnimationFrame(() => measureAndOpen(pending));
    return () => cancelAnimationFrame(frame);
  }, [openId, measureAndOpen]);

  useEffect(() => {
    if (!openId || lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, close, lightbox]);

  useEffect(() => {
    const onResize = () => {
      if (openId) close();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [openId, close]);

  const inset = `${containPadPercent}%`;
  const canLayout = !reduceMotion;

  return (
    <>
      <div
        ref={gridRef}
        className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item) => {
            const isOpen = openId === item.id;
            const isCollapsed = collapsedIds.has(item.id);
            const title = loc(item.title, locale) || item.alt;
            const detail = loc(item.detail, locale);
            const hrefLabel = loc(item.hrefLabel, locale) || visitLabel;
            const fit = item.fit ?? "cover";
            const frame = item.frame ?? "square";
            const previewKind = item.previewKind ?? "image";
            const previewSrc =
              item.previewSrc ??
              (previewKind === "pdf" ? item.downloadHref : item.src);
            const itemEnlarge = item.enlargeLabel ?? enlargeLabel;
            const tags = item.tags ?? [];
            const isNsfw = tags.includes("nsfw");
            const nsfwLocked = isNsfw && !revealedNsfw.has(item.id);

            if (isCollapsed) {
              return (
                <motion.div
                  key={item.id}
                  data-art-id={item.id}
                  className="hidden"
                  aria-hidden
                  layout={canLayout}
                  initial={false}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, scale: 0.92 }
                  }
                  transition={{ layout: layoutSpring, duration: 0.28 }}
                />
              );
            }

            return (
              <motion.div
                key={item.id}
                data-art-id={item.id}
                layout={canLayout}
                initial={false}
                animate={{ opacity: 1 }}
                exit={
                  reduceMotion ? undefined : { opacity: 0, scale: 0.96 }
                }
                transition={{
                  layout: layoutSpring,
                  opacity: { duration: 0.25 },
                }}
                className={isOpen ? "col-span-full" : undefined}
              >
                <motion.div
                  layout={canLayout}
                  initial={false}
                  animate={{
                    backgroundColor: isOpen
                      ? "var(--sky-pale)"
                      : "rgba(0,0,0,0)",
                  }}
                  transition={{
                    layout: layoutSpring,
                    backgroundColor: { duration: 0.35, ease },
                  }}
                  className={`flex w-full overflow-hidden text-left outline-none ${
                    isOpen
                      ? "flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-5 sm:p-4"
                      : ""
                  }`}
                >
                  <motion.button
                    type="button"
                    layout={canLayout}
                    onClick={() => {
                      if (nsfwLocked) {
                        setRevealedNsfw((prev) => new Set(prev).add(item.id));
                        return;
                      }
                      if (isOpen) close();
                      else openItem(item.id);
                    }}
                    aria-expanded={isOpen}
                    whileHover={
                      reduceMotion || isOpen || nsfwLocked
                        ? undefined
                        : { scale: 1.03 }
                    }
                    whileTap={
                      reduceMotion || nsfwLocked ? undefined : { scale: 0.98 }
                    }
                    transition={{ layout: layoutSpring }}
                    className={`group relative shrink-0 overflow-hidden focus-visible:ring-2 focus-visible:ring-ink/40 ${cellClassName} ${
                      isOpen
                        ? frame === "banner"
                          ? "aspect-[1/2] w-full max-w-[11rem] sm:w-[10rem] md:w-[11rem]"
                          : frame === "portrait"
                            ? "aspect-[3/4] w-full max-w-[14rem] sm:w-[13rem] md:w-[14rem]"
                            : "aspect-square w-full max-w-[16rem] sm:w-[14rem] md:w-[15rem]"
                        : frame === "banner"
                          ? "aspect-[1/2] w-full"
                          : frame === "portrait"
                            ? "aspect-[3/4] w-full"
                            : "aspect-square w-full"
                    }`}
                  >
                    <div
                      className="absolute"
                      style={
                        fit === "contain"
                          ? {
                              top: inset,
                              right: inset,
                              bottom: inset,
                              left: inset,
                            }
                          : { inset: 0 }
                      }
                    >
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        unoptimized={/\.svg($|\?)/i.test(item.src)}
                        className={`${
                          fit === "contain" ||
                          (isOpen &&
                            (frame === "portrait" || frame === "banner"))
                            ? "object-contain object-center"
                            : "object-cover object-top"
                        } ${
                          nsfwLocked
                            ? "scale-110 blur-2xl"
                            : !isOpen && fit === "cover"
                              ? "transition-transform duration-500 group-hover:scale-[1.04]"
                              : ""
                        }`}
                        sizes={
                          isOpen
                            ? "280px"
                            : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        }
                      />
                    </div>
                    {item.overlaySrc && !nsfwLocked && (
                      <div
                        className="pointer-events-none absolute overflow-hidden rounded-full"
                        style={{
                          top: `calc(${inset} + 8%)`,
                          right: `calc(${inset} + 8%)`,
                          bottom: `calc(${inset} + 8%)`,
                          left: `calc(${inset} + 8%)`,
                        }}
                      >
                        <Image
                          src={item.overlaySrc}
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    {nsfwLocked && (
                      <span className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-ink/35 px-3 text-center">
                        <span className="rounded-full bg-sky-pale px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide text-ink md:text-xs">
                          {nsfwLabel}
                        </span>
                        <span className="text-[0.7rem] font-medium text-sky-pale md:text-xs">
                          {nsfwRevealLabel}
                        </span>
                      </span>
                    )}
                    {!nsfwLocked && isNsfw && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRevealedNsfw((prev) => {
                            const next = new Set(prev);
                            next.delete(item.id);
                            return next;
                          });
                          if (isOpen) close();
                        }}
                        className="absolute left-2 top-2 z-10 rounded-full bg-ink/85 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-sky-pale transition-opacity hover:opacity-80"
                        aria-label={nsfwHideLabel}
                      >
                        {nsfwLabel} · {nsfwHideLabel}
                      </button>
                    )}
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="detail"
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, x: 24, filter: "blur(4px)" }
                        }
                        animate={{
                          opacity: 1,
                          x: 0,
                          filter: "blur(0px)",
                        }}
                        exit={
                          reduceMotion
                            ? undefined
                            : { opacity: 0, x: 12, filter: "blur(2px)" }
                        }
                        transition={{
                          duration: reduceMotion ? 0 : 0.4,
                          ease,
                          delay: reduceMotion ? 0 : 0.08,
                        }}
                        className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5"
                      >
                        <p className="text-sm font-bold text-ink md:text-base">
                          {title}
                        </p>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTagClick?.(tag);
                                }}
                                className={`rounded-full px-2 py-0.5 text-[0.7rem] font-medium transition-opacity hover:opacity-70 md:text-xs ${
                                  tag === "nsfw"
                                    ? "bg-ink text-sky-pale"
                                    : "bg-ink/10 text-ink"
                                }`}
                              >
                                {tagLabels[tag] ?? tag}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.year && (
                          <p className="text-sm text-ink/70 md:text-base">
                            {item.year}
                          </p>
                        )}
                        {detail && (
                          <p className="text-sm leading-relaxed text-ink/85 md:text-base">
                            {detail}
                          </p>
                        )}
                        {item.relatedSrc && !nsfwLocked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightbox({
                                src: item.relatedSrc!,
                                alt: item.relatedLabel || item.alt,
                                kind: "image",
                              });
                            }}
                            className="relative mt-1 aspect-[4/3] w-full max-w-[16rem] overflow-hidden bg-sky-pale text-left"
                          >
                            <Image
                              src={item.relatedSrc}
                              alt={item.relatedLabel || item.alt}
                              fill
                              className="object-cover object-top"
                              sizes="280px"
                            />
                            {item.relatedLabel && (
                              <span className="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[0.65rem] font-medium text-sky-pale">
                                {item.relatedLabel}
                              </span>
                            )}
                          </button>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          {previewSrc && !nsfwLocked && (
                            previewKind === "pdf" ? (
                              <a
                                href={previewSrc}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:opacity-70 md:text-base"
                              >
                                <BookOpen
                                  className="size-3.5 shrink-0"
                                  strokeWidth={1.75}
                                />
                                {itemEnlarge}
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightbox({
                                    src: previewSrc,
                                    alt: item.alt,
                                    kind: "image",
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:opacity-70 md:text-base"
                              >
                                <Maximize2
                                  className="size-3.5 shrink-0"
                                  strokeWidth={1.75}
                                />
                                {itemEnlarge}
                              </button>
                            )
                          )}
                          {item.href && (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:opacity-70 md:text-base"
                            >
                              <ExternalLink
                                className="size-3.5 shrink-0"
                                strokeWidth={1.75}
                              />
                              {hrefLabel}
                            </a>
                          )}
                          {item.downloadHref && (
                            <a
                              href={item.downloadHref}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:opacity-70 md:text-base"
                            >
                              <Download
                                className="size-3.5 shrink-0"
                                strokeWidth={1.75}
                              />
                              {item.downloadLabel || "Descargar"}
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <ImageLightbox
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? ""}
        kind={lightbox?.kind ?? "image"}
        onClose={() => setLightbox(null)}
        closeLabel={closeLabel}
      />
    </>
  );
}

export function artTitle(
  title: LocalizedString | string | undefined,
  fallback: string,
  locale: Locale,
): string {
  return loc(title, locale) || fallback;
}
