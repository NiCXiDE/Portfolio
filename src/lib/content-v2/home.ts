/**
 * Home-specific V2 adapter (Phase 4C.2).
 *
 * Transforms 4B public readers into a Home-shaped payload.
 * NOT wired to HomeLayer / layout / feature flags yet.
 *
 * Does not query legacy tables or named_list_items.
 */
import type { Locale } from "@/i18n/config";
import type { EntityType, ProjectStatus } from "@/db/entities-v2";
import { getHomeEntitiesV2 } from "./entities";
import { getHomeProjectsV2 } from "./projects";
import { getPublicTestimonialsV2 } from "./testimonials";
import { pickLocalized } from "./map";
import { compareHomeOrder } from "./visibility";
import type {
  PublicEntitySummary,
  PublicProjectSummary,
  PublicTestimonial,
} from "./types";

/** Explicit public URL only — never invent /entidades, /marcas, or relative hubs. */
export function publicExternalHref(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}

export type HomeEntityItemV2 = {
  id: string;
  slug: string;
  label: string;
  type: EntityType;
  logoUrl: string | null;
  /** External URL from Entity.href when present; never a generated Entity page. */
  href: string | null;
  homeOrder: number | null;
};

export type HomeProjectItemV2 = {
  id: string;
  slug: string;
  /** Localized display title (marquee label). */
  label: string;
  title: string;
  status: Exclude<ProjectStatus, "archived">;
  homeOrder: number | null;
  /** Visible client (or first visible related entity) name; null if none. */
  clientLabel: string | null;
  coverUrl: string | null;
  /** Explicit external project link only; never a generated Project route. */
  href: string | null;
};

export type HomeTestimonialItemV2 = {
  id: string;
  name: string;
  imageUrl: string;
  quote: string;
  role: string;
  organization: {
    name: string;
    logoUrl: string | null;
    href: string | null;
    linkLabel: string | null;
  };
  sortOrder: number;
};

export type HomeContentV2 = {
  locale: Locale;
  entities: HomeEntityItemV2[];
  pastProjects: HomeProjectItemV2[];
  currentProjects: HomeProjectItemV2[];
  testimonials: HomeTestimonialItemV2[];
};

function entityDisplayLabel(entity: PublicEntitySummary): string {
  const short = entity.shortName?.trim();
  if (short) return short;
  return entity.name.trim();
}

function mapEntity(entity: PublicEntitySummary): HomeEntityItemV2 {
  return {
    id: entity.id,
    slug: entity.slug,
    label: entityDisplayLabel(entity),
    type: entity.type,
    logoUrl: entity.logoUrl,
    // pageEnabled must NOT invent /entidades/[slug]
    href: publicExternalHref(entity.href),
    homeOrder: entity.homeOrder,
  };
}

function projectExternalHref(project: PublicProjectSummary): string | null {
  const links = project.links;
  if (!Array.isArray(links)) return null;
  for (const entry of links) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    for (const key of ["href", "url", "src"] as const) {
      const candidate = record[key];
      if (typeof candidate === "string") {
        const href = publicExternalHref(candidate);
        if (href) return href;
      }
    }
  }
  return null;
}

function projectClientLabel(project: PublicProjectSummary): string | null {
  const withEntity = project.entities.filter((link) => link.entity != null);
  const client = withEntity.find((link) => link.relationRole === "client");
  const chosen = client ?? withEntity[0];
  if (!chosen?.entity) return null;
  return entityDisplayLabel(chosen.entity);
}

function mapProject(
  project: PublicProjectSummary,
  locale: Locale,
): HomeProjectItemV2 | null {
  if (project.status === "archived") return null;
  if (project.status !== "completed" && project.status !== "ongoing") {
    return null;
  }
  const title = pickLocalized(project.title, locale);
  return {
    id: project.id,
    slug: project.slug,
    label: title,
    title,
    status: project.status,
    homeOrder: project.homeOrder,
    clientLabel: projectClientLabel(project),
    coverUrl: project.coverUrl,
    href: projectExternalHref(project),
  };
}

function compareHomeItems(
  a: { homeOrder: number | null; id: string },
  b: { homeOrder: number | null; id: string },
): number {
  return compareHomeOrder(
    { homeOrder: a.homeOrder, sortOrder: 0, id: a.id },
    { homeOrder: b.homeOrder, sortOrder: 0, id: b.id },
  );
}

/**
 * Pure split + map for Home projects (testable without DB).
 * Section from status only; order from homeOrder within section.
 */
export function splitHomeProjectsV2(
  projects: PublicProjectSummary[],
  locale: Locale,
): {
  pastProjects: HomeProjectItemV2[];
  currentProjects: HomeProjectItemV2[];
} {
  const past: HomeProjectItemV2[] = [];
  const current: HomeProjectItemV2[] = [];

  for (const project of projects) {
    const item = mapProject(project, locale);
    if (!item) continue;
    if (item.status === "completed") past.push(item);
    else if (item.status === "ongoing") current.push(item);
  }

  past.sort(compareHomeItems);
  current.sort(compareHomeItems);
  return { pastProjects: past, currentProjects: current };
}

function mapTestimonial(
  row: PublicTestimonial,
  locale: Locale,
): HomeTestimonialItemV2 {
  const fromEntity = row.entity;
  const legacy = row.legacyCompany;

  const name = fromEntity
    ? entityDisplayLabel(fromEntity)
    : (legacy?.name?.trim() || "");
  const logoUrl = fromEntity?.logoUrl ?? legacy?.logoUrl ?? null;
  const href = publicExternalHref(fromEntity?.href ?? legacy?.href ?? null);
  const linkLabel = pickLocalized(row.linkLabel, locale) || null;

  return {
    id: row.id,
    name: row.name,
    imageUrl: row.imageUrl,
    quote: pickLocalized(row.quote, locale),
    role: pickLocalized(row.role, locale),
    organization: {
      name,
      logoUrl,
      href,
      linkLabel: href ? linkLabel : null,
    },
    sortOrder: row.sortOrder,
  };
}

/** Pure assembly from already-fetched 4B DTOs (unit-test friendly). */
export function buildHomeContentV2(
  locale: Locale,
  input: {
    entities: PublicEntitySummary[];
    projects: PublicProjectSummary[];
    testimonials: PublicTestimonial[];
  },
): HomeContentV2 {
  const entities = [...input.entities]
    .sort(compareHomeItems)
    .map(mapEntity);

  const { pastProjects, currentProjects } = splitHomeProjectsV2(
    input.projects,
    locale,
  );

  const testimonials = [...input.testimonials]
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.id.localeCompare(b.id);
    })
    .map((row) => mapTestimonial(row, locale));

  return {
    locale,
    entities,
    pastProjects,
    currentProjects,
    testimonials,
  };
}

/**
 * Home V2 payload for a locale.
 * Uses only 4B public readers — no legacy named_list_items.
 */
export async function getHomeContentV2(
  locale: Locale,
): Promise<HomeContentV2> {
  const [entities, projects, testimonials] = await Promise.all([
    getHomeEntitiesV2(),
    getHomeProjectsV2(),
    getPublicTestimonialsV2(),
  ]);

  return buildHomeContentV2(locale, { entities, projects, testimonials });
}
