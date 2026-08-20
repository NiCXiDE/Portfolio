/**
 * READ-ONLY Interfaces V2 runtime audit (Phase 4E.0).
 * Usage: tsx scripts/inspect-interfaces-audit-4e0.ts
 */
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { migrationDecisions } from "./migrate-v2/decisions";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const PUBLIC_ROOT = resolve(process.cwd(), "public");

function assetExists(path: string | null | undefined): boolean {
  if (!path) return false;
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return existsSync(join(PUBLIC_ROOT, rel));
}

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  type UiProject = {
    id: string;
    category: string;
    title: object;
    published: number;
    brand_id: string | null;
    sort_order: number;
    images: unknown;
    prototype_url: string | null;
  };
  type UiList = {
    id: string;
    title: object;
    published: number;
    logo_path: string | null;
    caption: string | null;
    wordmark: string | null;
    sort_order: number;
  };

  const uiProjects = (await ds.query(
    "SELECT id, category, title, published, brand_id, sort_order, images, prototype_url FROM ui_projects ORDER BY sort_order, id",
  )) as UiProject[];
  const uiList = (await ds.query(
    "SELECT id, title, published, logo_path, caption, wordmark, sort_order FROM ui_list_items ORDER BY sort_order, id",
  )) as UiList[];

  const uxUiProjects = (await ds.query(`
    SELECT p.id, p.slug, p.title, p.published, p.status, p.context, p.type,
           p.cover_path, p.featured, p.show_on_home, p.home_order, p.sort_order, p.links
    FROM projects p
    INNER JOIN project_areas pa ON pa.project_id = p.id AND pa.area = 'ux-ui'
    ORDER BY p.sort_order, p.id
  `)) as Array<Record<string, unknown>>;

  const mixedArea = (await ds.query(`
    SELECT p.id, GROUP_CONCAT(pa.area ORDER BY pa.area) AS areas
    FROM projects p
    INNER JOIN project_areas pa ON pa.project_id = p.id
    WHERE p.published = 1 AND p.status != 'archived'
    GROUP BY p.id
    HAVING SUM(pa.area = 'ux-ui') > 0 AND SUM(pa.area = 'graphic') > 0
    ORDER BY p.id
  `)) as Array<{ id: string; areas: string }>;

  const resources = (await ds.query(`
    SELECT pr.project_id, pr.id, pr.path, pr.kind, pr.frame, pr.sort_order, pr.label
    FROM project_resources pr
    INNER JOIN project_areas pa ON pa.project_id = pr.project_id AND pa.area = 'ux-ui'
    ORDER BY pr.project_id, pr.sort_order, pr.id
  `)) as Array<Record<string, unknown>>;

  const roles = (await ds.query(`
    SELECT pr.project_id, pr.role
    FROM project_roles pr
    INNER JOIN project_areas pa ON pa.project_id = pr.project_id AND pa.area = 'ux-ui'
    ORDER BY pr.project_id, pr.role
  `)) as Array<{ project_id: string; role: string }>;

  const entities = (await ds.query(`
    SELECT pe.project_id, pe.entity_id, pe.relation_role, e.visible, e.name
    FROM project_entities pe
    INNER JOIN project_areas pa ON pa.project_id = pe.project_id AND pa.area = 'ux-ui'
    LEFT JOIN entities e ON e.id = pe.entity_id
    ORDER BY pe.project_id, pe.relation_role, pe.entity_id
  `)) as Array<Record<string, unknown>>;

  const homeShowOn = uxUiProjects.filter((p) => p.show_on_home === 1);

  // Mapping legacy ui_projects → V2 by id match in decisions
  const v2ByLegacyUiProject = new Map<string, string>();
  const v2ByLegacyUiList = new Map<string, string>();
  for (const p of migrationDecisions.projects) {
    for (const s of p.sources ?? []) {
      if (s.table === "ui_projects") v2ByLegacyUiProject.set(s.id, p.id);
      if (s.table === "ui_list_items") v2ByLegacyUiList.set(s.id, p.id);
    }
  }

  const mapping = uiProjects.map((row) => {
    const v2Id = v2ByLegacyUiProject.get(row.id) ?? null;
    const v2 = v2Id
      ? uxUiProjects.find((p) => p.id === v2Id)
      : null;
    let classification:
      | "MATCH"
      | "REPLACED_BY_V2_PROJECT"
      | "EXPECTED_DISCARDED"
      | "MISSING_V2"
      | "PRIVACY_EXCLUDED" = "MISSING_V2";

    if (v2Id && v2) {
      if (row.id !== v2Id) classification = "REPLACED_BY_V2_PROJECT";
      else if (v2.published === 0 || v2.published === false)
        classification = "PRIVACY_EXCLUDED";
      else if (
        migrationDecisions.projects.find((p) => p.id === v2Id)?.confidential
      )
        classification = "PRIVACY_EXCLUDED";
      else classification = "MATCH";
    } else if (
      migrationDecisions.discarded.some(
        (d) => d.legacyRef?.table === "ui_projects" && d.legacyRef.id === row.id,
      )
    ) {
      classification = "EXPECTED_DISCARDED";
    }

    return {
      legacyId: row.id,
      legacyPublished: row.published === 1,
      legacyCategory: row.category,
      v2Id,
      v2Published: v2?.published ?? null,
      classification,
    };
  });

  const listMapping = uiList.map((row) => {
    const v2Id = v2ByLegacyUiList.get(row.id) ?? null;
    const discarded = migrationDecisions.discarded.some((d) => d.id === row.id);
    return {
      legacyId: row.id,
      legacyPublished: row.published === 1,
      v2Id,
      classification: discarded
        ? "EXPECTED_DISCARDED"
        : v2Id
          ? "REPLACED_BY_V2_PROJECT"
          : "MISSING_V2",
    };
  });

  const publicSafeV2 = uxUiProjects.filter(
    (p) => p.published === 1 && p.status !== "archived",
  );

  const privacyAudit = uxUiProjects.map((p) => {
    const decision = migrationDecisions.projects.find((x) => x.id === p.id);
    const pub = p.published === 1;
    const archived = p.status === "archived";
    let bucket: "PUBLIC_SAFE" | "UNPUBLISHED_EXPECTED" | "PRIVACY_BLOCKED" | "OTHER";
    if (!pub || archived) {
      bucket =
        decision?.confidential || !decision?.published
          ? "UNPUBLISHED_EXPECTED"
          : "PRIVACY_BLOCKED";
    } else if (decision?.confidential) {
      bucket = "PRIVACY_BLOCKED";
    } else {
      bucket = "PUBLIC_SAFE";
    }
    return {
      id: p.id,
      published: pub,
      status: p.status,
      confidential: decision?.confidential ?? false,
      bucket,
    };
  });

  const resourcesByProject = new Map<string, typeof resources>();
  for (const r of resources) {
    const pid = r.project_id as string;
    const list = resourcesByProject.get(pid) ?? [];
    list.push(r);
    resourcesByProject.set(pid, list);
  }

  const assetGaps: Array<{
    projectId: string;
    resourceId: string;
    path: string;
    exists: boolean;
  }> = [];
  for (const r of resources) {
    const path = r.path as string | null;
    assetGaps.push({
      projectId: r.project_id as string,
      resourceId: r.id as string,
      path: path ?? "",
      exists: assetExists(path),
    });
  }
  for (const p of publicSafeV2) {
    const cover = p.cover_path as string | null;
    if (cover) {
      assetGaps.push({
        projectId: p.id as string,
        resourceId: "(cover)",
        path: cover,
        exists: assetExists(cover),
      });
    }
  }

  const missingAssets = assetGaps.filter((a) => a.path && !a.exists);

  const out = {
    database: db,
    counts: {
      legacyUiProjectsTotal: uiProjects.length,
      legacyUiProjectsPublic: uiProjects.filter((p) => p.published === 1).length,
      legacyUiListTotal: uiList.length,
      legacyUiListPublic: uiList.filter((p) => p.published === 1).length,
      v2UxUiCandidates: uxUiProjects.length,
      v2PublicSafe: publicSafeV2.length,
      v2MixedAreaPublic: mixedArea.length,
      v2ResourcesTotal: resources.length,
      v2ResourcesProjects: resourcesByProject.size,
    },
    mapping: {
      uiProjects: mapping,
      uiListItems: listMapping,
      summary: {
        match: mapping.filter((m) => m.classification === "MATCH").length,
        replaced: mapping.filter(
          (m) => m.classification === "REPLACED_BY_V2_PROJECT",
        ).length,
        discarded: mapping.filter(
          (m) => m.classification === "EXPECTED_DISCARDED",
        ).length,
        missing: mapping.filter((m) => m.classification === "MISSING_V2")
          .length,
        ambiguous: 0,
        privacyExcluded: mapping.filter(
          (m) => m.classification === "PRIVACY_EXCLUDED",
        ).length,
      },
    },
    privacy: privacyAudit,
    mixedAreaProjects: mixedArea,
    homeUxUiOverlap: homeShowOn.map((p) => ({
      id: p.id,
      showOnHome: true,
      homeOrder: p.home_order,
    })),
    resourcesByProject: Object.fromEntries(
      [...resourcesByProject.entries()].map(([id, rows]) => [
        id,
        {
          count: rows.length,
          paths: rows.map((r) => r.path),
          frames: rows.map((r) => r.frame),
        },
      ]),
    ),
    missingAssets,
    rolesByProject: Object.fromEntries(
      roles.reduce((acc, r) => {
        const list = acc.get(r.project_id) ?? [];
        list.push(r.role);
        acc.set(r.project_id, list);
        return acc;
      }, new Map<string, string[]>()),
    ),
    entitiesByProject: entities,
  };

  console.log(JSON.stringify(out, null, 2));
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
