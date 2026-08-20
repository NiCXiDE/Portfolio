/**
 * Unit tests for Graphic feature flag + UI mapper (4D.4).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { getGraphicContentSource } from "../src/lib/content-v2/graphic-source";
import { mapGraphicContentV2ToCurrentUI } from "../src/lib/content-v2/graphic-ui";
import { buildGraphicContentV2 } from "../src/lib/content-v2/graphic";
import { logoDetailHref } from "../src/lib/graphic-constants";
import type { PublicPieceSummary } from "../src/lib/content-v2/types";

test("getGraphicContentSource: undefined → legacy", () => {
  assert.equal(getGraphicContentSource(undefined), "legacy");
});

test("getGraphicContentSource: legacy → legacy", () => {
  assert.equal(getGraphicContentSource("legacy"), "legacy");
  assert.equal(getGraphicContentSource("LEGACY"), "legacy");
});

test("getGraphicContentSource: v2 → v2", () => {
  assert.equal(getGraphicContentSource("v2"), "v2");
  assert.equal(getGraphicContentSource(" V2 "), "v2");
});

test("getGraphicContentSource: invalid → legacy", () => {
  assert.equal(getGraphicContentSource("prod"), "legacy");
  assert.equal(getGraphicContentSource("true"), "legacy");
  assert.equal(getGraphicContentSource(""), "legacy");
});

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

test("UI mapper: categories → UI buckets; manual excluded from logos", () => {
  const graphic = buildGraphicContentV2("es", [
    piece({ id: "logo-a", category: "visual-identity" }),
    piece({
      id: "citf-manual-2025",
      category: "visual-identity",
      srcUrl: "/cover.png",
      tags: [
        {
          slug: "manual",
          labelEs: "Manual",
          labelEn: "Manual",
          isNsfw: false,
        },
      ],
      resources: [
        {
          id: "pdf",
          path: "/m.pdf",
          url: "/m.pdf",
          kind: "piece_resource",
          label: null,
          sortOrder: 0,
        },
      ],
    }),
    piece({ id: "art-b", category: "illustration-artwork" }),
    piece({ id: "ev-c", category: "campaigns-communication" }),
    piece({ id: "print-d", category: "print" }),
  ]);

  const ui = mapGraphicContentV2ToCurrentUI(graphic);
  assert.equal(ui.graphicPresentation, "v2");
  assert.equal(ui.covers.length, 0);
  assert.equal(ui.personal.length, 0);
  assert.equal(ui.logos.map((l) => l.id).join(","), "logo-a");
  assert.equal(ui.illustration.map((l) => l.id).join(","), "art-b");
  assert.equal(ui.eventos.map((l) => l.id).join(","), "ev-c");
  assert.equal(ui.banners.map((l) => l.id).join(","), "print-d");
  assert.equal(ui.brandManuals.length, 1);
  assert.equal(ui.brandManuals[0]?.id, "citf-manual-2025");
  assert.equal(ui.brandManuals[0]?.pdf, "/m.pdf");
  assert.equal(ui.logos.some((l) => l.id === "citf-manual-2025"), false);
});

test("UI mapper: Seyier is a single logo without inline gallery", () => {
  const project = {
    id: "seyier-visual-identity",
    slug: "seyier",
    title: { es: "Seyier", en: "Seyier" },
  };
  const graphic = buildGraphicContentV2("es", [
    piece({
      id: "seyier",
      category: "visual-identity",
      projectId: project.id,
      project,
      resources: [
        {
          id: "r1",
          path: "/assets/grafico/logos/seyier/inicio.png",
          url: "/assets/grafico/logos/seyier/inicio.png",
          kind: "piece_resource",
          label: null,
          sortOrder: 0,
        },
      ],
    }),
  ]);
  const ui = mapGraphicContentV2ToCurrentUI(graphic);
  assert.equal(ui.logos.length, 1);
  assert.equal(ui.logos[0]?.id, "seyier");
  assert.ok(!ui.logos[0]?.gallery?.length);
  assert.equal(ui.logos[0]?.resourceCount, 1);
});

test("logoDetailHref: only when gallery or resources exist", () => {
  assert.equal(logoDetailHref("es", { id: "plain" }), null);
  assert.equal(
    logoDetailHref("es", { id: "legacy", gallery: ["/a.png"] }),
    "/es/grafico/logos/legacy",
  );
  assert.equal(
    logoDetailHref("en", { id: "seyier", resourceCount: 3 }),
    "/en/grafico/logos/seyier",
  );
});
