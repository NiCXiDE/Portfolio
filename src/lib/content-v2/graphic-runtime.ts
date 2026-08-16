/**
 * Flag-aware Graphic section/detail helpers (Phase 4D.4).
 * When source=v2: GraphicContentV2 only — never graphic_items / brand_manuals.
 */
import type { Locale } from "@/i18n/config";
import {
  loadGraphicSection,
  type GraphicItemContent,
} from "@/lib/content";
import type { GraphicSection } from "@/db/entities";
import type { GraphicGalleryLabel } from "@/lib/graphic-gallery";
import { getGraphicContentV2, getGraphicPieceDetailV2 } from "./graphic";
import { getGraphicContentSource } from "./graphic-source";
import { mapGraphicContentV2ToCurrentUI } from "./graphic-ui";

type PublicGraphicSection = Exclude<GraphicSection, "pending">;

const SECTION_TO_BUCKET: Record<
  PublicGraphicSection,
  keyof ReturnType<typeof mapGraphicContentV2ToCurrentUI> | null
> = {
  covers: "covers",
  logos: "logos",
  personal: "personal",
  illustration: "illustration",
  banners: "banners",
  eventos: "eventos",
};

/**
 * Load one Graphic UI section flag-aware.
 * manuals are not a GraphicSection in content.ts — callers use PortfolioContent.brandManuals.
 */
export async function loadGraphicSectionForLocale(
  section: PublicGraphicSection,
  locale: Locale,
): Promise<GraphicItemContent[]> {
  if (getGraphicContentSource() === "legacy") {
    return loadGraphicSection(section);
  }

  const graphic = await getGraphicContentV2(locale);
  const ui = mapGraphicContentV2ToCurrentUI(graphic);
  const key = SECTION_TO_BUCKET[section];
  if (!key) return [];
  return ui[key] as GraphicItemContent[];
}

type DetailGalleryFrame = "landscape" | "portrait" | "square";

/**
 * Resolve a Piece for logo/event detail routes under the active source.
 * V2: uses Piece id/slug; gallery = piece_resources only (no legacy rebuild).
 */
export async function loadGraphicDetailItemForLocale(
  locale: Locale,
  opts: {
    section: "logos" | "eventos";
    id: string;
  },
): Promise<{
  item: GraphicItemContent;
  gallery: Array<{
    src: string;
    label?: GraphicGalleryLabel;
    frame?: DetailGalleryFrame;
  }>;
} | null> {
  if (getGraphicContentSource() === "legacy") {
    const items = await loadGraphicSection(opts.section);
    const item = items.find((e) => e.id === opts.id);
    if (!item) return null;
    return {
      item,
      gallery: (item.gallery ?? []).map((g) => {
        const frame =
          g.frame === "landscape" ||
          g.frame === "portrait" ||
          g.frame === "square"
            ? g.frame
            : undefined;
        return {
          src: g.src,
          label: g.label,
          frame,
        };
      }),
    };
  }

  const detail = await getGraphicPieceDetailV2(locale, opts.id);
  if (!detail) return null;

  const expectedCategory =
    opts.section === "logos" ? "visual-identity" : "campaigns-communication";
  if (detail.category !== expectedCategory) return null;

  const gallery = detail.gallery
    .filter((g) => Boolean(g.url))
    .map((g) => ({
      src: g.url as string,
      label: g.label ? { es: g.label, en: g.label } : undefined,
    }));

  const item: GraphicItemContent = {
    id: detail.id,
    src: detail.imageUrl ?? "",
    alt: detail.alt || detail.title,
    href: detail.href,
    title: { es: detail.title, en: detail.title },
    year: detail.year ?? undefined,
    detail: detail.detail
      ? { es: detail.detail, en: detail.detail }
      : undefined,
    hrefLabel: detail.hrefLabel
      ? { es: detail.hrefLabel, en: detail.hrefLabel }
      : undefined,
    tags: detail.tags.map((t) => t.slug),
    fit: detail.fit ?? undefined,
    gallery: gallery.map((g) => ({ src: g.src, label: g.label })),
  };

  return { item, gallery };
}
