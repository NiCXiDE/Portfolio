/**
 * Unit tests for HomeContentV2 adapter (pure mapping — no DB).
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFeaturedHomeProjectsV2,
  buildHomeContentV2,
  publicExternalHref,
  splitHomeProjectsV2,
} from "../src/lib/content-v2/home";
import type {
  PublicEntitySummary,
  PublicProjectSummary,
  PublicTestimonial,
} from "../src/lib/content-v2/types";

function entity(
  partial: Partial<PublicEntitySummary> & Pick<PublicEntitySummary, "id">,
): PublicEntitySummary {
  return {
    slug: partial.slug ?? partial.id,
    name: partial.name ?? partial.id,
    shortName: partial.shortName ?? null,
    type: partial.type ?? "company",
    logoUrl: partial.logoUrl ?? null,
    href: partial.href ?? null,
    description: null,
    pageEnabled: partial.pageEnabled ?? false,
    showOnHome: partial.showOnHome ?? true,
    homeOrder: partial.homeOrder ?? null,
    ...partial,
  };
}

function project(
  partial: Partial<PublicProjectSummary> &
    Pick<PublicProjectSummary, "id" | "status">,
): PublicProjectSummary {
  return {
    slug: partial.slug ?? partial.id,
    title: partial.title ?? { es: partial.id, en: partial.id },
    summary: null,
    description: null,
    type: null,
    context: "client-work",
    coverUrl: partial.coverUrl ?? null,
    links: partial.links ?? null,
    featured: false,
    showOnHome: true,
    homeOrder: partial.homeOrder ?? null,
    startYear: null,
    startMonth: null,
    endYear: null,
    endMonth: null,
    dateLabel: null,
    areas: [],
    roles: [],
    entities: partial.entities ?? [],
    resources: [],
    ...partial,
  };
}

test("publicExternalHref accepts only http(s)", () => {
  assert.equal(publicExternalHref("https://push.example"), "https://push.example");
  assert.equal(publicExternalHref("http://x.test"), "http://x.test");
  assert.equal(publicExternalHref("/entidades/aicore"), null);
  assert.equal(publicExternalHref("/marcas/push"), null);
  assert.equal(publicExternalHref("marcas/push"), null);
  assert.equal(publicExternalHref(""), null);
  assert.equal(publicExternalHref(null), null);
});

test("splitHomeProjectsV2: completed→past, ongoing→current, archived excluded", () => {
  const { pastProjects, currentProjects } = splitHomeProjectsV2(
    [
      project({ id: "a", status: "completed", homeOrder: 2 }),
      project({ id: "b", status: "ongoing", homeOrder: 0 }),
      project({ id: "c", status: "archived", homeOrder: 0 }),
      project({ id: "d", status: "completed", homeOrder: 1 }),
    ],
    "es",
  );

  assert.deepEqual(
    pastProjects.map((p) => p.id),
    ["d", "a"],
  );
  assert.deepEqual(
    currentProjects.map((p) => p.id),
    ["b"],
  );
  assert.equal(
    pastProjects.every((p) => p.status === "completed"),
    true,
  );
  assert.equal(
    currentProjects.every((p) => p.status === "ongoing"),
    true,
  );
});

test("ordering is deterministic by homeOrder then id", () => {
  const { pastProjects } = splitHomeProjectsV2(
    [
      project({ id: "z", status: "completed", homeOrder: 1 }),
      project({ id: "a", status: "completed", homeOrder: 1 }),
      project({ id: "m", status: "completed", homeOrder: null }),
      project({ id: "b", status: "completed", homeOrder: 0 }),
    ],
    "en",
  );
  assert.deepEqual(
    pastProjects.map((p) => p.id),
    ["b", "a", "z", "m"],
  );
});

test("locale uses pickLocalized fallback (en→es)", () => {
  const { pastProjects } = splitHomeProjectsV2(
    [
      project({
        id: "x",
        status: "completed",
        homeOrder: 0,
        title: { es: "Titulo ES", en: "" },
      }),
    ],
    "en",
  );
  assert.equal(pastProjects[0]?.label, "Titulo ES");
});

test("entity href never invents /entidades even when pageEnabled", () => {
  const home = buildHomeContentV2("es", {
    entities: [
      entity({
        id: "aicore",
        pageEnabled: true,
        href: null,
        homeOrder: 0,
        name: "AICORE",
      }),
      entity({
        id: "push",
        pageEnabled: true,
        href: "https://push.example",
        homeOrder: 1,
        name: "PUSH",
      }),
    ],
    projects: [],
    testimonials: [],
  });

  assert.equal(home.entities[0]?.href, null);
  assert.equal(home.entities[1]?.href, "https://push.example");
});

test("company_* overrides Entity org metadata when set", () => {
  const row: PublicTestimonial = {
    id: "t1",
    name: "Ada",
    imageUrl: "/a.jpg",
    quote: { es: "hola", en: "hi" },
    role: { es: "rol", en: "role" },
    linkLabel: { es: "sitio", en: "site" },
    sortOrder: 0,
    entityId: "push",
    entity: entity({
      id: "push",
      name: "PUSH Software",
      logoUrl: "/push.svg",
      href: "https://push.example",
    }),
    legacyCompany: {
      name: "Legacy Co",
      logoUrl: "/legacy.png",
      href: "https://legacy.example",
    },
  };

  const home = buildHomeContentV2("es", {
    entities: [],
    projects: [],
    testimonials: [row],
  });

  assert.equal(home.testimonials[0]?.organization.name, "Legacy Co");
  assert.equal(home.testimonials[0]?.organization.logoUrl, "/legacy.png");
  assert.equal(
    home.testimonials[0]?.organization.href,
    "https://legacy.example",
  );
  assert.equal(home.testimonials[0]?.quote, "hola");
});

test("Entity fills gaps when company has name+href but no logo", () => {
  const row: PublicTestimonial = {
    id: "t2",
    name: "Bea",
    imageUrl: "/b.jpg",
    quote: { es: "ok", en: "ok" },
    role: { es: "rol", en: "role" },
    linkLabel: { es: "web", en: "web" },
    sortOrder: 0,
    entityId: "push",
    entity: entity({
      id: "push",
      name: "PUSH Software",
      logoUrl: "/push.svg",
      href: "https://push.example",
    }),
    legacyCompany: {
      name: "Cliente SA",
      logoUrl: null,
      href: "https://cliente.example",
    },
  };

  const home = buildHomeContentV2("es", {
    entities: [],
    projects: [],
    testimonials: [row],
  });

  assert.equal(home.testimonials[0]?.organization.name, "Cliente SA");
  assert.equal(home.testimonials[0]?.organization.logoUrl, "/push.svg");
  assert.equal(
    home.testimonials[0]?.organization.href,
    "https://cliente.example",
  );
});

test("name+href without logo still yields clickable org link", () => {
  const row: PublicTestimonial = {
    id: "t3",
    name: "Cata",
    imageUrl: "/c.jpg",
    quote: { es: "ok", en: "ok" },
    role: { es: "rol", en: "role" },
    linkLabel: null,
    sortOrder: 0,
    entityId: null,
    entity: null,
    legacyCompany: {
      name: "Sin Logo SRL",
      logoUrl: null,
      href: "https://sinlogo.example",
    },
  };

  const home = buildHomeContentV2("es", {
    entities: [],
    projects: [],
    testimonials: [row],
  });

  assert.equal(home.testimonials[0]?.organization.name, "Sin Logo SRL");
  assert.equal(home.testimonials[0]?.organization.logoUrl, null);
  assert.equal(
    home.testimonials[0]?.organization.href,
    "https://sinlogo.example",
  );
});

test("project does not invent cover or route", () => {
  const { pastProjects } = splitHomeProjectsV2(
    [project({ id: "p1", status: "completed", homeOrder: 0, coverUrl: null })],
    "es",
  );
  assert.equal(pastProjects[0]?.coverUrl, null);
  assert.equal(pastProjects[0]?.href, null);
});

test("featuredProjects: completed + ongoing by homeOrder; archived excluded", () => {
  const featured = buildFeaturedHomeProjectsV2(
    [
      project({ id: "ongoing-a", status: "ongoing", homeOrder: 1 }),
      project({ id: "done-b", status: "completed", homeOrder: 0 }),
      project({ id: "archived-c", status: "archived", homeOrder: 0 }),
      project({ id: "done-d", status: "completed", homeOrder: 2 }),
    ],
    "es",
  );
  assert.deepEqual(
    featured.map((p) => p.id),
    ["done-b", "ongoing-a", "done-d"],
  );
  assert.equal(
    featured.map((p) => p.id).includes("archived-c"),
    false,
  );
});

test("buildHomeContentV2 exposes featuredProjects without status banding", () => {
  const home = buildHomeContentV2("es", {
    entities: [],
    projects: [
      project({ id: "taily", status: "ongoing", homeOrder: 11 }),
      project({ id: "adapto-pay", status: "completed", homeOrder: 0 }),
    ],
    testimonials: [],
  });
  assert.deepEqual(
    home.featuredProjects.map((p) => p.id),
    ["adapto-pay", "taily"],
  );
  assert.equal(home.currentProjects.map((p) => p.id).includes("taily"), true);
  assert.equal(home.pastProjects.map((p) => p.id).includes("adapto-pay"), true);
});
