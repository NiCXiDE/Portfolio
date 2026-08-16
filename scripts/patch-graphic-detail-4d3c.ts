/**
 * 4D.3C Graphic content correction — ONE TRANSACTION.
 * Creates: tag manual, citf-manual-2025 + PDF resource, 3 Seyier pieces.
 * NO legacy writes. NO deletes.
 *
 * Requires:
 *   DATABASE_NAME=portfolio
 *   V2_GRAPHIC_DETAIL_PATCH_4D3C_APPROVED=1
 */
import { config as loadEnv } from "dotenv";
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

if (process.env.V2_GRAPHIC_DETAIL_PATCH_4D3C_APPROVED !== "1") {
  console.error(
    "ABORT: set V2_GRAPHIC_DETAIL_PATCH_4D3C_APPROVED=1 to run this writer",
  );
  process.exit(2);
}

if (process.env.DATABASE_NAME !== "portfolio") {
  console.error(
    `ABORT: DATABASE_NAME must be exactly "portfolio" (got ${JSON.stringify(process.env.DATABASE_NAME)})`,
  );
  process.exit(2);
}

const COVER =
  "/assets/grafico/brand-manuals/citf-manual-2025-cover.png";
const PDF = "/assets/grafico/brand-manuals/citf-manual-2025.pdf";

const SEYIER_PIECES = [
  {
    id: "seyier-inicio",
    slug: "seyier-pantalla-inicio",
    src: "/assets/grafico/logos/seyier/inicio.png",
    title: { es: "Pantalla de inicio", en: "Starting screen" },
    sortOrder: 1,
  },
  {
    id: "seyier-portada",
    slug: "seyier-portada",
    src: "/assets/grafico/logos/seyier/portada-fondo.png",
    title: { es: "Portada", en: "Stream cover" },
    sortOrder: 2,
  },
  {
    id: "seyier-overlay",
    slug: "seyier-overlay",
    src: "/assets/grafico/logos/seyier/overlay-ejemplo.png",
    title: { es: "Overlay", en: "Overlay example" },
    sortOrder: 3,
  },
] as const;

async function main() {
  console.log(
    JSON.stringify({
      phase: "4D.3C",
      DATABASE_NAME: process.env.DATABASE_NAME,
      approved: process.env.V2_GRAPHIC_DETAIL_PATCH_4D3C_APPROVED === "1",
    }),
  );

  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  console.log(`CONNECTED_DATABASE=${db}`);
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  // Re-confirm preflight inside writer
  const exists = async (sql: string, params: unknown[]) =>
    ((await ds.query(sql, params)) as unknown[]).length > 0;

  if (!(await exists(`SELECT id FROM projects WHERE id=?`, ["citf-identity-2025"])))
    throw new Error("ABORT: citf project missing");
  if (await exists(`SELECT id FROM pieces WHERE id=?`, ["citf-manual-2025"]))
    throw new Error("ABORT: citf-manual-2025 exists");
  if (!(await exists(`SELECT id FROM brand_manuals WHERE id=?`, ["citf"])))
    throw new Error("ABORT: brand_manual missing");
  if (!(await exists(`SELECT id FROM projects WHERE id=?`, ["seyier-visual-identity"])))
    throw new Error("ABORT: seyier project missing");
  if (!(await exists(`SELECT id FROM pieces WHERE id=?`, ["seyier"])))
    throw new Error("ABORT: seyier piece missing");
  for (const p of SEYIER_PIECES) {
    if (await exists(`SELECT id FROM pieces WHERE id=?`, [p.id]))
      throw new Error(`ABORT: ${p.id} exists`);
  }
  if (await exists(`SELECT slug FROM tags WHERE slug=?`, ["manual"]))
    throw new Error("ABORT: tag manual exists");

  const brandManual = (
    await ds.query(
      `SELECT title, year, meta, cover_path, pdf_path FROM brand_manuals WHERE id=?`,
      ["citf"],
    )
  )[0] as {
    title: { es?: string; en?: string };
    year: string | null;
    meta: { es?: string; en?: string } | null;
    cover_path: string;
    pdf_path: string;
  };

  if (brandManual.cover_path !== COVER || brandManual.pdf_path !== PDF) {
    throw new Error(
      `ABORT: unexpected manual paths cover=${brandManual.cover_path} pdf=${brandManual.pdf_path}`,
    );
  }

  const pdfResourceId = randomUUID();
  const mapIds = {
    manualPiece: randomUUID(),
    manualResource: randomUUID(),
    seyierInicio: randomUUID(),
    seyierPortada: randomUUID(),
    seyierOverlay: randomUUID(),
  };

  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    // A. tag catalog
    await qr.query(
      `INSERT INTO tags (slug, label_es, label_en, is_nsfw, sort_order)
       VALUES (?, ?, ?, 0, ?)`,
      ["manual", "Manual", "Manual", 102],
    );

    // B. Manual Piece
    const titleJson = JSON.stringify(brandManual.title);
    const detailJson = brandManual.meta
      ? JSON.stringify(brandManual.meta)
      : null;
    const alt =
      brandManual.title.es?.trim() ||
      brandManual.title.en?.trim() ||
      "citf-manual-2025";

    await qr.query(
      `INSERT INTO pieces (
         id, slug, title, alt, category, origin, src_path, src_asset_id,
         fit, year, detail, href, href_label, project_id, published, sort_order,
         legacy_section, legacy_gallery
       ) VALUES (
         ?, ?, CAST(? AS JSON), ?, 'visual-identity', 'client', ?, NULL,
         'cover', ?, ${detailJson ? "CAST(? AS JSON)" : "NULL"}, NULL, NULL, ?, 1, ?,
         NULL, NULL
       )`,
      detailJson
        ? [
            "citf-manual-2025",
            "citf-manual-2025",
            titleJson,
            alt,
            COVER,
            brandManual.year,
            detailJson,
            "citf-identity-2025",
            2,
          ]
        : [
            "citf-manual-2025",
            "citf-manual-2025",
            titleJson,
            alt,
            COVER,
            brandManual.year,
            "citf-identity-2025",
            2,
          ],
    );

    // piece_entities (new piece only — do not alter existing rows)
    await qr.query(
      `INSERT INTO piece_entities (piece_id, entity_id, relation_role, sort_order, is_primary)
       VALUES (?, 'citf', 'brand-owner', 0, 1)`,
      ["citf-manual-2025"],
    );

    // C. tag link
    await qr.query(
      `INSERT INTO piece_tags (piece_id, tag_slug) VALUES (?, 'manual')`,
      ["citf-manual-2025"],
    );

    // D. PDF PieceResource — kind matches existing LIVE rows
    await qr.query(
      `INSERT INTO piece_resources (id, piece_id, media_asset_id, path, kind, label, sort_order)
       VALUES (?, 'citf-manual-2025', NULL, ?, 'piece_resource', CAST(? AS JSON), 0)`,
      [
        pdfResourceId,
        PDF,
        JSON.stringify({
          es: "PDF",
          en: "PDF",
        }),
      ],
    );

    // E. Seyier pieces
    for (const p of SEYIER_PIECES) {
      await qr.query(
        `INSERT INTO pieces (
           id, slug, title, alt, category, origin, src_path, src_asset_id,
           fit, year, detail, href, href_label, project_id, published, sort_order,
           legacy_section, legacy_gallery
         ) VALUES (
           ?, ?, CAST(? AS JSON), ?, 'visual-identity', 'other', ?, NULL,
           'cover', NULL, NULL, NULL, NULL, 'seyier-visual-identity', 1, ?,
           NULL, NULL
         )`,
        [
          p.id,
          p.slug,
          JSON.stringify(p.title),
          p.title.es,
          p.src,
          p.sortOrder,
        ],
      );
      await qr.query(
        `INSERT INTO piece_entities (piece_id, entity_id, relation_role, sort_order, is_primary)
         VALUES (?, 'seyier', 'brand-owner', 0, 1)`,
        [p.id],
      );
    }

    // F. migration_map — additive only (UNIQUE allows multi-target same source)
    await qr.query(
      `INSERT INTO migration_map (id, source_table, source_id, target_type, target_id, notes)
       VALUES (?, 'brand_manuals', 'citf', 'piece', 'citf-manual-2025', ?)`,
      [mapIds.manualPiece, "4D.3C: brand_manual → Piece citf-manual-2025"],
    );
    await qr.query(
      `INSERT INTO migration_map (id, source_table, source_id, target_type, target_id, notes)
       VALUES (?, 'brand_manuals', 'citf', 'resource', ?, ?)`,
      [
        mapIds.manualResource,
        pdfResourceId,
        "4D.3C: brand_manual PDF → piece_resources",
      ],
    );

    const seyierMap = [
      [mapIds.seyierInicio, "seyier-inicio"],
      [mapIds.seyierPortada, "seyier-portada"],
      [mapIds.seyierOverlay, "seyier-overlay"],
    ] as const;
    for (const [id, targetId] of seyierMap) {
      await qr.query(
        `INSERT INTO migration_map (id, source_table, source_id, target_type, target_id, notes)
         VALUES (?, 'graphic_items', 'seyier', 'piece', ?, ?)`,
        [
          id,
          targetId,
          "4D.3C: gallery frame → Piece (EXPECTED_SPLIT_INTO_PIECES)",
        ],
      );
    }

    await qr.commitTransaction();

    const post = {
      ok: true,
      pdfResourceId,
      mapIds,
      counts: {
        pieces: (
          await ds.query(`SELECT COUNT(*) AS c FROM pieces`)
        )[0] as { c: number },
        published: (
          await ds.query(`SELECT COUNT(*) AS c FROM pieces WHERE published=1`)
        )[0] as { c: number },
        tags: (await ds.query(`SELECT COUNT(*) AS c FROM tags`))[0] as {
          c: number;
        },
        seyierPieces: (
          await ds.query(
            `SELECT id FROM pieces WHERE project_id='seyier-visual-identity' ORDER BY sort_order, id`,
          )
        ) as Array<{ id: string }>,
        manualPiece: (
          await ds.query(`SELECT id, category, project_id, src_path FROM pieces WHERE id='citf-manual-2025'`)
        )[0],
        manualTag: (
          await ds.query(
            `SELECT * FROM piece_tags WHERE piece_id='citf-manual-2025'`,
          )
        )[0],
        manualPdf: (
          await ds.query(
            `SELECT id, path, kind FROM piece_resources WHERE piece_id='citf-manual-2025'`,
          )
        )[0],
        mapsManual: await ds.query(
          `SELECT target_type, target_id FROM migration_map WHERE source_table='brand_manuals' AND source_id='citf'`,
        ),
        mapsSeyier: await ds.query(
          `SELECT target_type, target_id FROM migration_map WHERE source_table='graphic_items' AND source_id='seyier' AND target_type='piece'`,
        ),
      },
    };

    writeFileSync(
      resolve("reports/_4d3c-patch-result.json"),
      JSON.stringify(post, null, 2),
      "utf8",
    );
    console.log(JSON.stringify({ transaction: "COMMIT", ...post.counts }, null, 2));
  } catch (err) {
    await qr.rollbackTransaction();
    console.error("ROLLBACK", err);
    throw err;
  } finally {
    await qr.release();
    await ds.destroy();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
