import type { DataSource } from "typeorm";
import {
  BrandEntity,
  BrandManualEntity,
  GraphicItemEntity,
  NamedListItemEntity,
  TagEntity,
  TestimonialEntity,
  UiProjectEntity,
} from "../../src/db/entities";
import { fixtureLegacyCounts, loadLegacyFromFixtures } from "./load-fixtures";
import type { LegacySnapshot } from "./types";

async function loadLegacyFromDb(ds: DataSource): Promise<LegacySnapshot> {
  const [
    brands,
    graphicItems,
    uiProjects,
    brandManuals,
    testimonials,
    namedListItems,
    tags,
  ] = await Promise.all([
    ds.getRepository(BrandEntity).find({ order: { sortOrder: "ASC" } }),
    ds.getRepository(GraphicItemEntity).find({ order: { sortOrder: "ASC" } }),
    ds.getRepository(UiProjectEntity).find({ order: { sortOrder: "ASC" } }),
    ds.getRepository(BrandManualEntity).find({ order: { sortOrder: "ASC" } }),
    ds.getRepository(TestimonialEntity).find({ order: { sortOrder: "ASC" } }),
    ds.getRepository(NamedListItemEntity).find({ order: { sortOrder: "ASC" } }),
    ds.getRepository(TagEntity).find({ order: { sortOrder: "ASC" } }),
  ]);

  return {
    brands,
    graphicItems,
    uiProjects,
    brandManuals,
    testimonials,
    namedListItems,
    tags,
  };
}

/** Read-only load of legacy tables; falls back to content/ fixtures if DB legacy is empty. */
export async function loadLegacySnapshot(ds: DataSource): Promise<LegacySnapshot> {
  const fromDb = await loadLegacyFromDb(ds);
  if (fromDb.graphicItems.length === 0 && fromDb.brands.length === 0) {
    console.warn(
      "[migrate-v2] Legacy tables empty in MySQL; using content/ JSON fixtures (read-only).",
    );
    return loadLegacyFromFixtures();
  }

  return {
    ...fromDb,
    graphicItems: fromDb.graphicItems.filter((g) => g.section !== "pending"),
  };
}

export { fixtureLegacyCounts };

export function localizedEs(
  value: { es: string; en: string } | null | undefined,
  fallback = "",
): string {
  return value?.es?.trim() || value?.en?.trim() || fallback;
}

export function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function galleryPaths(item: { galleryPaths: unknown[] | null }): string[] {
  if (!item.galleryPaths?.length) return [];
  return item.galleryPaths.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (entry && typeof entry === "object" && "src" in entry) {
      const src = (entry as { src?: unknown }).src;
      return typeof src === "string" ? [src] : [];
    }
    return [];
  });
}

export function uiImagePaths(
  images: Array<string | { src: string; aspect?: string }>,
): string[] {
  return images.map((img) => (typeof img === "string" ? img : img.src));
}
