/**
 * Unit tests for Home feature flag + UI mapper (4C.4 / 4C.5B).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { getHomeContentSource } from "../src/lib/content-v2/home-source";
import {
  mapHomeContentV2ToCurrentUI,
  stableNumericId,
} from "../src/lib/content-v2/home-ui";
import {
  applyHomeV2PresentationLayout,
  HOME_V2_MARQUEE_SPEED_PX_S,
} from "../src/lib/content-v2/home-runtime";
import type { HomeContentV2 } from "../src/lib/content-v2/home";
import { DEFAULT_HOME_LAYOUT } from "../src/lib/home-layout";

test("getHomeContentSource: unset env → legacy", () => {
  const prev = process.env.HOME_CONTENT_SOURCE;
  delete process.env.HOME_CONTENT_SOURCE;
  try {
    assert.equal(getHomeContentSource(), "legacy");
  } finally {
    if (prev === undefined) delete process.env.HOME_CONTENT_SOURCE;
    else process.env.HOME_CONTENT_SOURCE = prev;
  }
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
        href: "https://adapto.example",
      },
    ],
    currentProjects: [
      {
        id: "taily",
        slug: "taily",
        label: "Taily",
        title: "Taily",
        status: "ongoing",
        homeOrder: 11,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
    ],
    featuredProjects: [
      {
        id: "adapto-pay",
        slug: "adapto-pay",
        label: "Adapto Pay",
        title: "Adapto Pay",
        status: "completed",
        homeOrder: 0,
        clientLabel: null,
        coverUrl: "/cover.jpg",
        href: "https://adapto.example",
      },
      {
        id: "taily",
        slug: "taily",
        label: "Taily",
        title: "Taily",
        status: "ongoing",
        homeOrder: 11,
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

test("mapper: logoUrl→logo; entity href NOT used as Home hubHref", () => {
  const ui = mapHomeContentV2ToCurrentUI(sampleHome());
  assert.equal(ui.companies[0]?.logo, "/a.svg");
  assert.equal(ui.companies[0]?.hubHref, null);
  assert.equal(ui.companies[1]?.hubHref, null);
  assert.equal(ui.homeProjectsPresentation, "featured");
});

test("mapper: Featured list mixes completed+ongoing; Current UI empty", () => {
  const ui = mapHomeContentV2ToCurrentUI(sampleHome());
  assert.deepEqual(
    ui.pastProjects.map((p) => p.label),
    ["Adapto Pay", "Taily"],
  );
  assert.equal(ui.pastProjects.every((p) => p.hubHref === null), true);
  assert.equal(ui.pastProjects.every((p) => p.logo === null), true);
  assert.equal(ui.currentProjects.length, 0);
});

test("mapper: testimonials contract unchanged", () => {
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

test("Home V2 layout drops Current section and sets 100px/s", () => {
  const layout = applyHomeV2PresentationLayout({
    ...DEFAULT_HOME_LAYOUT,
    sectionOrder: [
      "companies",
      "past_projects",
      "current_projects",
      "testimonials",
    ],
  });
  assert.equal(layout.sectionOrder.includes("current_projects"), false);
  assert.equal(layout.sectionOrder.includes("past_projects"), true);
  assert.equal(layout.marquees.company.speed, HOME_V2_MARQUEE_SPEED_PX_S);
  assert.equal(layout.marquees.past_project.speed, HOME_V2_MARQUEE_SPEED_PX_S);
  assert.equal(HOME_V2_MARQUEE_SPEED_PX_S, 100);
});

test("marquee duplication is presentational only (domain list stays single)", () => {
  const ui = mapHomeContentV2ToCurrentUI(sampleHome());
  // Mapper returns one chip per project — InfiniteMarquee duplicates for loop.
  assert.equal(ui.pastProjects.length, sampleHome().featuredProjects.length);
});
