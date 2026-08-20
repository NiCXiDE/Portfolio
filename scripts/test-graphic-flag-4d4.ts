/**
 * Unit tests for Graphic feature flag + UI mapper (4D.4 / 4D.6).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { getGraphicContentSource } from "../src/lib/content-v2/graphic-source";
import { mapGraphicContentV2ToCurrentUI } from "../src/lib/content-v2/graphic-ui";
import { buildGraphicContentV2 } from "../src/lib/content-v2/graphic";
import { logoDetailHref } from "../src/lib/graphic-constants";
import type { PublicPieceSummary } from "../src/lib/content-v2/types";

test("getGraphicContentSource: unset env → v2 (4D.6 default)", () => {
  const prev = process.env.GRAPHIC_CONTENT_SOURCE;
  delete process.env.GRAPHIC_CONTENT_SOURCE;
  try {
    assert.equal(getGraphicContentSource(), "v2");
  } finally {
    if (prev === undefined) delete process.env.GRAPHIC_CONTENT_SOURCE;
    else process.env.GRAPHIC_CONTENT_SOURCE = prev;
  }
});

test("getGraphicContentSource: undefined param → v2", () => {
  assert.equal(getGraphicContentSource(undefined), "v2");
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

test("loadPortfolioContentForLocale: unset graphic → v2-graphic only (no double-read)", async () => {
  const { config: loadEnv } = await import("dotenv");
  const { resolve } = await import("node:path");
  loadEnv({ path: resolve(process.cwd(), ".env") });
  delete process.env.DATABASE_NAME;

  const prevGraphic = process.env.GRAPHIC_CONTENT_SOURCE;
  const prevHome = process.env.HOME_CONTENT_SOURCE;
  delete process.env.GRAPHIC_CONTENT_SOURCE;
  delete process.env.HOME_CONTENT_SOURCE;

  try {
    const { getDataSource } = await import("../src/db/data-source");
    const ds = await getDataSource();
    const db = (
      (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
    )[0]?.db;
    if (db !== "portfolio") {
      await ds.destroy();
      return;
    }

    const {
      loadPortfolioContentForLocale,
      getLastGraphicLoadTrace,
      resetPortfolioLoadTrace,
    } = await import("../src/lib/content-v2/home-runtime");
    const { getGraphicContentSource } = await import(
      "../src/lib/content-v2/graphic-source"
    );

    resetPortfolioLoadTrace();
    assert.equal(getGraphicContentSource(), "v2");
    await loadPortfolioContentForLocale("es");
    const trace = getLastGraphicLoadTrace();
    assert.equal(trace?.source, "v2");
    assert.deepEqual(trace?.loaders, ["v2-graphic"]);
    assert.ok(!trace?.loaders.includes("legacy-graphic"));

    await ds.destroy();
  } finally {
    if (prevGraphic === undefined) delete process.env.GRAPHIC_CONTENT_SOURCE;
    else process.env.GRAPHIC_CONTENT_SOURCE = prevGraphic;
    if (prevHome === undefined) delete process.env.HOME_CONTENT_SOURCE;
    else process.env.HOME_CONTENT_SOURCE = prevHome;
  }
});

test("loadPortfolioContentForLocale: explicit legacy → legacy-graphic only", async () => {
  const { config: loadEnv } = await import("dotenv");
  const { resolve } = await import("node:path");
  loadEnv({ path: resolve(process.cwd(), ".env") });
  delete process.env.DATABASE_NAME;

  const prevGraphic = process.env.GRAPHIC_CONTENT_SOURCE;
  process.env.GRAPHIC_CONTENT_SOURCE = "legacy";

  try {
    const { getDataSource } = await import("../src/db/data-source");
    const ds = await getDataSource();
    const db = (
      (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
    )[0]?.db;
    if (db !== "portfolio") {
      await ds.destroy();
      return;
    }

    const {
      loadPortfolioContentForLocale,
      getLastGraphicLoadTrace,
      resetPortfolioLoadTrace,
    } = await import("../src/lib/content-v2/home-runtime");

    resetPortfolioLoadTrace();
    await loadPortfolioContentForLocale("es");
    const trace = getLastGraphicLoadTrace();
    assert.equal(trace?.source, "legacy");
    assert.deepEqual(trace?.loaders, ["legacy-graphic"]);
    assert.ok(!trace?.loaders.includes("v2-graphic"));

    await ds.destroy();
  } finally {
    if (prevGraphic === undefined) delete process.env.GRAPHIC_CONTENT_SOURCE;
    else process.env.GRAPHIC_CONTENT_SOURCE = prevGraphic;
  }
});
