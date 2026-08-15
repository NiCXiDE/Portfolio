import { In } from "typeorm";
import { getDataSource } from "@/db/data-source";
import {
  PortfolioEntity,
  ProjectAreaEntity,
  ProjectEntity,
  ProjectEntityLinkEntity,
  ProjectResourceEntity,
  ProjectRoleEntity,
  type PortfolioEntityRow,
  type ProjectArea,
  type ProjectRow,
} from "@/db/entities-v2";
import { mediaUrl } from "@/lib/media";
import { mapLocalized, mapProjectTitle, mapPublicEntitySummary } from "./map";
import type {
  PublicProjectFilters,
  PublicProjectSummary,
  PublicSortMode,
} from "./types";
import { compareHomeOrder, isPublicProject } from "./visibility";

function sortProjects(
  rows: ProjectRow[],
  mode: PublicSortMode | undefined,
): ProjectRow[] {
  const copy = [...rows];
  switch (mode) {
    case "home":
      return copy.sort(compareHomeOrder);
    case "az":
      return copy.sort((a, b) =>
        (a.title?.es || a.slug).localeCompare(b.title?.es || b.slug, "es"),
      );
    case "za":
      return copy.sort((a, b) =>
        (b.title?.es || b.slug).localeCompare(a.title?.es || a.slug, "es"),
      );
    case "newest":
      return copy.sort((a, b) => {
        const ay = a.endYear ?? a.startYear ?? 0;
        const by = b.endYear ?? b.startYear ?? 0;
        if (by !== ay) return by - ay;
        const am = a.endMonth ?? a.startMonth ?? 0;
        const bm = b.endMonth ?? b.startMonth ?? 0;
        if (bm !== am) return bm - am;
        return a.id.localeCompare(b.id);
      });
    case "oldest":
      return copy.sort((a, b) => {
        const ay = a.startYear ?? a.endYear ?? 9999;
        const by = b.startYear ?? b.endYear ?? 9999;
        if (ay !== by) return ay - by;
        const am = a.startMonth ?? a.endMonth ?? 0;
        const bm = b.startMonth ?? b.endMonth ?? 0;
        if (am !== bm) return am - bm;
        return a.id.localeCompare(b.id);
      });
    default:
      return copy.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.id.localeCompare(b.id);
      });
  }
}

async function hydrateProjects(
  projects: ProjectRow[],
): Promise<PublicProjectSummary[]> {
  if (!projects.length) return [];

  const ds = await getDataSource();
  const ids = projects.map((p) => p.id);

  const [areas, roles, links, resources, entityRows] = await Promise.all([
    ds.getRepository(ProjectAreaEntity).find({
      where: { projectId: In(ids) },
    }),
    ds.getRepository(ProjectRoleEntity).find({
      where: { projectId: In(ids) },
    }),
    ds.getRepository(ProjectEntityLinkEntity).find({
      where: { projectId: In(ids) },
    }),
    ds.getRepository(ProjectResourceEntity).find({
      where: { projectId: In(ids) },
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(PortfolioEntity).find({
      where: { visible: true },
    }),
  ]);

  const entitiesById = new Map<string, PortfolioEntityRow>(
    entityRows.map((e) => [e.id, e]),
  );

  const areasBy = new Map<string, ProjectArea[]>();
  for (const a of areas) {
    const list = areasBy.get(a.projectId) ?? [];
    list.push(a.area);
    areasBy.set(a.projectId, list);
  }

  const rolesMap = new Map<string, string[]>();
  for (const r of roles) {
    const list = rolesMap.get(r.projectId) ?? [];
    list.push(r.role);
    rolesMap.set(r.projectId, list);
  }

  const linksBy = new Map<string, typeof links>();
  for (const l of links) {
    const list = linksBy.get(l.projectId) ?? [];
    list.push(l);
    linksBy.set(l.projectId, list);
  }

  const resourcesBy = new Map<string, typeof resources>();
  for (const r of resources) {
    const list = resourcesBy.get(r.projectId) ?? [];
    list.push(r);
    resourcesBy.set(r.projectId, list);
  }

  return projects.map((project) => {
    const entityLinks = (linksBy.get(project.id) ?? []).map((l) => {
      const ent = entitiesById.get(l.entityId);
      return {
        entityId: l.entityId,
        relationRole: l.relationRole,
        entity: ent ? mapPublicEntitySummary(ent) : null,
      };
    });

    return {
      id: project.id,
      slug: project.slug,
      title: mapProjectTitle(project),
      summary: mapLocalized(project.summary),
      description: mapLocalized(project.description),
      status: project.status,
      type: project.type,
      context: project.context,
      coverUrl: project.coverPath ? mediaUrl(project.coverPath) : null,
      links: project.links,
      featured: project.featured === true,
      showOnHome: project.showOnHome === true,
      homeOrder: project.homeOrder,
      startYear: project.startYear,
      startMonth: project.startMonth,
      endYear: project.endYear,
      endMonth: project.endMonth,
      dateLabel: mapLocalized(project.dateLabel),
      areas: areasBy.get(project.id) ?? [],
      roles: (rolesMap.get(project.id) ?? []) as PublicProjectSummary["roles"],
      entities: entityLinks,
      resources: (resourcesBy.get(project.id) ?? []).map((r) => ({
        id: r.id,
        path: r.path,
        url: r.path ? mediaUrl(r.path) : null,
        kind: r.kind,
        frame: r.frame,
        label: mapLocalized(r.label),
        sortOrder: r.sortOrder,
      })),
    } satisfies PublicProjectSummary;
  });
}

/**
 * All public projects. `published=false` and `archived` are never returned.
 * Filters cannot request unpublished.
 */
export async function getPublicProjectsV2(
  filters: PublicProjectFilters = {},
): Promise<PublicProjectSummary[]> {
  const ds = await getDataSource();
  const rows = await ds.getRepository(ProjectEntity).find({
    where: { published: true },
    order: { sortOrder: "ASC", id: "ASC" },
  });

  let projects = rows.filter(isPublicProject);

  if (filters.showOnHome === true) {
    projects = projects.filter((p) => p.showOnHome === true);
  }
  if (filters.featured === true) {
    projects = projects.filter((p) => p.featured === true);
  }
  if (filters.status) {
    projects = projects.filter((p) => p.status === filters.status);
  }

  if (filters.area || filters.entityId) {
    const ids = projects.map((p) => p.id);
    if (!ids.length) return [];

    if (filters.area) {
      const areaRows = await ds.getRepository(ProjectAreaEntity).find({
        where: { projectId: In(ids), area: filters.area },
      });
      const allowed = new Set(areaRows.map((a) => a.projectId));
      projects = projects.filter((p) => allowed.has(p.id));
    }

    if (filters.entityId) {
      const linkRows = await ds.getRepository(ProjectEntityLinkEntity).find({
        where: { projectId: In(ids), entityId: filters.entityId },
      });
      const allowed = new Set(linkRows.map((l) => l.projectId));
      projects = projects.filter((p) => allowed.has(p.id));
    }
  }

  projects = sortProjects(projects, filters.sort ?? "default");
  return hydrateProjects(projects);
}

export async function getHomeProjectsV2(): Promise<PublicProjectSummary[]> {
  return getPublicProjectsV2({ showOnHome: true, sort: "home" });
}

export async function getPublicProjectBySlugV2(
  slug: string,
): Promise<PublicProjectSummary | null> {
  const ds = await getDataSource();
  const row = await ds.getRepository(ProjectEntity).findOne({ where: { slug } });
  if (!row || !isPublicProject(row)) return null;
  const [dto] = await hydrateProjects([row]);
  return dto ?? null;
}

/** Internal helper for piece parent checks (same visibility rules). */
export async function loadPublicProjectRowsByIds(
  ids: string[],
): Promise<Map<string, ProjectRow>> {
  if (!ids.length) return new Map();
  const ds = await getDataSource();
  const rows = await ds.getRepository(ProjectEntity).find({
    where: { id: In(ids), published: true },
  });
  const map = new Map<string, ProjectRow>();
  for (const row of rows) {
    if (isPublicProject(row)) map.set(row.id, row);
  }
  return map;
}
