import { getDataSource } from "@/db/data-source";
import { PortfolioEntity, type PortfolioEntityRow } from "@/db/entities-v2";
import { mapPublicEntitySummary } from "./map";
import type { PublicEntitySummary } from "./types";
import { compareHomeOrder, isHomeEntity, isPublicEntity } from "./visibility";

async function loadVisibleEntities(): Promise<PortfolioEntityRow[]> {
  const ds = await getDataSource();
  const rows = await ds.getRepository(PortfolioEntity).find({
    where: { visible: true },
    order: { sortOrder: "ASC", id: "ASC" },
  });
  return rows.filter(isPublicEntity);
}

/** Home entities: visible && showOnHome. Deterministic homeOrder/sortOrder/id. */
export async function getHomeEntitiesV2(): Promise<PublicEntitySummary[]> {
  const rows = await loadVisibleEntities();
  return rows
    .filter(isHomeEntity)
    .sort(compareHomeOrder)
    .map((row) => mapPublicEntitySummary(row)!)
    .filter(Boolean);
}

/**
 * Public entity by slug. Requires visible=true.
 * Returns null if missing or invisible. Does not invent Entity page URLs;
 * `pageEnabled` is exposed on the DTO for future routing.
 */
export async function getPublicEntityBySlugV2(
  slug: string,
): Promise<PublicEntitySummary | null> {
  const ds = await getDataSource();
  const row = await ds.getRepository(PortfolioEntity).findOne({
    where: { slug },
  });
  if (!row || !isPublicEntity(row)) return null;
  return mapPublicEntitySummary(row);
}

/** All publicly visible entities (not limited to Home). */
export async function getPublicEntitiesV2(): Promise<PublicEntitySummary[]> {
  const rows = await loadVisibleEntities();
  return rows
    .map((row) => mapPublicEntitySummary(row)!)
    .filter(Boolean);
}
