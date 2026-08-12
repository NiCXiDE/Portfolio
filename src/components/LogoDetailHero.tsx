"use client";

import Image from "next/image";
import { BrandVectorMask } from "@/components/BrandVector";
import { isSvgAsset, isVectorMaskPng } from "@/lib/brand-assets";

type Props = {
  src: string;
  alt: string;
  tags?: string[];
};

export function LogoDetailHero({ src, alt, tags = [] }: Props) {
  const useVectorMask =
    isSvgAsset(src) || (tags.includes("vector") && isVectorMaskPng(src));
  const vectorLuminance =
    useVectorMask && !isSvgAsset(src) && isVectorMaskPng(src);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden bg-sky-pale lg:mx-0 lg:max-w-none">
      {useVectorMask ? (
        <BrandVectorMask
          src={src}
          label={alt}
          luminance={vectorLuminance}
          className="absolute inset-[5%]"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized={src.startsWith("/assets")}
          className="object-contain object-center p-[5%]"
          sizes="(max-width: 1024px) 80vw, 256px"
        />
      )}
    </div>
  );
}
