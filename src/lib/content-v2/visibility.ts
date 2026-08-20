/**
 * Centralized public visibility rules for V2 read model (Phase 4B).
 * All public readers must use these helpers — never re-implement ad hoc.
 */
import type { PortfolioEntityRow, ProjectRow, PieceRow } from "@/db/entities-v2";

/** Entities that may appear on any public surface. */
export function isPublicEntity(row: Pick<PortfolioEntityRow, "visible">): boolean {
  return row.visible === true;
}

/** Home marquees / home entity strip. */
export function isHomeEntity(
  row: Pick<PortfolioEntityRow, "visible" | "showOnHome">,
): boolean {
  return row.visible === true && row.showOnHome === true;
}

/** Future Entity page eligibility (readers expose flag; do not invent routes). */
export function isEntityPageEligible(
  row: Pick<PortfolioEntityRow, "visible" | "pageEnabled">,
): boolean {
  return row.visible === true && row.pageEnabled === true;
}

/**
 * Absolute public rule for projects: unpublished never leaves public readers.
 * Callers cannot request published=false through public APIs.
 */
export function isPublicProject(
  row: Pick<ProjectRow, "published" | "status">,
): boolean {
  if (row.published !== true) return false;
  // Archived excluded from public lists until an explicit product decision.
  if (row.status === "archived") return false;
  return true;
}

export function isHomeProject(
  row: Pick<ProjectRow, "published" | "status" | "showOnHome">,
): boolean {
  return isPublicProject(row) && row.showOnHome === true;
}

/**
 * Piece must be published.
 * If linked to a project, that project must also be publicly visible
 * (prevents leaking unpublished parents such as MicroTime / Syllabi).
 */
export function isPublicPiece(
  piece: Pick<PieceRow, "published" | "projectId">,
  parentProject: Pick<ProjectRow, "published" | "status"> | null,
): boolean {
  if (piece.published !== true) return false;
  if (!piece.projectId) return true;
  if (!parentProject) return false;
  return isPublicProject(parentProject);
}

/** Stable home ordering: homeOrder ASC NULLS LAST, then sortOrder, then id. */
export function compareHomeOrder(
  a: { homeOrder: number | null; sortOrder: number; id: string },
  b: { homeOrder: number | null; sortOrder: number; id: string },
): number {
  const ah = a.homeOrder;
  const bh = b.homeOrder;
  if (ah == null && bh != null) return 1;
  if (ah != null && bh == null) return -1;
  if (ah != null && bh != null && ah !== bh) return ah - bh;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}
