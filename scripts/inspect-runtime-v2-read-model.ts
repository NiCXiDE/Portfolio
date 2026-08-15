/**
 * READ-ONLY inspection of V2 public read model against LIVE `portfolio`.
 * Does not modify pages or DB.
 *
 * Usage: npx tsx scripts/inspect-runtime-v2-read-model.ts
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

// Ensure we hit LIVE portfolio (clear TEMP overrides)
delete process.env.DATABASE_NAME;
delete process.env.V2_APPLY_APPROVED;
delete process.env.V2_REHEARSAL_APPROVED;

async function main() {
  const {
    getHomeEntitiesV2,
    getHomeProjectsV2,
    getPublicEntitiesV2,
    getPublicPiecesV2,
    getPublicProjectsV2,
    getPublicTestimonialsV2,
    getPublicEntityBySlugV2,
    getPublicProjectBySlugV2,
  } = await import("../src/lib/content-v2");
  const { getDataSource } = await import("../src/db/data-source");

  const ds = await getDataSource();
  const db = (
    (await ds.query("SELECT DATABASE() AS db")) as Array<{ db: string }>
  )[0]?.db;
  console.log(`database=${db}`);
  if (db !== "portfolio") {
    throw new Error(`ABORT: expected portfolio, got ${db}`);
  }

  const homeEntities = await getHomeEntitiesV2();
  const homeProjects = await getHomeProjectsV2();
  const publicProjects = await getPublicProjectsV2();
  const publicEntities = await getPublicEntitiesV2();
  const pieces = await getPublicPiecesV2();
  const standalone = await getPublicPiecesV2({ standaloneOnly: true });
  const testimonials = await getPublicTestimonialsV2();

  const checks = {
    homeEntities: {
      count: homeEntities.length,
      ids: homeEntities.map((e) => e.id),
      anyInvisible: false,
      anyNotShowOnHome: homeEntities.some((e) => !e.showOnHome),
      pageEnabledFlags: Object.fromEntries(
        homeEntities.map((e) => [e.id, e.pageEnabled]),
      ),
    },
    homeProjects: {
      count: homeProjects.length,
      ids: homeProjects.map((p) => p.id),
      anyUnpublished: false,
    },
    publicProjects: {
      count: publicProjects.length,
      unpublishedLeak: 0,
      knownBlocked: {
        syllabi: publicProjects.some((p) => p.id === "syllabi"),
        proxi: publicProjects.some((p) => p.id === "proxi"),
        microtime: publicProjects.some((p) => p.id === "microtime"),
        confidentialLogistics: publicProjects.some(
          (p) => p.id === "confidential-logistics-system",
        ),
      },
      publishedConfidentialStillListed: publicProjects
        .filter((p) =>
          [
            "aicore-inventariado",
            "asesor-financiero",
            "aml-casinos",
            "aml-general",
          ].includes(p.id),
        )
        .map((p) => p.id),
    },
    publicEntities: {
      count: publicEntities.length,
      confidentialPlaceholders: publicEntities.filter((e) =>
        e.id.startsWith("confidential-"),
      ).length,
    },
    pieces: {
      publicCount: pieces.length,
      standaloneCount: standalone.length,
      projectLinkedCount: pieces.filter((p) => p.projectId).length,
      buhoprofeAsPiece: pieces.some((p) => p.id === "buhoprofe"),
      microtimePieceLeak: pieces.some((p) => p.id === "microtime"),
      withTags: pieces.filter((p) => p.tags.length > 0).length,
      withResources: pieces.filter((p) => p.resources.length > 0).length,
    },
    testimonials: {
      count: testimonials.length,
      withEntity: testimonials.filter((t) => t.entity).length,
      canonical: testimonials
        .filter((t) =>
          ["facundo", "ezequiel", "joaquin", "matias"].includes(t.id),
        )
        .map((t) => ({ id: t.id, entityId: t.entityId, entity: t.entity?.id })),
    },
    spotChecks: {
      pushHome: Boolean(await getPublicEntityBySlugV2("push-software")),
      aicoreHome: homeEntities.some((e) => e.id === "aicore"),
      citfHome: homeEntities.some((e) => e.id === "citf"),
      apsmmHome: homeEntities.some((e) => e.id === "apsmm"),
      apsmmPageEnabled: homeEntities.find((e) => e.id === "apsmm")?.pageEnabled,
      syllabiProject: await getPublicProjectBySlugV2("syllabi"),
    },
  };

  console.log(JSON.stringify(checks, null, 2));
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
