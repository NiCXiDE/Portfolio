/**
 * READ-ONLY 4C.0B — Home project semantic reconciliation against LIVE portfolio.
 * No UPDATE / INSERT / DELETE.
 *
 * Usage: npx tsx scripts/inspect-home-readiness-4c0b.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

delete process.env.DATABASE_NAME;
delete process.env.V2_APPLY_APPROVED;
delete process.env.V2_REHEARSAL_APPROVED;

type NamedRow = {
  id: string;
  kind: string;
  label: string | null;
  brand_id: string | null;
  sort_order: number;
};

type ProjectRow = {
  id: string;
  slug: string;
  title_es: string | null;
  title_en: string | null;
  published: number;
  status: string;
  show_on_home: number;
  home_order: number | null;
  sort_order: number;
  cover_path: string | null;
};

type MapRow = {
  source_table: string;
  source_id: string;
  target_type: string;
  target_id: string;
  notes: string | null;
};

type LinkRow = {
  project_id: string;
  entity_id: string;
  relation_role: string;
};

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  console.log(`database=${db}`);
  if (db !== "portfolio") {
    throw new Error(`ABORT: expected portfolio, got ${db}`);
  }

  const named = (await ds.query(
    `SELECT id, kind, label, brand_id, sort_order
     FROM named_list_items
     WHERE kind IN ('past_project', 'current_project', 'company')
     ORDER BY kind, sort_order ASC, id ASC`,
  )) as NamedRow[];

  const past = named.filter((n) => n.kind === "past_project");
  const current = named.filter((n) => n.kind === "current_project");
  const companies = named.filter((n) => n.kind === "company");

  const projects = (await ds.query(
    `SELECT id, slug,
            JSON_UNQUOTE(JSON_EXTRACT(title, '$.es')) AS title_es,
            JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) AS title_en,
            published, status, show_on_home, home_order, sort_order, cover_path
     FROM projects
     ORDER BY id`,
  )) as ProjectRow[];

  const byId = new Map(projects.map((p) => [p.id, p]));
  const bySlug = new Map(projects.map((p) => [p.slug, p]));

  const maps = (await ds.query(
    `SELECT source_table, source_id, target_type, target_id, notes
     FROM migration_map
     WHERE source_table IN ('named_list_items', 'ui_list_items', 'ui_projects')
        OR target_id LIKE '%templeton%'
        OR source_id LIKE '%templeton%'
     ORDER BY source_table, source_id`,
  )) as MapRow[];

  const templetonMaps = maps.filter(
    (m) =>
      m.source_id.toLowerCase().includes("templeton") ||
      m.target_id.toLowerCase().includes("templeton"),
  );

  const templetonProjects = projects.filter(
    (p) =>
      p.id.includes("templeton") ||
      p.slug.includes("templeton") ||
      (p.title_es || "").toLowerCase().includes("templeton") ||
      (p.title_en || "").toLowerCase().includes("templeton"),
  );

  const templetonEntities = (await ds.query(
    `SELECT id, slug, type, visible, show_on_home, page_enabled, name, short_name
     FROM entities
     WHERE id LIKE '%templeton%' OR slug LIKE '%templeton%'`,
  )) as Array<Record<string, unknown>>;

  const links = (await ds.query(
    `SELECT project_id, entity_id, relation_role
     FROM project_entities
     WHERE entity_id LIKE '%templeton%'
        OR project_id LIKE '%templeton%'`,
  )) as LinkRow[];

  // Heuristic map legacy named id / label → project id
  const labelHints: Record<string, string[]> = {
    "adapto pay": ["adapto-pay"],
    "asesor financiero": ["asesor-financiero"],
    athenas: [],
    casiba: ["casiba"],
    clearwater: ["clearwater"],
    cloronor: ["cloronor-trading"],
    "expedición polo": ["expedicion-polo"],
    "expedicion polo": ["expedicion-polo"],
    "fiserv.": [],
    inspector: [],
    "juegos provinciales tecnológicos": ["juegos-provinciales"],
    "la estación": [],
    "mental tech training": ["mental-training-tech-24-5"],
    "omni group": ["omnigroup"],
    proxi: ["proxi"],
    simaas: ["simaas-marketplace"],
    "templeton & matthews": ["templeton-digital-transformation-assessment"],
    "templeton & mathews": ["templeton-digital-transformation-assessment"],
    concitar: ["concitar"],
    microtime: ["microtime"],
    "repuestos carlitos": ["repuestos-carlitos"],
    sessions: ["sessions"],
    syllabi: ["syllabi"],
    taily: ["taily"],
  };

  function resolveProject(item: NamedRow): {
    project: ProjectRow | null;
    resolveNote: string;
  } {
    const mapHit = maps.find(
      (m) =>
        m.source_table === "named_list_items" &&
        m.source_id === item.id &&
        m.target_type === "project",
    );
    if (mapHit && byId.has(mapHit.target_id)) {
      return {
        project: byId.get(mapHit.target_id)!,
        resolveNote: `migration_map named_list_items:${item.id}`,
      };
    }
    if (byId.has(item.id)) {
      return { project: byId.get(item.id)!, resolveNote: "id==project.id" };
    }
    if (bySlug.has(item.id)) {
      return { project: bySlug.get(item.id)!, resolveNote: "id==project.slug" };
    }
    const labelKey = (item.label || "").trim().toLowerCase();
    const hints = labelHints[labelKey] || [];
    for (const h of hints) {
      if (byId.has(h)) {
        return { project: byId.get(h)!, resolveNote: `label hint → ${h}` };
      }
    }
    // fuzzy title
    const needle = labelKey.replace(/[.&]/g, "").trim();
    if (needle.includes("templeton")) {
      const t = byId.get("templeton-digital-transformation-assessment");
      if (t) {
        return {
          project: t,
          resolveNote: "templeton label → templeton-digital-transformation-assessment",
        };
      }
    }
    const fuzzy = projects.find((p) => {
      const te = (p.title_es || "").toLowerCase();
      const tn = (p.title_en || "").toLowerCase();
      return te.includes(needle) || tn.includes(needle) || needle.includes(p.id);
    });
    if (fuzzy) {
      return { project: fuzzy, resolveNote: "fuzzy title/id" };
    }
    return { project: null, resolveNote: "UNRESOLVED" };
  }

  function sectionFromStatus(status: string): "current" | "past" | "none" {
    if (status === "ongoing") return "current";
    if (status === "completed") return "past";
    return "none"; // archived or other
  }

  const pastResolved = past.map((item) => {
    const { project, resolveNote } = resolveProject(item);
    return {
      legacyKind: "past_project" as const,
      legacyId: item.id,
      legacyLabel: item.label,
      legacySort: item.sort_order,
      brandId: item.brand_id,
      projectId: project?.id ?? null,
      published: project ? !!project.published : null,
      status: project?.status ?? null,
      showOnHome: project ? !!project.show_on_home : null,
      homeOrder: project?.home_order ?? null,
      resolveNote,
      v2Section: project ? sectionFromStatus(project.status) : null,
      conflict:
        project && sectionFromStatus(project.status) === "current"
          ? "LEGACY_PAST_BUT_V2_ONGOING"
          : project && project.status === "archived"
            ? "ARCHIVED"
            : null,
    };
  });

  const currentResolved = current.map((item) => {
    const { project, resolveNote } = resolveProject(item);
    return {
      legacyKind: "current_project" as const,
      legacyId: item.id,
      legacyLabel: item.label,
      legacySort: item.sort_order,
      brandId: item.brand_id,
      projectId: project?.id ?? null,
      published: project ? !!project.published : null,
      status: project?.status ?? null,
      showOnHome: project ? !!project.show_on_home : null,
      homeOrder: project?.home_order ?? null,
      resolveNote,
      v2Section: project ? sectionFromStatus(project.status) : null,
      conflict:
        project && sectionFromStatus(project.status) === "past"
          ? "LEGACY_CURRENT_BUT_V2_COMPLETED"
          : project && project.status === "archived"
            ? "ARCHIVED"
            : null,
    };
  });

  const companyOrder = companies.map((c, i) => ({
    index: i,
    id: c.id,
    label: c.label,
    brandId: c.brand_id,
    sort: c.sort_order,
  }));

  const homeEntityIds = [
    "aicore",
    "apsmm",
    "citf",
    "ludica",
    "orbita-l-b",
    "push",
  ];
  // Order among home entities as they appear in legacy company list
  const homeEntityLegacyOrder: string[] = [];
  for (const c of companies) {
    const label = (c.label || "").toLowerCase();
    const bid = c.brand_id;
    let hit: string | null = null;
    if (bid && homeEntityIds.includes(bid)) hit = bid;
    else if (label.includes("aicore")) hit = "aicore";
    else if (label.includes("apsmm") || label.includes("asociación"))
      hit = "apsmm";
    else if (label.includes("citf")) hit = "citf";
    else if (label.includes("lúdica") || label.includes("ludica"))
      hit = "ludica";
    else if (label.includes("órbita") || label.includes("orbita"))
      hit = "orbita-l-b";
    else if (label.includes("push")) hit = "push";
    if (hit && !homeEntityLegacyOrder.includes(hit)) {
      homeEntityLegacyOrder.push(hit);
    }
  }

  console.log(
    JSON.stringify(
      {
        database: db,
        counts: {
          past: past.length,
          current: current.length,
          companies: companies.length,
          projects: projects.length,
        },
        templeton: {
          projects: templetonProjects,
          entities: templetonEntities,
          links,
          migrationMaps: templetonMaps,
          legacyPastItem: past.find((p) =>
            (p.label || "").toLowerCase().includes("templeton"),
          ),
        },
        pastResolved,
        currentResolved,
        conflicts: [...pastResolved, ...currentResolved].filter(
          (r) => r.conflict,
        ),
        homeEntityLegacyOrder,
        companyOrderSample: companyOrder.slice(0, 25),
        proposedEleven: [
          "adapto-pay",
          "casiba",
          "clearwater",
          "cloronor-trading",
          "expedicion-polo",
          "juegos-provinciales",
          "mental-training-tech-24-5",
          "omnigroup",
          "concitar",
          "repuestos-carlitos",
          "taily",
        ].map((id) => {
          const p = byId.get(id);
          return p
            ? {
                id: p.id,
                published: !!p.published,
                status: p.status,
                showOnHome: !!p.show_on_home,
                homeOrder: p.home_order,
                cover: p.cover_path,
                v2Section: sectionFromStatus(p.status),
              }
            : { id, missing: true };
        }),
        templetonCandidate: byId.get(
          "templeton-digital-transformation-assessment",
        ),
      },
      null,
      2,
    ),
  );

  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
