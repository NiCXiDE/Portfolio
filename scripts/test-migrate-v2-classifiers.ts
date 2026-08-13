import test from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../src/lib/slug";
import { normalizeLabel } from "./migrate-v2/load-legacy";
import { sectionCategoryMapping } from "./migrate-v2/classifiers";
import { consolidateProjects } from "./migrate-v2/consolidate";
import type { ProposedProject } from "./migrate-v2/types";

test("slugify normalizes project titles", () => {
  assert.equal(slugify("Adapto Pay"), "adapto-pay");
});

test("normalizeLabel matches juegos provinciales variants", () => {
  assert.equal(
    normalizeLabel("Juegos Provinciales Tecnológicos"),
    normalizeLabel("JUEGOS PROVINCIALES TECNOLOGICOS"),
  );
});

test("sectionCategoryMapping marks eventos as project type not graphic category", () => {
  const map = sectionCategoryMapping();
  assert.match(map.eventos, /Project\.type=event/);
  assert.match(map.personal, /origin=personal/);
});

test("consolidateProjects dedupes by id", () => {
  const ui: ProposedProject[] = [
    {
      id: "apsmm",
      slug: "apsmm",
      name: "APSMM",
      areas: ["ux-ui"],
      type: "custom-system",
      status: "completed",
      roles: "PENDIENTE DE REVISIÓN",
      entities: [],
      pieces: [],
      resources: [],
      legacySources: ["ui_projects:apsmm"],
      confidence: "alta",
    },
  ];
  const graphic: ProposedProject[] = [
    {
      id: "juegos-provinciales",
      slug: "juegos-provinciales",
      name: "Juegos Provinciales",
      areas: ["graphic"],
      type: "event",
      status: "completed",
      roles: "PENDIENTE DE REVISIÓN",
      entities: [],
      pieces: ["cover"],
      resources: [],
      legacySources: ["graphic_items:juegos-provinciales"],
      confidence: "alta",
    },
  ];
  const merged = consolidateProjects(ui, graphic, []);
  assert.equal(merged.length, 2);
  assert.ok(merged.some((p) => p.id === "apsmm"));
  assert.ok(merged.some((p) => p.id === "juegos-provinciales"));
});
