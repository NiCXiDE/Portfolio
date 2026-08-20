/**
 * READ-ONLY Interfaces decision matrix (Phase 4E.0B).
 * Usage: npx tsx scripts/inspect-interfaces-decision-matrix-4e0b.ts
 */
import { config as loadEnv } from "dotenv";
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { migrationDecisions } from "./migrate-v2/decisions";
import { readFileSync } from "node:fs";

loadEnv({ path: resolve(process.cwd(), ".env") });
delete process.env.DATABASE_NAME;

const PUBLIC_ROOT = resolve(process.cwd(), "public");
const LEGACY_PROJECTS = JSON.parse(
  readFileSync(resolve("content/interfaces/projects.json"), "utf8"),
) as Array<Record<string, unknown>>;
const LEGACY_LIST = JSON.parse(
  readFileSync(resolve("content/interfaces/list.json"), "utf8"),
) as Array<Record<string, unknown>>;

const PRIVACY_EXCLUDED_IDS = [
  "aicore-inventariado",
  "aml-casinos",
  "aml-general",
  "asesor-financiero",
  "proxi",
];
const UNPUBLISHED_EXPECTED_IDS = [
  "confidential-logistics-system",
  "microtime",
  "proxi",
  "syllabi",
];

function pickTitle(title: unknown): { es: string; en: string } {
  const t = title as { es?: string; en?: string } | null;
  return { es: t?.es ?? "", en: t?.en ?? "" };
}

function assetExists(path: string | null | undefined): boolean {
  if (!path) return false;
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return existsSync(join(PUBLIC_ROOT, rel));
}

function listAssetsUnder(prefix: string): string[] {
  const dir = join(PUBLIC_ROOT, prefix.replace(/^\//, ""));
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  function walk(d: string, base: string) {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      const rel = join(base, name).replace(/\\/g, "/");
      if (statSync(full).isDirectory()) walk(full, rel);
      else if (/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(name))
        out.push("/" + rel);
    }
  }
  walk(dir, prefix.replace(/^\//, ""));
  return out;
}

function legacyUiProject(id: string) {
  return LEGACY_PROJECTS.find((p) => p.id === id);
}

function legacyUiList(id: string) {
  return LEGACY_LIST.find((p) => p.id === id);
}

function decisionFor(id: string) {
  return migrationDecisions.projects.find((p) => p.id === id);
}

async function main() {
  const { getDataSource } = await import("../src/db/data-source");
  const { getHomeProjectsV2 } = await import("../src/lib/content-v2/projects");
  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  if (db !== "portfolio") throw new Error(`ABORT db=${db}`);

  const homeProjects = await getHomeProjectsV2();
  const homeIds = new Set(homeProjects.map((p) => p.id));

  type Row = Record<string, unknown>;
  const allUxUi = (await ds.query(`
    SELECT p.id, p.slug, p.title, p.summary, p.published, p.status, p.context, p.type,
           p.cover_path, p.show_on_home, p.sort_order, p.start_year, p.end_year
    FROM projects p
    INNER JOIN project_areas pa ON pa.project_id = p.id AND pa.area = 'ux-ui'
    ORDER BY p.sort_order ASC, p.id ASC
  `)) as Row[];

  const resources = (await ds.query(`
    SELECT pr.project_id, pr.id, pr.path, pr.frame, pr.sort_order
    FROM project_resources pr
    INNER JOIN project_areas pa ON pa.project_id = pr.project_id AND pa.area = 'ux-ui'
    ORDER BY pr.project_id, pr.sort_order
  `)) as Row[];

  const entities = (await ds.query(`
    SELECT pe.project_id, pe.entity_id, pe.relation_role, e.name, e.visible
    FROM project_entities pe
    LEFT JOIN entities e ON e.id = pe.entity_id
    WHERE pe.project_id IN (SELECT project_id FROM project_areas WHERE area = 'ux-ui')
    ORDER BY pe.project_id, pe.relation_role
  `)) as Row[];

  const areas = (await ds.query(`
    SELECT project_id, area FROM project_areas
    WHERE project_id IN (SELECT project_id FROM project_areas WHERE area = 'ux-ui')
  `)) as Row[];

  const resByProject = new Map<string, Row[]>();
  for (const r of resources) {
    const pid = r.project_id as string;
    const list = resByProject.get(pid) ?? [];
    list.push(r);
    resByProject.set(pid, list);
  }

  const entByProject = new Map<string, Row[]>();
  for (const e of entities) {
    const pid = e.project_id as string;
    const list = entByProject.get(pid) ?? [];
    list.push(e);
    entByProject.set(pid, list);
  }

  const areasByProject = new Map<string, string[]>();
  for (const a of areas) {
    const pid = a.project_id as string;
    const list = areasByProject.get(pid) ?? [];
    list.push(a.area as string);
    areasByProject.set(pid, list);
  }

  function enrich(id: string) {
    const row = allUxUi.find((p) => p.id === id)!;
    const dec = decisionFor(id);
    const legacyP = legacyUiProject(id);
    const legacyL = legacyUiList(id);
    const title = pickTitle(row.title);
    const ents = entByProject.get(id) ?? [];
    return {
      id,
      titleEs: title.es,
      titleEn: title.en,
      published: row.published === 1,
      status: row.status,
      context: row.context,
      projectType: row.type,
      areas: areasByProject.get(id) ?? [],
      entities: ents.map((e) => ({
        id: e.entity_id,
        role: e.relation_role,
        name: e.name,
        visible: e.visible === 1,
      })),
      decisionConfidential: dec?.confidential ?? false,
      decisionPublished: dec?.published ?? null,
      sensitiveTitle:
        /confidencial|privado|aml|lavado|asesor|inventariado|logística|logistica/i.test(
          `${title.es} ${title.en}`,
        ) ||
        (dec?.confidential ?? false) ||
        ents.some((e) => String(e.entity_id).startsWith("confidential-")),
      inLegacyUiProject: Boolean(legacyP),
      legacyUiProjectPublished: legacyP ? true : null,
      inLegacyUiList: Boolean(legacyL),
      inHomeV2: homeIds.has(id),
      coverPath: (row.cover_path as string) ?? null,
      coverExists: assetExists(row.cover_path as string),
      resourceCount: resByProject.get(id)?.length ?? 0,
      sortOrder: row.sort_order,
    };
  }

  // Privacy reconciliation
  const privacyReconcileIds = [
    ...new Set([...PRIVACY_EXCLUDED_IDS, ...UNPUBLISHED_EXPECTED_IDS]),
  ];
  const privacyTable = privacyReconcileIds.map((id) => {
    const e = enrich(id);
    let bucket: string;
    if (!e.published) {
      bucket = e.decisionConfidential
        ? "UNPUBLISHED_EXPECTED"
        : "UNPUBLISHED_EXPECTED";
    } else if (e.decisionConfidential) {
      bucket = "CONFIDENTIAL_PUBLISHED";
    } else if (id === "proxi") {
      bucket = "UNPUBLISHED_IN_V2_LEGACY_STILL_PUBLIC";
    } else {
      bucket = "OTHER";
    }
    const note =
      id === "proxi"
        ? "4E.0 usó PRIVACY_EXCLUDED por mapping legacy→V2; en V2 published=false (deferred contractual). No es confidential flag — es unpublished."
        : undefined;
    return { ...e, reconcileBucket: bucket, reconcileNote: note };
  });

  // 15 public-safe: published + not archived + not confidential in manifest
  const publicSafe = allUxUi
    .filter((p) => {
      const id = p.id as string;
      const dec = decisionFor(id);
      if (p.published !== 1) return false;
      if (p.status === "archived") return false;
      if (dec?.confidential) return false;
      return true;
    })
    .sort(
      (a, b) =>
        (a.sort_order as number) - (b.sort_order as number) ||
        String(a.id).localeCompare(String(b.id)),
    );

  const publicSafe15 = publicSafe.map((p) => {
    const id = p.id as string;
    const e = enrich(id);
    // legacy list item by manifest sources
    let legacyListId: string | null = null;
    for (const proj of migrationDecisions.projects) {
      for (const s of proj.sources ?? []) {
        if (s.table === "ui_list_items" && proj.id === id)
          legacyListId = s.id;
      }
    }
    const mainVisual =
      e.coverPath && e.coverExists
        ? e.coverPath
        : e.resourceCount > 0
          ? (resByProject.get(id)?.[0]?.path as string)
          : null;
    return {
      ...e,
      legacyUiProjectId: e.inLegacyUiProject ? id : null,
      legacyUiListId: legacyListId,
      mainVisual,
      mainVisualExists: assetExists(mainVisual),
    };
  });

  const noResources8 = publicSafe15.filter((p) => p.resourceCount === 0);

  function auditNoResources(p: (typeof publicSafe15)[0]) {
    const id = p.id;
    const legacyP = legacyUiProject(id);
    const legacyL = legacyUiList(p.legacyUiListId ?? id);
    const legacyFromProject = legacyP as Record<string, unknown> | undefined;
    const legacyImages = legacyFromProject?.images;
    const legacyHasGallery =
      Array.isArray(legacyImages) && legacyImages.length > 0;
    const legacyLogo =
      (legacyL?.logo as string) ??
      (legacyL?.logo_path as string) ??
      (legacyFromProject?.logo as string);

    // Search disk by id slug
    const diskCandidates = [
      ...listAssetsUnder(`/assets/interfaces/projects`),
      ...listAssetsUnder(`/assets/interfaces`),
    ].filter(
      (path) =>
        path.toLowerCase().includes(id.replace(/-/g, "")) ||
        path.toLowerCase().includes(id) ||
        (p.legacyUiListId &&
          path.toLowerCase().includes(p.legacyUiListId.replace(/-/g, ""))),
    );

    let classification:
      | "RESOURCE_ALREADY_IN_LEGACY"
      | "RESOURCE_EXISTS_ON_DISK"
      | "COVER_ONLY_AVAILABLE"
      | "NO_VISUAL_RESOURCE";
    if (legacyHasGallery) classification = "RESOURCE_ALREADY_IN_LEGACY";
    else if (diskCandidates.length > 0)
      classification = "RESOURCE_EXISTS_ON_DISK";
    else if (p.coverPath && p.coverExists)
      classification = "COVER_ONLY_AVAILABLE";
    else if (legacyLogo && assetExists(legacyLogo as string))
      classification = "COVER_ONLY_AVAILABLE";
    else classification = "NO_VISUAL_RESOURCE";

    return {
      id,
      titleEs: p.titleEs,
      legacyUiProject: legacyP
        ? {
            id: legacyP.id,
            images: legacyImages,
            imageCount: Array.isArray(legacyImages) ? legacyImages.length : 0,
            prototypeUrl: legacyFromProject?.prototypeUrl ?? null,
          }
        : null,
      legacyUiList: legacyL
        ? {
            id: legacyL.id,
            logo: legacyL.logo ?? legacyL.logo_path ?? null,
            wordmark: legacyL.wordmark ?? null,
          }
        : null,
      v2Cover: p.coverPath,
      v2CoverExists: p.coverExists,
      diskCandidates: diskCandidates.slice(0, 20),
      diskCandidateCount: diskCandidates.length,
      classification,
    };
  }

  const noResourcesAudit = noResources8.map(auditNoResources);

  function detailReadiness(p: (typeof publicSafe15)[0]) {
    const n = p.resourceCount;
    const hasCover = Boolean(p.mainVisual && p.mainVisualExists);
    const legacyP = legacyUiProject(p.id);
    const legacyImages = (legacyP?.images as unknown[]) ?? [];
    let readiness:
      | "DETAIL_READY"
      | "DETAIL_POSSIBLE_WITH_BACKFILL"
      | "LISTING_ONLY_RECOMMENDED"
      | "NO_PUBLIC_DETAIL";
    let reason: string;
    if (n >= 2) {
      readiness = "DETAIL_READY";
      reason = `${n} project_resources — carousel viable`;
    } else if (n === 1) {
      readiness = "LISTING_ONLY_RECOMMENDED";
      reason = "1 resource — modal aporta poco vs listing+click";
    } else if (legacyImages.length >= 2) {
      readiness = "DETAIL_POSSIBLE_WITH_BACKFILL";
      reason = `0 V2 resources pero legacy tiene ${legacyImages.length} slides`;
    } else if (hasCover || legacyImages.length === 1) {
      readiness = "LISTING_ONLY_RECOMMENDED";
      reason = "solo cover o 1 imagen — preferir listing sin detail CTA";
    } else {
      readiness = "NO_PUBLIC_DETAIL";
      reason = "sin visual suficiente";
    }
    return { id: p.id, titleEs: p.titleEs, resourceCount: n, readiness, reason };
  }

  const detailByProject = publicSafe15.map(detailReadiness);

  // ui_list_items exact mapping
  const listMapping = LEGACY_LIST.map((item) => {
    const id = item.id as string;
    let v2Id: string | null = null;
    for (const proj of migrationDecisions.projects) {
      if (proj.sources?.some((s) => s.table === "ui_list_items" && s.id === id))
        v2Id = proj.id;
    }
    const discarded = [
      "push-landing",
      "orbita-landing",
      "ludica-landing",
      "b2b",
    ].includes(id);
    return {
      legacyId: id,
      titleEs: pickTitle(item.title).es,
      titleEn: pickTitle(item.title).en,
      v2ProjectId: v2Id,
      mapping: v2Id
        ? "REPLACED_BY_V2_PROJECT"
        : discarded
          ? "EXPECTED_DISCARDED"
          : "UNMAPPED",
      discardReason: discarded
        ? id === "b2b"
          ? "Duplica concepto PROXI (ui_projects.proxi); superficie list deprecated"
          : "Landing promocional — deprecated list surface; Home/Entity flags en su lugar"
        : null,
      inPublicSafe15: v2Id
        ? publicSafe15.some((p) => p.id === v2Id)
        : false,
    };
  });

  // Home consistency
  const homeOverlap = publicSafe15
    .filter((p) => p.inHomeV2)
    .map((p) => ({
      id: p.id,
      titleEs: p.titleEs,
      homeOrder: homeProjects.find((h) => h.id === p.id)?.homeOrder ?? null,
      sameCanonicalId: true,
    }));

  const privacyBlockedOnHome = ["sessions", ...PRIVACY_EXCLUDED_IDS]
    .filter((id) => id !== "proxi" || false)
    .map((id) => ({
      id,
      inHomeV2: homeIds.has(id),
      published: allUxUi.find((p) => p.id === id)?.published === 1,
      confidential: decisionFor(id)?.confidential ?? false,
    }));

  const out = {
    database: db,
    privacyReconciled: privacyTable,
    proxiClarification:
      "proxi: V2 published=false (UNPUBLISHED_EXPECTED). Clasificado PRIVACY_EXCLUDED en 4E.0 porque legacy ui_projects.proxi sigue published=true y el mapping legacy→V2 trata la fila como excluida del target Interfaces — NO por flag confidential.",
    publicSafe15,
    noResources8: noResourcesAudit,
    detailReadiness: detailByProject,
    uiListItemsMapping: listMapping,
    homeOverlap,
    privacyBlockedOnHome,
  };

  console.log(JSON.stringify(out, null, 2));
  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
