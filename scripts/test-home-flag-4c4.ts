/**
 * Unit tests for Home feature flag + UI mapper (4C.4).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { getHomeContentSource } from "../src/lib/content-v2/home-source";
import {
  mapHomeContentV2ToCurrentUI,
  stableNumericId,
} from "../src/lib/content-v2/home-ui";
import type { HomeContentV2 } from "../src/lib/content-v2/home";

test("getHomeContentSource: undefined → legacy", () => {
  assert.equal(getHomeContentSource(undefined), "legacy");
});

test("getHomeContentSource: legacy → legacy", () => {
  assert.equal(getHomeContentSource("legacy"), "legacy");
  assert.equal(getHomeContentSource("LEGACY"), "legacy");
});

test("getHomeContentSource: v2 → v2", () => {
  assert.equal(getHomeContentSource("v2"), "v2");
  assert.equal(getHomeContentSource(" V2 "), "v2");
});

test("getHomeContentSource: invalid → legacy", () => {
  assert.equal(getHomeContentSource("prod"), "legacy");
  assert.equal(getHomeContentSource("true"), "legacy");
  assert.equal(getHomeContentSource(""), "legacy");
});

function sampleHome(): HomeContentV2 {
  return {
    locale: "es",
    entities: [
      {
        id: "aicore",
        slug: "aicore",
        label: "AICORE",
        type: "company",
        logoUrl: "/a.svg",
        href: "https://aicore.example",
        homeOrder: 0,
      },
      {
        id: "apsmm",
        slug: "apsmm",
        label: "APSMM",
        type: "association",
        logoUrl: "/apsmm.svg",
        href: null,
        homeOrder: 1,
      },
    ],
    pastProjects: [
      {
        id: "adapto-pay",
        slug: "adapto-pay",
        label: "Adapto Pay",
        title: "Adapto Pay",
        status: "completed",
        homeOrder: 0,
        clientLabel: null,
        coverUrl: "/cover.jpg",
        href: null,
      },
    ],
    currentProjects: [
      {
        id: "taily",
        slug: "taily",
        label: "Taily",
        title: "Taily",
        status: "ongoing",
        homeOrder: 0,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
    ],
    testimonials: [
      {
        id: "facundo",
        name: "Facundo",
        imageUrl: "/f.jpg",
        quote: "hola",
        role: "CEO",
        organization: {
          name: "PUSH",
          logoUrl: "/p.svg",
          href: "https://push.example",
          linkLabel: "web",
        },
        sortOrder: 0,
      },
    ],
  };
}

test("mapper: logoUrl→logo, href→hubHref, null href not invented", () => {
  const ui = mapHomeContentV2ToCurrentUI(sampleHome());
  assert.equal(ui.companies[0]?.logo, "/a.svg");
  assert.equal(ui.companies[0]?.hubHref, "https://aicore.example");
  assert.equal(ui.companies[1]?.hubHref, null);
  assert.equal(
    (ui.companies[0]?.hubHref ?? "").includes("/entidades"),
    false,
  );
  assert.equal((ui.companies[0]?.hubHref ?? "").includes("/marcas"), false);
});

test("mapper: past/current arrays and no fake covers on chips", () => {
  const ui = mapHomeContentV2ToCurrentUI(sampleHome());
  assert.equal(ui.pastProjects.length, 1);
  assert.equal(ui.pastProjects[0]?.label, "Adapto Pay");
  assert.equal(ui.pastProjects[0]?.logo, null);
  assert.equal(ui.currentProjects.length, 1);
  assert.equal(ui.currentProjects[0]?.label, "Taily");
});

test("mapper: testimonials contract", () => {
  const ui = mapHomeContentV2ToCurrentUI(sampleHome());
  const t = ui.testimonials[0]!;
  assert.equal(t.id, "facundo");
  assert.equal(t.image, "/f.jpg");
  assert.equal(t.quote.es, "hola");
  assert.equal(t.company.name, "PUSH");
  assert.equal(t.company.logo, "/p.svg");
  assert.equal(t.company.href, "https://push.example");
});

test("stableNumericId is deterministic and positive", () => {
  assert.equal(stableNumericId("aicore"), stableNumericId("aicore"));
  assert.ok(stableNumericId("taily") > 0);
});
