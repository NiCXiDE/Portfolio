"use client";

import { ExternalLink } from "lucide-react";
import type { Locale } from "@/i18n/config";
import {
  draftBool,
  draftLoc,
  draftStr,
  mediaSrc,
  type Draft,
} from "@/components/admin/draft";

function PreviewImg({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-sky-pale text-xs text-ink/40 ${className}`}
      >
        Sin imagen
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).style.opacity = "0.25";
      }}
    />
  );
}

export function GraphicItemPreview({
  draft,
  locale,
}: {
  draft: Draft;
  locale: Locale;
}) {
  const src = mediaSrc(draftStr(draft, "srcPath"));
  const related = mediaSrc(draftStr(draft, "relatedSrcPath"));
  const title =
    draftLoc(draft, "titleEs", "titleEn", locale) ||
    draftStr(draft, "alt") ||
    "Sin título";
  const detail = draftLoc(draft, "detailEs", "detailEn", locale);
  const hrefLabel =
    draftLoc(draft, "hrefLabelEs", "hrefLabelEn", locale) || "Visitar";
  const href = draftStr(draft, "href");
  const year = draftStr(draft, "year");
  const fit = draftStr(draft, "fit") || "cover";
  const tags = draftStr(draft, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const published = draftBool(draft, "published");

  return (
    <div className="space-y-2">
      {!published ? (
        <p className="text-[0.65rem] font-medium uppercase text-amber-700">
          Oculto / no publicado
        </p>
      ) : null}
      <div className="flex flex-col gap-3 bg-white p-2 sm:flex-row">
        <div className="relative aspect-square w-full max-w-[11rem] shrink-0 overflow-hidden bg-sky-pale">
          <PreviewImg
            src={src}
            alt={draftStr(draft, "alt") || title}
            className={`size-full ${fit === "contain" ? "object-contain" : "object-cover object-top"}`}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <p className="text-sm font-bold text-ink">{title}</p>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${
                    tag === "nsfw"
                      ? "bg-ink text-sky-pale"
                      : "bg-ink/10 text-ink"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          {year ? <p className="text-xs text-ink/70">{year}</p> : null}
          {detail ? (
            <p className="text-xs leading-relaxed text-ink/85">{detail}</p>
          ) : null}
          {related ? (
            <div className="relative mt-1 aspect-[4/3] w-full max-w-[10rem] overflow-hidden bg-sky-pale">
              <PreviewImg
                src={related}
                alt="related"
                className="size-full object-cover object-top"
              />
            </div>
          ) : null}
          {href ? (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-ink underline underline-offset-2">
              <ExternalLink className="size-3" strokeWidth={1.75} />
              {hrefLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TestimonialPreview({
  draft,
  locale,
}: {
  draft: Draft;
  locale: Locale;
}) {
  const image = mediaSrc(draftStr(draft, "imagePath"));
  const logo = mediaSrc(draftStr(draft, "companyLogoPath"));
  const href = draftStr(draft, "companyHref");
  const name = draftStr(draft, "name") || "Nombre";
  const quote = draftLoc(draft, "quoteEs", "quoteEn", locale) || "…";
  const role = draftLoc(draft, "roleEs", "roleEn", locale);
  const company = draftStr(draft, "companyName");
  const linkLabel =
    draftLoc(draft, "linkLabelEs", "linkLabelEn", locale) || company;
  const hidden = draftBool(draft, "hidden");

  return (
    <div className="space-y-2">
      {hidden ? (
        <p className="text-[0.65rem] font-medium uppercase text-amber-700">
          Oculto
        </p>
      ) : null}
      <article className="flex flex-row items-start gap-3 bg-white p-3">
        <div className="aspect-square w-[72px] shrink-0 overflow-hidden bg-sky-pale sm:w-[100px]">
          <PreviewImg src={image} alt={name} className="size-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-xs leading-relaxed text-ink sm:text-sm">{quote}</p>
          <p className="text-xs font-bold text-ink sm:text-sm">{name}</p>
          {role ? (
            <p className="text-xs font-medium text-ink/80">{role}</p>
          ) : null}
          {href ? (
            logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={company}
                className="mt-1 h-6 w-auto max-w-[120px] object-contain object-left"
              />
            ) : (
              <span className="mt-1 inline-flex items-center gap-1 text-xs underline underline-offset-2">
                <ExternalLink className="size-3" strokeWidth={1.75} />
                {linkLabel || "Enlace"}
              </span>
            )
          ) : null}
        </div>
      </article>
    </div>
  );
}

export function BioPreview({
  draft,
  locale,
}: {
  draft: Draft;
  locale: Locale;
}) {
  const photo = mediaSrc(draftStr(draft, "photoPath"));
  const signature = mediaSrc(draftStr(draft, "signaturePath"));
  const text = draftLoc(draft, "textEs", "textEn", locale);
  const cv = draftStr(draft, "cvPath");

  return (
    <div className="space-y-3 bg-white p-3">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[160px] overflow-hidden bg-sky-pale">
        <PreviewImg
          src={photo}
          alt={draftLoc(draft, "photoAltEs", "photoAltEn", locale)}
          className="size-full object-cover object-top"
        />
      </div>
      <p className="whitespace-pre-line text-xs leading-relaxed text-ink">
        {text || "Texto de bio…"}
      </p>
      {cv ? (
        <p className="text-[0.65rem] text-ink/60 underline">CV: {cv}</p>
      ) : null}
      {signature ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={signature} alt="" className="h-8 w-auto object-contain" />
      ) : null}
    </div>
  );
}

export function ManualPreview({
  draft,
  locale,
}: {
  draft: Draft;
  locale: Locale;
}) {
  const cover = mediaSrc(draftStr(draft, "coverPath"));
  const title =
    draftLoc(draft, "titleEs", "titleEn", locale) || "Manual sin título";
  const meta = draftLoc(draft, "metaEs", "metaEn", locale);
  const year = draftStr(draft, "year");
  const pdf = draftStr(draft, "pdfPath");
  const published = draftBool(draft, "published");

  return (
    <div className="space-y-2">
      {!published ? (
        <p className="text-[0.65rem] font-medium uppercase text-amber-700">
          No publicado
        </p>
      ) : null}
      <div className="flex flex-col gap-3 bg-white p-2 sm:flex-row">
        <div className="aspect-[3/4] w-full max-w-[9rem] shrink-0 overflow-hidden bg-sky-pale">
          <PreviewImg src={cover} alt={title} className="size-full object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-1">
          <p className="text-sm font-bold text-ink">{title}</p>
          {year ? <p className="text-xs text-ink/70">{year}</p> : null}
          {meta ? <p className="text-xs text-ink/85">{meta}</p> : null}
          {pdf ? (
            <p className="text-xs underline underline-offset-2">Descargar PDF</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function UiProjectPreview({
  draft,
  locale,
}: {
  draft: Draft;
  locale: Locale;
}) {
  const images = draftStr(draft, "images")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const first = mediaSrc(images[0] ?? "");
  const title =
    draftLoc(draft, "titleEs", "titleEn", locale) || "Proyecto";
  const meta = draftLoc(draft, "metaEs", "metaEn", locale);
  const proto = draftStr(draft, "prototypeUrl");
  const published = draftBool(draft, "published");

  return (
    <div className="space-y-2 bg-white p-2">
      {!published ? (
        <p className="text-[0.65rem] font-medium uppercase text-amber-700">
          No publicado
        </p>
      ) : null}
      <p className="text-sm font-bold text-ink">{title}</p>
      <div className="relative aspect-[644/362] w-full overflow-hidden bg-sky-pale">
        <PreviewImg src={first} alt={title} className="size-full object-cover" />
      </div>
      {meta ? <p className="text-xs text-ink/80">{meta}</p> : null}
      {proto ? (
        <p className="text-xs underline">ver prototipo completo</p>
      ) : (
        <p className="text-xs opacity-50">prototipo no disponible</p>
      )}
    </div>
  );
}

export function UiListPreview({
  draft,
  locale,
}: {
  draft: Draft;
  locale: Locale;
}) {
  const logo = mediaSrc(draftStr(draft, "logoPath"));
  const title = draftLoc(draft, "titleEs", "titleEn", locale) || "Ítem";
  const wordmark = draftStr(draft, "wordmark");
  const caption = draftStr(draft, "caption");

  return (
    <div className="space-y-2 bg-white p-3">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-10 w-auto max-w-full object-contain object-left" />
      ) : null}
      {wordmark ? (
        <p className="font-bigger text-lg uppercase tracking-wide text-ink">
          {wordmark}
        </p>
      ) : null}
      <p className="text-sm font-medium text-ink">{title}</p>
      {caption ? <p className="text-xs text-ink/60">{caption}</p> : null}
    </div>
  );
}

export function NamedListPreview({ draft }: { draft: Draft }) {
  const lines = draftStr(draft, "items")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) {
    return <p className="text-xs text-ink/40">Sin etiquetas</p>;
  }

  return (
    <div className="flex flex-wrap content-start items-center gap-x-2 gap-y-1.5 bg-white p-3 text-xs text-ink">
      {lines.map((item, i) => (
        <span key={`${item}-${i}`} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block size-1 shrink-0 rounded-full bg-ink/70"
          />
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}

export function TagPreview({
  draft,
  locale,
}: {
  draft: Draft;
  locale: Locale;
}) {
  const slug = draftStr(draft, "slug") || "slug";
  const label =
    draftLoc(draft, "labelEs", "labelEn", locale) || slug;
  const nsfw = draftBool(draft, "isNsfw");

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white p-3">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          nsfw ? "bg-ink text-sky-pale" : "bg-ink/10 text-ink"
        }`}
      >
        {label}
      </span>
      {nsfw ? (
        <span className="text-[0.65rem] uppercase text-red-600">NSFW blur</span>
      ) : null}
    </div>
  );
}

export function SocialPreview({ draft }: { draft: Draft }) {
  const icon = mediaSrc(draftStr(draft, "iconPath"));
  const label = draftStr(draft, "label") || "@handle";
  const href = draftStr(draft, "href");
  const published = draftBool(draft, "published");

  return (
    <div className="space-y-2 bg-white p-3">
      {!published ? (
        <p className="text-[0.65rem] font-medium uppercase text-amber-700">
          Oculta
        </p>
      ) : null}
      <a
        href={href || "#"}
        className="inline-flex items-center gap-2 text-sm text-ink"
        onClick={(e) => e.preventDefault()}
      >
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" className="size-4 object-contain" />
        ) : (
          <span className="size-4 rounded-full bg-ink/20" />
        )}
        {label}
      </a>
    </div>
  );
}

export function SettingsContactPreview({
  draft,
  locale,
}: {
  draft: Draft;
  locale: Locale;
}) {
  const note =
    locale === "en"
      ? draftStr(draft, "noteEn") || draftStr(draft, "noteEs")
      : draftStr(draft, "noteEs") || draftStr(draft, "noteEn");

  return (
    <div className="space-y-1.5 bg-white p-3 text-xs text-ink">
      <p>{draftStr(draft, "email") || "email@…"}</p>
      <p>{draftStr(draft, "phone") || "+…"}</p>
      <p className="text-ink/70">{note || "nota…"}</p>
      <p className="pt-2 font-bigger text-sm uppercase tracking-wide">
        {draftStr(draft, "poweredBy") || "POWERED BY…"}
      </p>
      <p className="text-[0.65rem] text-ink/50">
        carousel {draftStr(draft, "carouselIntervalMs") || "2000"}ms · preview{" "}
        {draftStr(draft, "graphicPreviewLimit") || "7"}
      </p>
    </div>
  );
}
