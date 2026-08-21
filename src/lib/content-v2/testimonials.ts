import { In } from "typeorm";
import { getDataSource } from "@/db/data-source";
import { TestimonialEntity } from "@/db/entities";
import { PortfolioEntity, type PortfolioEntityRow } from "@/db/entities-v2";
import { mediaUrl } from "@/lib/media";
import { mapLocalized, mapPublicEntitySummary } from "./map";
import type { PublicTestimonial } from "./types";

/**
 * Public testimonials: excludes `hidden`.
 * Entity supplies default org metadata; company_* on the testimonial
 * overrides when present (admin logo/URL edits must win over entity).
 */
export async function getPublicTestimonialsV2(): Promise<PublicTestimonial[]> {
  const ds = await getDataSource();
  const rows = await ds.getRepository(TestimonialEntity).find({
    where: { hidden: false },
    order: { sortOrder: "ASC", id: "ASC" },
  });

  const entityIds = [
    ...new Set(
      rows
        .map((r) => r.entityId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const entityRows = entityIds.length
    ? await ds.getRepository(PortfolioEntity).find({
        where: { id: In(entityIds), visible: true },
      })
    : [];
  const entitiesById = new Map<string, PortfolioEntityRow>(
    entityRows.map((e) => [e.id, e]),
  );

  return rows.map((row) => {
    const entityRow = row.entityId
      ? entitiesById.get(row.entityId)
      : undefined;
    const entity = entityRow ? mapPublicEntitySummary(entityRow) : null;

    const legacyCompany =
      row.companyName || row.companyLogoPath || row.companyHref
        ? {
            name: row.companyName,
            logoUrl: row.companyLogoPath
              ? mediaUrl(row.companyLogoPath)
              : null,
            href: row.companyHref,
          }
        : null;

    return {
      id: row.id,
      name: row.name,
      imageUrl: mediaUrl(row.imagePath),
      quote: mapLocalized(row.quote) ?? { es: "", en: "" },
      role: mapLocalized(row.role) ?? { es: "", en: "" },
      linkLabel: mapLocalized(row.linkLabel),
      sortOrder: row.sortOrder,
      entityId: row.entityId,
      entity,
      legacyCompany,
    } satisfies PublicTestimonial;
  });
}
