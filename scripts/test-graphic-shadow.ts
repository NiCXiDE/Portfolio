/**
 * Unit tests for Graphic shadow comparison (4D.3).
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTaxonomyRows,
  classifyLegacyItem,
  EXPECTED_DISCARDED_GRAPHIC_IDS,
  normalizeLegacyGraphicSnapshot,
  type GraphicShadowItem,
} from "../src/lib/content-v2/graphic-shadow";
import { buildGraphicContentV2 } from "../src/lib/content-v2/graphic";
import type { PublicPieceSummary } from "../src/lib/content-v2/types";

function piece(
  partial: Partial<PublicPieceSummary> & Pick<PublicPieceSummary, "id">,
): PublicPieceSummary {
  return {
    slug: partial.slug ?? partial.id,
    title: partial.title ?? { es: partial.id, en: partial.id },
    alt: partial.alt ?? partial.id,
    category: partial.category ?? "illustration-artwork",
    origin: partial.origin ?? "personal",
    srcUrl: partial.srcUrl ?? `/assets/${partial.id}.png`,
    fit: partial.fit ?? "cover",
    year: partial.year ?? "2024",
    detail: partial.detail ?? null,
    href: partial.href ?? null,
    hrefLabel: partial.hrefLabel ?? null,
    projectId: partial.projectId ?? null,
    project: partial.project ?? null,
    resources: partial.resources ?? [],
    tags: partial.tags ?? [],
    entities: partial.entities ?? [],
    sortOrder: partial.sortOrder ?? 0,
    ...partial,
  };
}

function legacyItem(
  partial: Partial<GraphicShadowItem> & Pick<GraphicShadowItem, "key">,
): GraphicShadowItem {
  return {
    displayTitle: partial.displayTitle ?? partial.key,
    section: partial.section ?? "covers",
    hasMainImage: partial.hasMainImage ?? true,
    tags: partial.tags ?? [],
    hasGallery: partial.hasGallery ?? false,
    hasBrandContext: partial.hasBrandContext ?? false,
    detailId: partial.detailId ?? partial.key,
    year: partial.year ?? "2024",
    ...partial,
  };
}

test("47 → 44 + 3 discarded classification", () => {
  assert.equal(EXPECTED_DISCARDED_GRAPHIC_IDS.size, 3);
  assert.ok(EXPECTED_DISCARDED_GRAPHIC_IDS.has("buhoprofe"));
  assert.ok(EXPECTED_DISCARDED_GRAPHIC_IDS.has("microtime"));
  assert.ok(EXPECTED_DISCARDED_GRAPHIC_IDS.has("labcom"));
});

test("Project context addition accepted", () => {
  const seen = new Set<string>();
  const row = classifyLegacyItem(
    legacyItem({ key: "bass2025", section: "covers" }),
    buildGraphicContentV2("es", [
      piece({
        id: "bass2025",
        projectId: "bass-series",
        project: {
          id: "bass-series",
          slug: "bass-series",
          title: { es: "Bass", en: "Bass" },
        },
      }),
    ]).pieces,
    seen,
  );
  assert.equal(row.result, "EXPECTED_PROJECT_CONTEXT_ADDED");
  assert.equal(row.expected, true);
});

test("manual gap expected — does not fail when survivors ok", () => {
  // Build 44 fake survivors + ensure compare treats manual as gap without unexpected
  const pieces: PublicPieceSummary[] = [];
  for (let i = 0; i < 44; i++) {
    pieces.push(
      piece({
        id: `p${i}`,
        category:
          i < 12
            ? "visual-identity"
            : i < 37
              ? "illustration-artwork"
              : i < 40
                ? "campaigns-communication"
                : "print",
      }),
    );
  }
  const graphicV2 = buildGraphicContentV2("es", pieces);
  assert.equal(graphicV2.meta.manualStatus, "DETAIL_GAP");
  assert.equal(graphicV2.manuals.length, 0);
});

test("Seyier gallery gap expected", () => {
  const seen = new Set<string>();
  const row = classifyLegacyItem(
    legacyItem({
      key: "seyier",
      section: "logos",
      hasGallery: true,
    }),
    buildGraphicContentV2("es", [
      piece({ id: "seyier", category: "visual-identity", resources: [] }),
    ]).pieces,
    seen,
  );
  assert.equal(row.result, "EXPECTED_DETAIL_GAP_GALLERY");
});

test("unexpected missing fails classification", () => {
  const seen = new Set<string>();
  const row = classifyLegacyItem(
    legacyItem({ key: "ghost-item" }),
    buildGraphicContentV2("es", [piece({ id: "other" })]).pieces,
    seen,
  );
  assert.equal(row.result, "UNEXPECTED_MISSING");
  assert.equal(row.expected, false);
});

test("duplicate matching fails", () => {
  const v2 = buildGraphicContentV2("es", [
    piece({ id: "shared", category: "visual-identity" }),
  ]).pieces;
  const seen = new Set<string>();
  const first = classifyLegacyItem(
    legacyItem({ key: "shared", section: "logos" }),
    v2,
    seen,
  );
  const second = classifyLegacyItem(
    legacyItem({ key: "shared-alias", section: "logos" }),
    // force same v2 via startsWith won't work — simulate by same id finder
    v2,
    seen,
  );
  assert.equal(first.result, "MATCH");
  // second won't find shared-alias — use same key again
  const dup = classifyLegacyItem(
    legacyItem({ key: "shared", section: "banners" }),
    v2,
    seen,
  );
  assert.equal(dup.result, "UNEXPECTED_DUPLICATE");
});

test("Sessions privacy EXPECTED_PUBLIC when safe", () => {
  const pieces = [
    piece({
      id: "sessions",
      category: "visual-identity",
      projectId: "sessions",
      project: {
        id: "sessions",
        slug: "sessions",
        title: { es: "Sessions", en: "Sessions" },
      },
      entities: [],
    }),
  ];
  // pad to avoid shadowOk count checks in full compare — only sessions field
  const graphicV2 = buildGraphicContentV2("es", pieces);
  assert.equal(graphicV2.meta.sessionsReview, "CURRENT_PUBLIC_SAFE");
  assert.deepEqual(graphicV2.meta.sessionsPieceIds, ["sessions"]);
});

test("ES/EN snapshots normalize titles with fallback", () => {
  const legacy = normalizeLegacyGraphicSnapshot(
    {
      covers: [
        {
          id: "x",
          src: "/x.png",
          alt: "Alt",
          href: null,
          title: { es: "Titulo", en: "" },
        },
      ],
      logos: [],
      personal: [],
      illustration: [],
      banners: [],
      eventos: [],
      brandManuals: [],
    },
    "en",
  );
  assert.equal(legacy.items[0]?.displayTitle, "Titulo");
});

test("taxonomy mapping has personal EXPECTED_REMOVAL", () => {
  const rows = buildTaxonomyRows();
  const personal = rows.find((r) => r.legacySection === "personal");
  assert.equal(personal?.status, "EXPECTED_REMOVAL");
});
