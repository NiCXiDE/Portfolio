"use client";

import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import { toSameOriginAssetPath } from "@/lib/brand-assets";
export { isSvgAsset, isVectorMaskPng } from "@/lib/brand-assets";

/** Monochrome SVG or white-on-dark PNG tinted with --brand-vector (ink → celeste in dark). */
export function BrandVectorMask({
  src,
  className = "",
  label,
  position = "center",
  luminance = false,
}: {
  src: string;
  className?: string;
  label?: string;
  /** CSS mask-position keyword or pair (e.g. "left center"). */
  position?: string;
  /** Use luminance mask for white-on-black PNG exports. */
  luminance?: boolean;
}) {
  // Same-origin path so mask-image is not blocked by R2 CORS.
  const maskSrc = toSameOriginAssetPath(src);

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block bg-brand-vector ${className}`}
      style={{
        maskImage: `url(${maskSrc})`,
        WebkitMaskImage: `url(${maskSrc})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: position,
        WebkitMaskPosition: position,
        ...(luminance
          ? {
              maskMode: "luminance",
              WebkitMaskMode: "luminance",
            }
          : {}),
      }}
    />
  );
}

/** Swap asset in dark when the SVG has multiple colors (e.g. hero-grafico). */
export function ThemeSwapImage({
  lightSrc,
  darkSrc,
  alt = "",
  fill,
  className,
  priority,
  sizes,
}: {
  lightSrc: string;
  darkSrc: string;
  alt?: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const { resolved } = useTheme();
  const src = resolved === "dark" ? darkSrc : lightSrc;
  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
