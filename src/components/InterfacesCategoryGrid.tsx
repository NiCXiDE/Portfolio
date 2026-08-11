"use client";

import { useState } from "react";
import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { t, type UiProjectContent } from "@/lib/content";
import { MentionedText } from "@/components/MentionText";
import type { BrandRef } from "@/lib/brands";
import {
  UiProjectDetailModal,
  uiCtaLabel,
} from "@/components/UiProjectDetailModal";

export function InterfacesCategoryGrid({
  locale,
  dict,
  projects,
  brands,
}: {
  locale: Locale;
  dict: Dictionary;
  projects: UiProjectContent[];
  brands: BrandRef[];
}) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = projects.find((p) => p.id === detailId) ?? null;

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="flex flex-col gap-2.5">
            <h2 className="text-sm font-bold text-ink sm:text-base">
              {t(project.title, locale)}
            </h2>
            {project.images[0] ? (
              <button
                type="button"
                aria-label={dict.interfaces.openDetail}
                onClick={() => setDetailId(project.id)}
                className="relative aspect-[644/362] w-full cursor-zoom-in overflow-hidden bg-sky-pale text-left"
              >
                <Image
                  src={project.images[0]}
                  alt={t(project.title, locale)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </button>
            ) : null}
            <p className="text-sm text-ink">
              <MentionedText text={t(project.meta, locale)} brands={brands} />
            </p>
            {project.prototypeUrl ? (
              <a
                href={project.prototypeUrl}
                {...(project.prototypeUrl.startsWith("/")
                  ? {}
                  : { target: "_blank", rel: "noreferrer" })}
                className="text-sm underline underline-offset-2"
              >
                {uiCtaLabel(project, dict)}
              </a>
            ) : null}
          </article>
        ))}
      </div>
      <UiProjectDetailModal
        project={detail}
        locale={locale}
        dict={dict}
        brands={brands}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}
