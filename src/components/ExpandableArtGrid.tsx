"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, ExternalLink, Maximize2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Locale } from "@/i18n/config";
import { t, type LocalizedString } from "@/lib/content";
import { ImageLightbox } from "@/components/ImageLightbox";
import {
  BrandVectorMask,
  isSvgAsset,
  isVectorMaskPng,
} from "@/components/BrandVector";
import { MOTION_EASE } from "@/lib/motion";

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
  /** Extra pieces shown when expanded (grid still uses `src`). */
  gallery?: string[];
  /** Tags libres: nsfw, pixel-art, vector, fan-art, grime, … */
  tags?: string[];
  /** Hub de marca (empresa / proyecto) cuando hay piezas vinculadas. */
  brandHubHref?: string | null;
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
  /** Tag slugs that trigger NSFW blur (defaults include "nsfw") */
  nsfwSlugs?: string[];
  onTagClick?: (tag: string) => void;
  /** If set, appends a “ver más” tile after the preview items */
  seeMoreHref?: string;
  seeMoreLabel?: string;
  /** If it returns a href, the tile navigates instead of expanding. */
  itemHref?: (item: ArtItem) => string | null | undefined;
  /** Dedicated detail page — shown as CTA in the expand panel (tile still expands). */
  detailHref?: (item: ArtItem) => string | null | undefined;
  /** Template with `{name}` for the detail CTA, e.g. "Ver más sobre {name}". */
  moreAboutLabel?: string;
  /** Template with `{name}` for brand hub CTA. */
  brandHubLabel?: string;
};

function loc(
  value: LocalizedString | string | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return t(value, locale);
}

function ArtTileFrame({
  href,
  label,
  className,
  children,
  onClick,
  ariaExpanded,
  canLayout,
  reduceMotion,
  isOpen,
  nsfwLocked,
}: {
  href?: string | null;
  label: string;
  className: string;
  children: ReactNode;
  onClick: () => void;
  ariaExpanded: boolean;
  canLayout: boolean;
  reduceMotion: boolean | null;
  isOpen: boolean;
  nsfwLocked: boolean;
}) {
  if (href) {
    return (
      <Link href={href} aria-label={label} className={`${className} cursor-nav`}>
        {children}
      </Link>
    );
  }
  return (
    <motion.button
      type="button"
      layout={canLayout}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-label={label}
      whileHover={
        reduceMotion || isOpen || nsfwLocked ? undefined : { scale: 1.03 }
      }
      whileTap={reduceMotion || nsfwLocked ? undefined : { scale: 0.98 }}
      transition={{ layout: layoutSpring }}
      className={`${className} ${nsfwLocked ? "cursor-blocked" : "cursor-expand interactive-media"}`}
    >
      {children}
    </motion.button>
  );
}

function resolveGallery(item: ArtItem): string[] {
  const extra = item.gallery?.filter(Boolean) ?? [];
  if (!extra.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const src of [item.src, ...extra]) {
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

const ease = MOTION_EASE;
const layoutSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
  mass: 0.85,
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
  nsfwSlugs = ["nsfw"],
  onTagClick,
  seeMoreHref,
  seeMoreLabel = "Ver más",
  itemHref,
  detailHref,
  moreAboutLabel,
  brandHubLabel,
}: Props) {
  const reduceMotion = useReducedMotion();
  const nsfwSet = useMemo(
    () => new Set([...nsfwSlugs, "nsfw"]),
    [nsfwSlugs],
  );
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
  const [galleryIndex, setGalleryIndex] = useState(0);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPressTimer = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    setGalleryIndex(0);
  }, [openId]);

  useEffect(() => () => clearPressTimer(), [clearPressTimer]);

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
        className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5"
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
            const galleryImgs = resolveGallery(item);
            const displaySrc =
              isOpen && galleryImgs.length
                ? galleryImgs[
                    Math.min(galleryIndex, galleryImgs.length - 1)
                  ]
                : item.src;
            const previewSrc =
              item.previewSrc ??
              (previewKind === "pdf" ? item.downloadHref : displaySrc);
            const itemEnlarge = item.enlargeLabel ?? enlargeLabel;
            const tags = item.tags ?? [];
            const isNsfw = tags.some((tag) => nsfwSet.has(tag));
            const nsfwLocked = isNsfw && !revealedNsfw.has(item.id);
            // Gallery screens/photos must not inherit logo vector recolor.
            const isGalleryResource =
              Boolean(item.gallery?.length) &&
              displaySrc !== item.src;
            const useVectorMask =
              !isGalleryResource &&
              (isSvgAsset(displaySrc) ||
                (tags.includes("vector") && isVectorMaskPng(displaySrc)));
            const vectorLuminance =
              useVectorMask &&
              !isSvgAsset(displaySrc) &&
              isVectorMaskPng(displaySrc);
            const navHref = !nsfwLocked ? itemHref?.(item) ?? null : null;
            const itemDetailHref = !nsfwLocked
              ? detailHref?.(item) ?? null
              : null;
            const moreAbout =
              moreAboutLabel && title
                ? moreAboutLabel.replace(/\{name\}/g, title)
                : null;
            const brandHub =
              brandHubLabel && title && item.brandHubHref
                ? brandHubLabel.replace(/\{name\}/g, title)
                : item.brandHubHref
                  ? title
                  : null;
            const tileClassName = `group relative shrink-0 overflow-hidden surface-glow focus-visible:ring-2 focus-visible:ring-ink/40 ${cellClassName} ${
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
            }`;

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
                  className={`relative flex w-full overflow-hidden text-left outline-none ${
                    isOpen
                      ? "flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-5 sm:p-4"
                      : ""
                  }`}
                >
                  {isOpen ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        close();
                      }}
                      className="absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-full bg-ink/85 text-sky-pale transition-opacity hover:opacity-80"
                      aria-label={closeLabel}
                    >
                      <X className="size-4" strokeWidth={2.25} aria-hidden />
                    </button>
                  ) : null}
                  <ArtTileFrame
                    href={navHref}
                    label={title}
                    className={tileClassName}
                    canLayout={canLayout}
                    reduceMotion={reduceMotion}
                    isOpen={isOpen}
                    nsfwLocked={nsfwLocked}
                    ariaExpanded={isOpen}
                    onClick={() => {
                      if (nsfwLocked) {
                        setRevealedNsfw((prev) => new Set(prev).add(item.id));
                        return;
                      }
                      if (isOpen) close();
                      else openItem(item.id);
                    }}
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
                      {useVectorMask ? (
                        <BrandVectorMask
                          src={displaySrc}
                          label={item.alt}
                          luminance={vectorLuminance}
                          className={`absolute inset-0 size-full ${
                            nsfwLocked
                              ? "scale-110 blur-2xl"
                              : !isOpen && fit === "cover"
                                ? "transition-transform duration-500 group-hover:scale-[1.04]"
                                : ""
                          }`}
                        />
                      ) : (
                        <Image
                          src={displaySrc}
                          alt={item.alt}
                          fill
                          unoptimized={
                            displaySrc.startsWith("/assets") ||
                            isSvgAsset(displaySrc)
                          }
                          loading="eager"
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
                      )}
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
                  </ArtTileFrame>

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
                                  tag === "nsfw" || nsfwSet.has(tag)
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
                        {galleryImgs.length > 1 && !nsfwLocked && (
                          <div className="mt-1 flex flex-col gap-1.5">
                            <p className="text-xs font-medium uppercase tracking-wide text-ink/60">
                              {locale === "en" ? "Resources" : "Recursos"}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                            {galleryImgs.map((src, i) => {
                              const selected =
                                i ===
                                Math.min(
                                  galleryIndex,
                                  galleryImgs.length - 1,
                                );
                              const openThumbLightbox = () => {
                                setGalleryIndex(i);
                                setLightbox({
                                  src,
                                  alt: item.alt,
                                  kind: "image",
                                });
                              };
                              return (
                              <button
                                key={src}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGalleryIndex(i);
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  openThumbLightbox();
                                }}
                                onPointerDown={(e) => {
                                  if (e.button !== 0) return;
                                  clearPressTimer();
                                  pressTimer.current = setTimeout(() => {
                                    pressTimer.current = null;
                                    openThumbLightbox();
                                  }, 450);
                                }}
                                onPointerUp={clearPressTimer}
                                onPointerLeave={clearPressTimer}
                                onPointerCancel={clearPressTimer}
                                aria-label={`${title} ${i + 1}`}
                                aria-pressed={selected}
                                className={`relative size-14 shrink-0 overflow-hidden bg-sky-pale ${
                                  selected
                                    ? "outline outline-2 outline-ink"
                                    : ""
                                }`}
                              >
                                <Image
                                  src={src}
                                  alt=""
                                  fill
                                  unoptimized={src.startsWith("/assets")}
                                  className="object-contain object-center"
                                  sizes="56px"
                                  draggable={false}
                                />
                              </button>
                              );
                            })}
                            </div>
                          </div>
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
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 interactive-ink md:text-base"
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
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 interactive-ink md:text-base"
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
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 interactive-ink md:text-base"
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
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 interactive-ink md:text-base"
                            >
                              <Download
                                className="size-3.5 shrink-0"
                                strokeWidth={1.75}
                              />
                              {item.downloadLabel || "Descargar"}
                            </a>
                          )}
                          {itemDetailHref && moreAbout ? (
                            <Link
                              href={itemDetailHref}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 interactive-ink md:text-base cursor-nav"
                            >
                              {moreAbout}
                              <ArrowRight
                                className="size-3.5 shrink-0"
                                strokeWidth={1.75}
                              />
                            </Link>
                          ) : null}
                          {item.brandHubHref && brandHub ? (
                            <Link
                              href={item.brandHubHref}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-ink/30 underline-offset-4 interactive-ink md:text-base cursor-nav"
                            >
                              {brandHub}
                              <ArrowRight
                                className="size-3.5 shrink-0"
                                strokeWidth={1.75}
                              />
                            </Link>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {seeMoreHref && !openId ? (
          <Link
            href={seeMoreHref}
            className="group relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden bg-sky-pale shadow-none drop-shadow-none transition-[filter] hover:saturate-125 focus-visible:ring-2 focus-visible:ring-ink/40 cursor-nav interactive-ink"
          >
            <ArrowRight
              className="size-12 text-ink sm:size-14 md:size-16"
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="text-sm font-medium lowercase text-ink underline underline-offset-4 md:text-base">
              {seeMoreLabel}
            </span>
          </Link>
        ) : null}
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
