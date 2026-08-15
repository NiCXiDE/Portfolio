import { In } from "typeorm";
import { getDataSource } from "@/db/data-source";
import { TagEntity } from "@/db/entities";
import {
  PieceEntity,
  PieceEntityLinkEntity,
  PieceResourceEntity,
  PieceTagEntity,
  PortfolioEntity,
  type PieceRow,
  type PortfolioEntityRow,
  type ProjectRow,
} from "@/db/entities-v2";
import { mediaUrl } from "@/lib/media";
import { mapLocalized, mapProjectTitle, mapPublicEntitySummary } from "./map";
import { loadPublicProjectRowsByIds } from "./projects";
import type {
  PublicPieceFilters,
  PublicPieceSummary,
  PublicSortMode,
} from "./types";
import { isPublicPiece } from "./visibility";

function sortPieces(rows: PieceRow[], mode: PublicSortMode | undefined): PieceRow[] {
  const copy = [...rows];
  switch (mode) {
    case "az":
      return copy.sort((a, b) =>
        (a.title?.es || a.alt || a.id).localeCompare(
          b.title?.es || b.alt || b.id,
          "es",
        ),
      );
    case "za":
      return copy.sort((a, b) =>
        (b.title?.es || b.alt || b.id).localeCompare(
          a.title?.es || a.alt || a.id,
          "es",
        ),
      );
    case "newest":
      return copy.sort((a, b) => {
        const ay = Number.parseInt(a.year ?? "", 10) || 0;
        const by = Number.parseInt(b.year ?? "", 10) || 0;
        if (by !== ay) return by - ay;
        return a.id.localeCompare(b.id);
      });
    case "oldest":
      return copy.sort((a, b) => {
        const ay = Number.parseInt(a.year ?? "", 10) || 9999;
        const by = Number.parseInt(b.year ?? "", 10) || 9999;
        if (ay !== by) return ay - by;
        return a.id.localeCompare(b.id);
      });
    default:
      return copy.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.id.localeCompare(b.id);
      });
  }
}

async function hydratePieces(
  pieces: PieceRow[],
  parents: Map<string, ProjectRow>,
): Promise<PublicPieceSummary[]> {
  if (!pieces.length) return [];

  const ds = await getDataSource();
  const ids = pieces.map((p) => p.id);

  const [resources, tags, links, tagCatalog, entityRows] = await Promise.all([
    ds.getRepository(PieceResourceEntity).find({
      where: { pieceId: In(ids) },
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(PieceTagEntity).find({
      where: { pieceId: In(ids) },
    }),
    ds.getRepository(PieceEntityLinkEntity).find({
      where: { pieceId: In(ids) },
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(TagEntity).find(),
    ds.getRepository(PortfolioEntity).find({ where: { visible: true } }),
  ]);

  const tagsBySlug = new Map(tagCatalog.map((t) => [t.slug, t]));
  const entitiesById = new Map<string, PortfolioEntityRow>(
    entityRows.map((e) => [e.id, e]),
  );

  const resourcesBy = new Map<string, typeof resources>();
  for (const r of resources) {
    const list = resourcesBy.get(r.pieceId) ?? [];
    list.push(r);
    resourcesBy.set(r.pieceId, list);
  }

  const tagsBy = new Map<string, string[]>();
  for (const t of tags) {
    const list = tagsBy.get(t.pieceId) ?? [];
    list.push(t.tagSlug);
    tagsBy.set(t.pieceId, list);
  }

  const linksBy = new Map<string, typeof links>();
  for (const l of links) {
    const list = linksBy.get(l.pieceId) ?? [];
    list.push(l);
    linksBy.set(l.pieceId, list);
  }

  return pieces.map((piece) => {
    const parent =
      piece.projectId && parents.has(piece.projectId)
        ? parents.get(piece.projectId)!
        : null;

    return {
      id: piece.id,
      slug: piece.slug,
      title: mapLocalized(piece.title),
      alt: piece.alt,
      category: piece.category,
      origin: piece.origin,
      srcUrl: mediaUrl(piece.srcPath),
      fit: piece.fit,
      year: piece.year,
      detail: mapLocalized(piece.detail),
      href: piece.href,
      hrefLabel: mapLocalized(piece.hrefLabel),
      projectId: piece.projectId,
      project: parent
        ? {
            id: parent.id,
            slug: parent.slug,
            title: mapProjectTitle(parent),
          }
        : null,
      resources: (resourcesBy.get(piece.id) ?? []).map((r) => ({
        id: r.id,
        path: r.path,
        url: r.path ? mediaUrl(r.path) : null,
        kind: r.kind,
        label: mapLocalized(r.label),
        sortOrder: r.sortOrder,
      })),
      tags: (tagsBy.get(piece.id) ?? [])
        .map((slug) => {
          const row = tagsBySlug.get(slug);
          if (!row) return null;
          return {
            slug: row.slug,
            labelEs: row.labelEs,
            labelEn: row.labelEn,
            isNsfw: row.isNsfw === true,
          };
        })
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
      entities: (linksBy.get(piece.id) ?? []).map((l) => {
        const ent = entitiesById.get(l.entityId);
        return {
          entityId: l.entityId,
          relationRole: l.relationRole,
          isPrimary: l.isPrimary === true,
          sortOrder: l.sortOrder,
          entity: ent ? mapPublicEntitySummary(ent) : null,
        };
      }),
      sortOrder: piece.sortOrder,
    } satisfies PublicPieceSummary;
  });
}

/**
 * Public pieces only.
 * Excludes unpublished pieces and pieces whose parent project is not public
 * (e.g. MicroTime piece while project remains unpublished).
 */
export async function getPublicPiecesV2(
  filters: PublicPieceFilters = {},
): Promise<PublicPieceSummary[]> {
  const ds = await getDataSource();
  const rows = await ds.getRepository(PieceEntity).find({
    where: { published: true },
    order: { sortOrder: "ASC", id: "ASC" },
  });

  const parentIds = [
    ...new Set(
      rows.map((r) => r.projectId).filter((id): id is string => Boolean(id)),
    ),
  ];
  const parents = await loadPublicProjectRowsByIds(parentIds);

  let pieces = rows.filter((piece) => {
    const parent = piece.projectId ? parents.get(piece.projectId) ?? null : null;
    return isPublicPiece(piece, parent);
  });

  if (filters.standaloneOnly) {
    pieces = pieces.filter((p) => !p.projectId);
  }
  if (filters.category) {
    pieces = pieces.filter((p) => p.category === filters.category);
  }
  if (filters.origin) {
    pieces = pieces.filter((p) => p.origin === filters.origin);
  }
  if (filters.projectId) {
    pieces = pieces.filter((p) => p.projectId === filters.projectId);
  }

  if (filters.tag || filters.entityId) {
    const ids = pieces.map((p) => p.id);
    if (!ids.length) return [];

    if (filters.tag) {
      const tagRows = await ds.getRepository(PieceTagEntity).find({
        where: { pieceId: In(ids), tagSlug: filters.tag },
      });
      const allowed = new Set(tagRows.map((t) => t.pieceId));
      pieces = pieces.filter((p) => allowed.has(p.id));
    }

    if (filters.entityId) {
      const linkRows = await ds.getRepository(PieceEntityLinkEntity).find({
        where: { pieceId: In(ids), entityId: filters.entityId },
      });
      const allowed = new Set(linkRows.map((l) => l.pieceId));
      pieces = pieces.filter((p) => allowed.has(p.id));
    }
  }

  pieces = sortPieces(pieces, filters.sort ?? "default");
  return hydratePieces(pieces, parents);
}

export async function getPublicPieceBySlugV2(
  slug: string,
): Promise<PublicPieceSummary | null> {
  const ds = await getDataSource();
  const row = await ds.getRepository(PieceEntity).findOne({ where: { slug } });
  if (!row || row.published !== true) return null;

  const parents = row.projectId
    ? await loadPublicProjectRowsByIds([row.projectId])
    : new Map<string, ProjectRow>();
  const parent = row.projectId ? parents.get(row.projectId) ?? null : null;
  if (!isPublicPiece(row, parent)) return null;

  const [dto] = await hydratePieces([row], parents);
  return dto ?? null;
}
