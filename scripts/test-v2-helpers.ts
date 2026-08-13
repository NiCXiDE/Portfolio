import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveUniqueSlugSync,
  slugify,
} from "../src/lib/slug";
import {
  isEntityType,
  isProjectStatus,
  isValidMonth,
  isValidYear,
  validateProjectDates,
} from "../src/lib/content-model-v2";

test("slugify normalizes accents and spaces", () => {
  assert.equal(slugify("Adapto Pay"), "adapto-pay");
  assert.equal(slugify("  Café Ñandú  "), "cafe-nandu");
  assert.equal(slugify("UX/UI & Branding!"), "ux-ui-branding");
});

test("slugify returns fallback for empty input", () => {
  assert.equal(slugify("   "), "item");
  assert.equal(slugify("---"), "item");
});

test("resolveUniqueSlugSync handles collisions", () => {
  const taken = new Set(["adapto-pay", "adapto-pay-2"]);
  assert.equal(
    resolveUniqueSlugSync("Adapto Pay", (s) => taken.has(s)),
    "adapto-pay-3",
  );
});

test("resolveUniqueSlugSync returns base when free", () => {
  assert.equal(
    resolveUniqueSlugSync("Nuevo Proyecto", () => false),
    "nuevo-proyecto",
  );
});

test("enum validators accept known values", () => {
  assert.equal(isEntityType("company"), true);
  assert.equal(isEntityType("invalid"), false);
  assert.equal(isProjectStatus("ongoing"), true);
  assert.equal(isProjectStatus("draft"), false);
});

test("project date validation", () => {
  assert.equal(isValidMonth(6), true);
  assert.equal(isValidMonth(13), false);
  assert.equal(isValidYear(2024), true);
  assert.equal(isValidYear(1800), false);

  assert.equal(
    validateProjectDates({
      startYear: 2024,
      startMonth: 3,
      endYear: 2024,
      endMonth: 1,
    }),
    false,
  );
  assert.equal(
    validateProjectDates({
      startYear: 2023,
      endYear: 2024,
    }),
    true,
  );
});
