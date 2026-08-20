/**
 * Unit tests for GraphicContentV2 adapter (4D.2) — pure mapping, no DB.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGraphicContentV2,
  categoryToSectionId,
  resolvePieceMainImage,
  resolveSafeEntityContext,
  GRAPHIC_NEVER_RETURN_IDS,
} from "../src/lib/content-v2/graphic";
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

test("categoryToSectionId maps known categories", () => {
  assert.equal(categoryToSectionId("visual-identity"), "visual-identity");
  assert.equal(
    categoryToSectionId("campaigns-communication"),
    "campaigns-communication",
  );
  assert.equal(categoryToSectionId("print"), "print");
});

test("sections derived by category; no personal section", () => {
  const content = buildGraphicContentV2("es", [
    piece({ id: "logo-a", category: "visual-identity" }),
    piece({
      id: "art-b",
      category: "illustration-artwork",
      origin: "personal",
    }),
    piece({ id: "ev-c", category: "campaigns-communication" }),
  ]);
  assert.deepEqual(
    content.sections.map((s) => s.id),
    ["visual-identity", "illustration-artwork", "campaigns-communication"],
  );
  assert.equal(
    content.sections.some((s) => (s.id as string) === "personal"),
    false,
  );
});

test("standalone Piece has null project", () => {
  const content = buildGraphicContentV2("en", [
    piece({ id: "solo", projectId: null, project: null }),
  ]);
  assert.equal(content.pieces[0]?.project, null);
  assert.equal(content.meta.counts.standalone, 1);
});

test("Project Piece keeps individual item + project context", () => {
  const content = buildGraphicContentV2("es", [
    piece({
      id: "bass2025",
      category: "illustration-artwork",
      projectId: "bass-series",
      project: {
        id: "bass-series",
        slug: "bass-series",
        title: { es: "Bass Series", en: "Bass Series" },
      },
    }),
  ]);
  assert.equal(content.pieces.length, 1);
  assert.equal(content.pieces[0]?.id, "bass2025");
  assert.equal(content.pieces[0]?.project?.id, "bass-series");
  assert.equal(content.meta.counts.projectLinked, 1);
});

test("unpublished parent pieces never enter build input — discarded ids filtered", () => {
  const content = buildGraphicContentV2("es", [
    piece({ id: "ok" }),
    piece({ id: "buhoprofe", srcUrl: "/x.svg" }),
    piece({ id: "microtime", srcUrl: "/x.svg" }),
    piece({ id: "labcom", srcUrl: "/x.svg" }),
  ]);
  assert.equal(content.pieces.every((p) => !GRAPHIC_NEVER_RETURN_IDS.has(p.id)), true);
  assert.equal(content.pieces.map((p) => p.id).includes("ok"), true);
  assert.equal(content.pieces.length, 1);
});

test("employer/intermediary not exposed as public entity label", () => {
  const withEmployer = piece({
    id: "p1",
    entities: [
      {
        entityId: "push",
        relationRole: "employer",
        isPrimary: true,
        sortOrder: 0,
        entity: {
          id: "push",
          slug: "push",
          name: "PUSH",
          shortName: "PUSH",
          type: "company",
          logoUrl: null,
          href: null,
          description: null,
          pageEnabled: false,
          showOnHome: true,
          homeOrder: 0,
        },
      },
    ],
  });
  assert.equal(resolveSafeEntityContext(withEmployer), null);

  const withClient = piece({
    id: "p2",
    entities: [
      {
        entityId: "citf",
        relationRole: "client",
        isPrimary: true,
        sortOrder: 0,
        entity: {
          id: "citf",
          slug: "citf",
          name: "CITF",
          shortName: null,
          type: "company",
          logoUrl: null,
          href: null,
          description: null,
          pageEnabled: false,
          showOnHome: true,
          homeOrder: 0,
        },
      },
    ],
  });
  assert.equal(resolveSafeEntityContext(withClient)?.name, "CITF");
  assert.equal(resolveSafeEntityContext(withClient)?.role, "client");
});

test("image resolution prefers srcUrl then prioritized resource", () => {
  assert.equal(
    resolvePieceMainImage({
      srcUrl: "/a.png",
      resources: [
        {
          id: "r1",
          path: "/b.png",
          url: "/b.png",
          kind: "cover",
          label: null,
          sortOrder: 0,
        },
      ],
    }),
    "/a.png",
  );
  assert.equal(
    resolvePieceMainImage({
      srcUrl: "",
      resources: [
        {
          id: "r1",
          path: "/b.png",
          url: "/b.png",
          kind: "gallery",
          label: null,
          sortOrder: 0,
        },
        {
          id: "r2",
          path: "/c.png",
          url: "/c.png",
          kind: "thumb",
          label: null,
          sortOrder: 1,
        },
      ],
    }),
    "/c.png",
  );
  assert.equal(
    resolvePieceMainImage({ srcUrl: "  ", resources: [] }),
    null,
  );
});

test("ES/EN localization without inventing translations", () => {
  const es = buildGraphicContentV2("es", [
    piece({
      id: "x",
      title: { es: "Titulo ES", en: "" },
    }),
  ]);
  const en = buildGraphicContentV2("en", [
    piece({
      id: "x",
      title: { es: "Titulo ES", en: "" },
    }),
  ]);
  assert.equal(es.pieces[0]?.title, "Titulo ES");
  assert.equal(en.pieces[0]?.title, "Titulo ES");
});

test("sorting determinism left to reader; adapter preserves input order from build", () => {
  const content = buildGraphicContentV2("es", [
    piece({ id: "b", sortOrder: 1, year: "2020" }),
    piece({ id: "a", sortOrder: 0, year: "2024" }),
  ]);
  // build does not re-sort — getPublicPiecesV2 sorts before build
  assert.deepEqual(
    content.pieces.map((p) => p.id),
    ["b", "a"],
  );
});

test("manualStatus DETAIL_GAP and seyier gallery gap flagged when incomplete", () => {
  const content = buildGraphicContentV2("es", [
    piece({ id: "seyier", resources: [], srcUrl: "/seyier.svg" }),
  ]);
  assert.equal(content.meta.manualStatus, "DETAIL_GAP");
  assert.equal(content.manuals.length, 0);
  assert.equal(content.meta.seyierGalleryGap, true);
  assert.equal(content.pieces[0]?.imageUrl, "/seyier.svg");
});

test("manual tag routes Piece to manuals[] not sections; category stays visual-identity", () => {
  const content = buildGraphicContentV2("es", [
    piece({
      id: "citf-manual-2025",
      category: "visual-identity",
      srcUrl: "/assets/grafico/brand-manuals/citf-manual-2025-cover.png",
      year: "2025",
      detail: {
        es: "Clúster de Innovación Tecnológica Formosa",
        en: "Formosa Technology Innovation Cluster",
      },
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
          id: "pdf1",
          path: "/assets/grafico/brand-manuals/citf-manual-2025.pdf",
          url: "/assets/grafico/brand-manuals/citf-manual-2025.pdf",
          kind: "piece_resource",
          label: { es: "PDF", en: "PDF" },
          sortOrder: 0,
        },
      ],
      projectId: "citf-identity-2025",
      project: {
        id: "citf-identity-2025",
        slug: "identidad-visual-citf-2025",
        title: { es: "CITF", en: "CITF" },
      },
    }),
    piece({
      id: "itf",
      category: "visual-identity",
      projectId: "citf-identity-2025",
      project: {
        id: "citf-identity-2025",
        slug: "identidad-visual-citf-2025",
        title: { es: "CITF", en: "CITF" },
      },
    }),
  ]);
  assert.equal(content.meta.manualStatus, "PRESENT");
  assert.equal(content.manuals.length, 1);
  assert.equal(content.manuals[0]?.id, "citf-manual-2025");
  assert.equal(content.manuals[0]?.year, "2025");
  assert.equal(
    content.manuals[0]?.pdfUrl,
    "/assets/grafico/brand-manuals/citf-manual-2025.pdf",
  );
  assert.equal(content.pieces.map((p) => p.id).includes("citf-manual-2025"), false);
  assert.equal(
    content.sections
      .flatMap((s) => s.items)
      .some((i) => i.id === "citf-manual-2025"),
    false,
  );
  assert.equal(content.pieces.length, 1);
  assert.equal(content.pieces[0]?.id, "itf");
  assert.equal(content.meta.counts.manuals, 1);
  assert.equal(content.meta.counts.pieces, 1);
});

test("Seyier gallery collapse closes gap; single Piece in listing", () => {
  const project = {
    id: "seyier-visual-identity",
    slug: "identidad-visual-seyier",
    title: { es: "Seyier", en: "Seyier" },
  };
  const content = buildGraphicContentV2("es", [
    piece({
      id: "seyier",
      category: "visual-identity",
      projectId: project.id,
      project,
      srcUrl: "/assets/grafico/logos/seyier.svg",
      resources: [
        {
          id: "r1",
          path: "/assets/grafico/logos/seyier/inicio.png",
          url: "/assets/grafico/logos/seyier/inicio.png",
          kind: "piece_resource",
          label: { es: "Pantalla de inicio", en: "Starting screen" },
          sortOrder: 0,
        },
        {
          id: "r2",
          path: "/assets/grafico/logos/seyier/portada-fondo.png",
          url: "/assets/grafico/logos/seyier/portada-fondo.png",
          kind: "piece_resource",
          label: { es: "Portada", en: "Stream cover" },
          sortOrder: 1,
        },
        {
          id: "r3",
          path: "/assets/grafico/logos/seyier/overlay-ejemplo.png",
          url: "/assets/grafico/logos/seyier/overlay-ejemplo.png",
          kind: "piece_resource",
          label: { es: "Overlay", en: "Overlay example" },
          sortOrder: 2,
        },
      ],
    }),
  ]);
  assert.equal(content.meta.seyierGalleryGap, false);
  assert.equal(content.pieces.length, 1);
  assert.equal(content.pieces[0]?.resourceCount, 3);
  assert.equal(
    content.sections.find((s) => s.id === "visual-identity")?.items.length,
    1,
  );
});
