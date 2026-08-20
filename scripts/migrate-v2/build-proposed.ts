import type { DataSource } from "typeorm";
import {
  applyDecisionManifest,
  type DecisionApplicationResult,
} from "./apply-decisions";
import {
  classifyBrandManuals,
  classifyBrands,
  classifyGraphicItems,
  classifyNamedListItems,
  classifyTags,
  classifyTestimonials,
  classifyUiProjects,
} from "./classifiers";
import {
  consolidateProjects,
  enrichEntityWorkCounts,
} from "./consolidate";
import { loadLegacySnapshot } from "./load-legacy";
import type {
  LegacySnapshot,
  MigrationMapEntry,
  RecordAnalysis,
  TagAnalysis,
  TestimonialAnalysis,
} from "./types";

export type ClassifierOutputs = {
  brandResult: ReturnType<typeof classifyBrands>;
  uiResult: ReturnType<typeof classifyUiProjects>;
  graphicResult: ReturnType<typeof classifyGraphicItems>;
  manualResult: ReturnType<typeof classifyBrandManuals>;
  tagAnalysis: TagAnalysis;
  testimonialAnalysis: TestimonialAnalysis[];
  namedListAnalysis: ReturnType<typeof classifyNamedListItems>;
  records: RecordAnalysis[];
};

export type ProposedPlan = {
  applied: DecisionApplicationResult;
  snapshot: LegacySnapshot;
  migrationMapPreview: MigrationMapEntry[];
  classifiers: ClassifierOutputs;
};

/** Classify legacy snapshot + apply decision manifest (no DB writes). */
export async function buildProposedPlan(ds: DataSource): Promise<ProposedPlan> {
  const snapshot = await loadLegacySnapshot(ds);

  const brandResult = classifyBrands(snapshot);
  const uiResult = classifyUiProjects(snapshot);
  const graphicResult = classifyGraphicItems(snapshot);
  const manualResult = classifyBrandManuals(snapshot);
  const tagAnalysis = classifyTags(snapshot);
  const testimonialAnalysis = classifyTestimonials(snapshot);

  const consolidatedProjects = consolidateProjects(
    uiResult.projects,
    graphicResult.projects,
    snapshot.namedListItems,
  );

  const proposedEntities = enrichEntityWorkCounts(
    brandResult.entities,
    consolidatedProjects,
  );

  const namedListAnalysis = classifyNamedListItems(
    snapshot,
    consolidatedProjects,
    proposedEntities,
  );

  const applied = applyDecisionManifest(
    {
      entities: proposedEntities,
      projects: consolidatedProjects,
      standalonePieces: graphicResult.standalonePieces,
      piecesInProjects: graphicResult.piecesInProjects,
      testimonials: testimonialAnalysis,
      namedListItems: namedListAnalysis,
    },
    snapshot,
  );

  if (applied.validationErrors.length) {
    throw new Error(
      "[migrate-v2] Decision manifest validation failed:\n" +
        applied.validationErrors.map((e) => `  - ${e}`).join("\n"),
    );
  }

  const records: RecordAnalysis[] = [
    ...brandResult.records,
    ...uiResult.records,
    ...graphicResult.records,
    ...manualResult.records,
  ];

  return {
    applied,
    snapshot,
    migrationMapPreview: applied.migrationMapPreview,
    classifiers: {
      brandResult,
      uiResult,
      graphicResult,
      manualResult,
      tagAnalysis,
      testimonialAnalysis,
      namedListAnalysis,
      records,
    },
  };
}
