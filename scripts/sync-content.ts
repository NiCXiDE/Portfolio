/**
 * Upsert content JSON into DB without wiping admin/inbox data.
 * Usage: npx tsx scripts/sync-content.ts
 */
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createDataSource } from "../src/db/data-source";
import {
  GraphicItemEntity,
  UiListItemEntity,
  UiProjectEntity,
  type GraphicItemRow,
  type GraphicSection,
  type LocalizedJson,
  type UiListItemRow,
  type UiProjectRow,
} from "../src/db/entities";
import { normalizeUiSlides } from "../src/lib/ui-slides";

loadEnv({ path: resolve(process.cwd(), ".env") });

type Localized = LocalizedJson;

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), relativePath), "utf8"),
  ) as T;
}

function seedGraphics(
  section: GraphicSection,
  items: Array<Record<string, unknown>>,
): GraphicItemRow[] {
  return items.map((raw, sortOrder) => ({
    id: String(raw.id),
    section,
    srcPath: String(raw.src),
    srcAssetId: null,
    alt: String(raw.alt ?? ""),
    title: (raw.title as Localized | undefined) ?? null,
    year: raw.year ? String(raw.year) : null,
    detail:
      ((raw.detail as Localized | undefined) ??
        (raw.usage as Localized | undefined)) ??
      null,
    href:
      raw.href === undefined || raw.href === null ? null : String(raw.href),
    hrefLabel: (raw.hrefLabel as Localized | undefined) ?? null,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : null,
    fit: raw.fit === "cover" || raw.fit === "contain" ? raw.fit : null,
    relatedSrcPath:
      raw.relatedSrc === undefined || raw.relatedSrc === null
        ? null
        : String(raw.relatedSrc),
    relatedAssetId: null,
    galleryPaths: (() => {
      const rawGallery = Array.isArray(raw.gallery)
        ? raw.gallery
        : Array.isArray(raw.galleryPaths)
          ? raw.galleryPaths
          : null;
      if (!rawGallery) return null;
      const items = rawGallery
        .map((g) => {
          if (typeof g === "string") {
            const src = String(g).trim();
            return src ? { src } : null;
          }
          if (g && typeof g === "object") {
            const obj = g as Record<string, unknown>;
            const srcVal = obj.src ?? obj.path;
            if (typeof srcVal !== "string") return null;
            const src = srcVal.trim();
            if (!src) return null;
            const frame =
              typeof obj.frame === "string" ? obj.frame : undefined;
            const label =
              typeof obj.label === "object" && obj.label !== null
                ? (obj.label as unknown)
                : undefined;
            return { src, frame, label };
          }
          return null;
        })
        .filter(Boolean);
      return items.length ? items : null;
    })(),
    sortOrder,
    published: section !== "pending",
  }));
}

async function main() {
  const ds = createDataSource(true);
  await ds.initialize();

  const graphicRepo = ds.getRepository(GraphicItemEntity);
  const uiRepo = ds.getRepository(UiProjectEntity);
  const uiListRepo = ds.getRepository(UiListItemEntity);

  const graphicSources: Array<[GraphicSection, string]> = [
    ["covers", "content/grafico/covers.json"],
    ["logos", "content/grafico/logos.json"],
    ["personal", "content/grafico/personal.json"],
    ["pending", "content/grafico/pending.json"],
    ["illustration", "content/grafico/illustration.json"],
    ["banners", "content/grafico/banners.json"],
    ["eventos", "content/grafico/eventos.json"],
  ];

  const graphicRows = graphicSources.flatMap(([section, path]) =>
    seedGraphics(section, readJson(path)),
  );

  const jsonIds = new Set(graphicRows.map((r) => r.id));
  const stale = await graphicRepo.find({
    where: [
      { id: "brigado-crew", section: "eventos" },
      { id: "s-mark", section: "logos" },
    ],
  });
  for (const row of stale) {
    if (!jsonIds.has(row.id) || row.section !== graphicRows.find((g) => g.id === row.id)?.section) {
      await graphicRepo.delete({ id: row.id });
      console.log(`Removed stale graphic item: ${row.id}`);
    }
  }

  await graphicRepo.save(graphicRows);
  console.log(`Upserted ${graphicRows.length} graphic items.`);

  const uiProjects = readJson<
    Array<{
      id: string;
      category: UiProjectRow["category"];
      title: Localized;
      meta: Localized;
      images: unknown;
      prototypeUrl: string | null;
      summary?: Localized | null;
      client?: string | null;
      period?: Localized | null;
      duration?: Localized | null;
      ctaKind?: UiProjectRow["ctaKind"];
    }>
  >("content/interfaces/projects.json");

  const uiProjectRows: UiProjectRow[] = uiProjects.map((item, sortOrder) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    meta: item.meta,
    images: normalizeUiSlides(item.images),
    prototypeUrl: item.prototypeUrl,
    summary: item.summary ?? null,
    client: item.client ?? null,
    period: item.period ?? null,
    duration: item.duration ?? null,
    ctaKind: item.ctaKind ?? null,
    sortOrder,
    published: true,
  }));

  await uiRepo.save(uiProjectRows);
  console.log(`Upserted ${uiProjectRows.length} UI projects.`);

  const uiList = readJson<
    Array<{
      id: string;
      title: Localized;
      logo?: string;
      caption?: string;
      wordmark?: string;
    }>
  >("content/interfaces/list.json");

  const uiListRows: UiListItemRow[] = uiList.map((item, sortOrder) => ({
    id: item.id,
    title: item.title,
    logoPath: item.logo ?? null,
    caption: item.caption ?? null,
    wordmark: item.wordmark ?? null,
    sortOrder,
    published: true,
  }));

  const listIds = new Set(uiListRows.map((r) => r.id));
  for (const removedId of ["omnigroup", "cloronor-store"]) {
    if (!listIds.has(removedId)) {
      await uiListRepo.delete({ id: removedId });
      console.log(`Removed stale UI list item: ${removedId}`);
    }
  }

  await uiListRepo.save(uiListRows);
  console.log(`Upserted ${uiListRows.length} UI list items.`);

  await ds.destroy();
  console.log("Content sync complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
