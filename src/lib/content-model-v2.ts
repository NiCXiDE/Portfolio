import type {
  EntityType,
  MigrationMapTargetType,
  PieceCategory,
  PieceOrigin,
  ProjectArea,
  ProjectContext,
  ProjectEntityRelationRole,
  ProjectRole,
  ProjectStatus,
} from "@/db/entities-v2";

export const ENTITY_TYPES = [
  "company",
  "institution",
  "association",
  "brand",
  "personal_brand",
  "person",
  "organization",
  "collective",
  "other",
] as const satisfies readonly EntityType[];

export const PROJECT_STATUSES = [
  "ongoing",
  "completed",
  "archived",
] as const satisfies readonly ProjectStatus[];

export const PROJECT_AREAS = [
  "graphic",
  "ux-ui",
] as const satisfies readonly ProjectArea[];

export const PROJECT_CONTEXTS = [
  "client-work",
  "internal-work",
  "presale",
  "demo",
  "personal",
  "other",
] as const satisfies readonly ProjectContext[];

export const PROJECT_ROLES = [
  "ux",
  "ui",
  "graphic-design",
  "branding",
  "visual-direction",
  "frontend",
  "other",
] as const satisfies readonly ProjectRole[];

export const PROJECT_ENTITY_RELATION_ROLES = [
  "client",
  "employer",
  "collaborator",
  "intermediary",
  "brand-owner",
  "responsible",
  "other",
] as const satisfies readonly ProjectEntityRelationRole[];

export const PIECE_CATEGORIES = [
  "visual-identity",
  "illustration-artwork",
  "campaigns-communication",
  "print",
  "other",
] as const satisfies readonly PieceCategory[];

export const PIECE_ORIGINS = [
  "personal",
  "client",
  "other",
] as const satisfies readonly PieceOrigin[];

export const MIGRATION_MAP_TARGET_TYPES = [
  "entity",
  "project",
  "piece",
  "resource",
] as const satisfies readonly MigrationMapTargetType[];

export const MIGRATION_REPORT_OUTCOMES = [
  "skipped",
  "ambiguous",
] as const satisfies readonly ("skipped" | "ambiguous")[];

export function isEntityType(value: string): value is EntityType {
  return (ENTITY_TYPES as readonly string[]).includes(value);
}

export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}

export function isProjectArea(value: string): value is ProjectArea {
  return (PROJECT_AREAS as readonly string[]).includes(value);
}

export function isProjectContext(value: string): value is ProjectContext {
  return (PROJECT_CONTEXTS as readonly string[]).includes(value);
}

export function isProjectRole(value: string): value is ProjectRole {
  return (PROJECT_ROLES as readonly string[]).includes(value);
}

export function isProjectEntityRelationRole(
  value: string,
): value is ProjectEntityRelationRole {
  return (PROJECT_ENTITY_RELATION_ROLES as readonly string[]).includes(value);
}

export function isPieceCategory(value: string): value is PieceCategory {
  return (PIECE_CATEGORIES as readonly string[]).includes(value);
}

export function isMigrationMapTargetType(
  value: string,
): value is MigrationMapTargetType {
  return (MIGRATION_MAP_TARGET_TYPES as readonly string[]).includes(value);
}

/** Validate optional month (1-12) used on projects. */
export function isValidMonth(month: number | null | undefined): boolean {
  if (month == null) return true;
  return Number.isInteger(month) && month >= 1 && month <= 12;
}

/** Validate optional year used on projects. */
export function isValidYear(year: number | null | undefined): boolean {
  if (year == null) return true;
  return Number.isInteger(year) && year >= 1900 && year <= 2100;
}

export function validateProjectDates(input: {
  startYear?: number | null;
  startMonth?: number | null;
  endYear?: number | null;
  endMonth?: number | null;
}): boolean {
  if (!isValidYear(input.startYear) || !isValidYear(input.endYear)) {
    return false;
  }
  if (!isValidMonth(input.startMonth) || !isValidMonth(input.endMonth)) {
    return false;
  }

  const { startYear, startMonth, endYear, endMonth } = input;
  if (startYear == null || endYear == null) return true;

  if (endYear > startYear) return true;
  if (endYear < startYear) return false;

  if (startMonth == null || endMonth == null) return true;
  return endMonth >= startMonth;
}
