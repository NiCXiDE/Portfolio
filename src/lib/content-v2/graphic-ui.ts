/**
 * Presentation mapper: GraphicContentV2 → current GraphicLayer / section props.
 * Does not reshape V2 DTOs into legacy domain rows — only UI contract fields.
 */
import type {
  BrandManualContent,
  GraphicItemContent,
  GraphicPresentationMode,
  LocalizedString,
} from "@/lib/content";
import type {
  GraphicContentV2,
  GraphicManualV2,
  GraphicPieceItemV2,
} from "./graphic";

export type { GraphicPresentationMode };

export type GraphicUiLists = {
  covers: GraphicItemContent[];
  logos: GraphicItemContent[];
  personal: GraphicItemContent[];
  illustration: GraphicItemContent[];
  banners: GraphicItemContent[];
  eventos: GraphicItemContent[];
  brandManuals: BrandManualContent[];
  /** Drives index section visibility (skip empty legacy-only sections). */
  graphicPresentation: GraphicPresentationMode;
};

function both(value: string): LocalizedString {
  return { es: value, en: value };
}

function mapPieceToGraphicItem(
  piece: GraphicPieceItemV2,
): GraphicItemContent {
  const item: GraphicItemContent = {
    id: piece.id,
    src: piece.imageUrl ?? "",
    alt: piece.alt || piece.title,
    href: piece.href,
  };

  if (piece.title) item.title = both(piece.title);
  if (piece.year) item.year = piece.year;
  if (piece.detail) item.detail = both(piece.detail);
  if (piece.hrefLabel) item.hrefLabel = both(piece.hrefLabel);
  if (piece.fit) item.fit = piece.fit;
  if (piece.tags.length) item.tags = piece.tags.map((t) => t.slug);
  if (piece.resourceCount > 0) item.resourceCount = piece.resourceCount;

  // No /marcas inventado — safe Entity context stays off brand hub until Entity pages.
  // brandId omitted on purpose (4D.4).

  // Gallery stays off the listing tile (detail page loads piece_resources).
  return item;
}

function mapManual(m: GraphicManualV2): BrandManualContent {
  return {
    id: m.id,
    cover: m.coverUrl ?? "",
    pdf: m.pdfUrl ?? "",
    title: both(m.title),
    year: m.year ?? undefined,
    meta: m.detail ? both(m.detail) : undefined,
    // No brand hub wiring in 4D.4
    brandId: null,
  };
}

/**
 * Map V2 Graphic payload into PortfolioContent graphic fields.
 *
 * Category → legacy UI bucket (labels stay dict.grafico.*):
 * - visual-identity → logos
 * - illustration-artwork → illustration (covers/personal empty — not recreated)
 * - campaigns-communication → eventos
 * - print → banners
 * - manuals[] → brandManuals
 */
export function mapGraphicContentV2ToCurrentUI(
  graphic: GraphicContentV2,
): GraphicUiLists {
  const byCat = (id: string) =>
    graphic.sections.find((s) => s.id === id)?.items ??
    graphic.pieces.filter((p) => p.category === id);

  return {
    covers: [],
    personal: [],
    logos: byCat("visual-identity").map(mapPieceToGraphicItem),
    illustration: byCat("illustration-artwork").map(mapPieceToGraphicItem),
    eventos: byCat("campaigns-communication").map(mapPieceToGraphicItem),
    banners: byCat("print").map(mapPieceToGraphicItem),
    brandManuals: graphic.manuals.map(mapManual),
    graphicPresentation: "v2",
  };
}
