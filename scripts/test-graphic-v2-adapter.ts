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

test("manualStatus DETAIL_GAP and seyier gallery gap flagged", () => {
  const content = buildGraphicContentV2("es", [
    piece({ id: "seyier", resources: [], srcUrl: "/seyier.svg" }),
  ]);
  assert.equal(content.meta.manualStatus, "DETAIL_GAP");
  assert.equal(content.manuals.length, 0);
  assert.equal(content.meta.seyierGalleryGap, true);
  assert.equal(content.pieces[0]?.imageUrl, "/seyier.svg");
});
