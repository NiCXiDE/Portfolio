/**
 * Unit tests for Home shadow comparator (4C.3) — no DB.
 */
import test from "node:test";
import assert from "node:assert/strict";
import type { HomeContentV2 } from "../src/lib/content-v2/home";
import {
  compareHomeShadows,
  normalizeHomeContentV2,
  normalizeLegacyHome,
  resolveLegacyProjectKey,
  type LegacyHomeSlice,
} from "../src/lib/content-v2/home-shadow";

function legacySlice(partial?: Partial<LegacyHomeSlice>): LegacyHomeSlice {
  return {
    companies: partial?.companies ?? [
      {
        id: 1,
        label: "AICORE IT Specialists",
        logo: "/a.svg",
        brandId: "aicore",
        hubHref: "/marcas/aicore",
      },
      {
        id: 2,
        label: "bind",
        logo: null,
        brandId: null,
        hubHref: null,
      },
      {
        id: 3,
        label: "PUSH Software",
        logo: "/p.svg",
        brandId: "push",
        hubHref: "/marcas/push",
      },
    ],
    pastProjects: partial?.pastProjects ?? [
      {
        id: 10,
        label: "Adapto Pay",
        logo: null,
        hubHref: null,
      },
      {
        id: 11,
        label: "Templeton & Matthews",
        logo: null,
        hubHref: null,
      },
      {
        id: 12,
        label: "Athenas",
        logo: null,
        hubHref: null,
      },
      {
        id: 13,
        label: "proxi",
        logo: null,
        hubHref: null,
      },
    ],
    currentProjects: partial?.currentProjects ?? [
      {
        id: 20,
        label: "Concitar",
        logo: null,
        hubHref: null,
      },
      {
        id: 21,
        label: "Repuestos Carlitos",
        logo: null,
        hubHref: null,
      },
      {
        id: 22,
        label: "Taily",
        logo: null,
        hubHref: null,
      },
      {
        id: 23,
        label: "MICROTIME",
        logo: null,
        hubHref: null,
      },
    ],
    testimonials: partial?.testimonials ?? [
      {
        id: "facundo",
        name: "Facundo",
        image: "/f.jpg",
        quote: { es: "q", en: "q" },
        role: { es: "r", en: "r" },
        company: {
          logo: "/c.svg",
          href: "https://example.com",
          name: "PUSH",
          linkLabel: null,
        },
      },
      {
        id: "ezequiel",
        name: "Ezequiel",
        image: "/e.jpg",
        quote: { es: "q", en: "q" },
        role: { es: "r", en: "r" },
        company: {
          logo: null,
          href: null,
          name: "AICORE",
          linkLabel: null,
        },
      },
      {
        id: "joaquin",
        name: "Joaquin",
        image: "/j.jpg",
        quote: { es: "q", en: "q" },
        role: { es: "r", en: "r" },
        company: {
          logo: null,
          href: null,
          name: "Lúdica",
          linkLabel: null,
        },
      },
      {
        id: "matias",
        name: "Matias",
        image: "/m.jpg",
        quote: { es: "q", en: "q" },
        role: { es: "r", en: "r" },
        company: {
          logo: null,
          href: null,
          name: "Órbita",
          linkLabel: null,
        },
      },
    ],
  };
}

function v2Home(partial?: Partial<HomeContentV2>): HomeContentV2 {
  const base: HomeContentV2 = {
    locale: "es",
    entities: [
      {
        id: "aicore",
        slug: "aicore",
        label: "AICORE",
        type: "company",
        logoUrl: "/a.svg",
        href: "https://aicore.com.ar",
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
      {
        id: "citf",
        slug: "citf",
        label: "CITF",
        type: "company",
        logoUrl: "/c.svg",
        href: null,
        homeOrder: 2,
      },
      {
        id: "ludica",
        slug: "ludica",
        label: "Lúdica",
        type: "company",
        logoUrl: "/l.svg",
        href: "https://ludica.example",
        homeOrder: 3,
      },
      {
        id: "orbita-l-b",
        slug: "orbita-l-b",
        label: "Órbita",
        type: "company",
        logoUrl: "/o.svg",
        href: "https://orbita.example",
        homeOrder: 4,
      },
      {
        id: "push",
        slug: "push",
        label: "PUSH",
        type: "company",
        logoUrl: "/p.svg",
        href: "https://push.example",
        homeOrder: 5,
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
        coverUrl: null,
        href: null,
      },
      {
        id: "casiba",
        slug: "casiba",
        label: "Casiba",
        title: "Casiba",
        status: "completed",
        homeOrder: 1,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "clearwater",
        slug: "clearwater",
        label: "Clearwater",
        title: "Clearwater",
        status: "completed",
        homeOrder: 2,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "cloronor-trading",
        slug: "cloronor-trading",
        label: "Cloronor",
        title: "Cloronor",
        status: "completed",
        homeOrder: 3,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "expedicion-polo",
        slug: "expedicion-polo",
        label: "EXPEDICIÓN POLO",
        title: "EXPEDICIÓN POLO",
        status: "completed",
        homeOrder: 4,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "juegos-provinciales",
        slug: "juegos-provinciales",
        label: "Juegos",
        title: "Juegos",
        status: "completed",
        homeOrder: 5,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "mental-training-tech-24-5",
        slug: "mental-training-tech-24-5",
        label: "Mental",
        title: "Mental",
        status: "completed",
        homeOrder: 6,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "omnigroup",
        slug: "omnigroup",
        label: "omni",
        title: "omni",
        status: "completed",
        homeOrder: 7,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "concitar",
        slug: "concitar",
        label: "Concitar",
        title: "Concitar",
        status: "completed",
        homeOrder: 8,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "repuestos-carlitos",
        slug: "repuestos-carlitos",
        label: "Repuestos Carlitos",
        title: "Repuestos Carlitos",
        status: "completed",
        homeOrder: 9,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
      {
        id: "templeton-digital-transformation-assessment",
        slug: "templeton",
        label: "Templeton",
        title: "Templeton",
        status: "completed",
        homeOrder: 10,
        clientLabel: null,
        coverUrl: null,
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
        quote: "q",
        role: "r",
        organization: {
          name: "PUSH",
          logoUrl: "/c.svg",
          href: "https://example.com",
          linkLabel: null,
        },
        sortOrder: 0,
      },
      {
        id: "ezequiel",
        name: "Ezequiel",
        imageUrl: "/e.jpg",
        quote: "q",
        role: "r",
        organization: {
          name: "AICORE",
          logoUrl: null,
          href: null,
          linkLabel: null,
        },
        sortOrder: 1,
      },
      {
        id: "joaquin",
        name: "Joaquin",
        imageUrl: "/j.jpg",
        quote: "q",
        role: "r",
        organization: {
          name: "Lúdica",
          logoUrl: null,
          href: null,
          linkLabel: null,
        },
        sortOrder: 2,
      },
      {
        id: "matias",
        name: "Matias",
        imageUrl: "/m.jpg",
        quote: "q",
        role: "r",
        organization: {
          name: "Órbita",
          logoUrl: null,
          href: null,
          linkLabel: null,
        },
        sortOrder: 3,
      },
    ],
  };
  return { ...base, ...partial, locale: partial?.locale ?? base.locale };
}

test("Templeton maps to digital-transformation project key", () => {
  assert.equal(
    resolveLegacyProjectKey("Templeton & Matthews"),
    "templeton-digital-transformation-assessment",
  );
});

test("expected removal does not fail shadow", () => {
  const legacy = normalizeLegacyHome(legacySlice(), "es");
  // Expand legacy entities so survivors exist for all 6 — add stubs via companies
  const slice = legacySlice({
    companies: [
      ...legacySlice().companies,
      {
        id: 4,
        label: "APSMM",
        logo: "/x.svg",
        brandId: "apsmm",
        hubHref: null,
      },
      {
        id: 5,
        label: "CITF",
        logo: "/x.svg",
        brandId: "citf",
        hubHref: "/marcas/citf",
      },
      {
        id: 6,
        label: "Lúdica Tech",
        logo: "/x.svg",
        brandId: "ludica",
        hubHref: null,
      },
      {
        id: 7,
        label: "Órbita LΔB",
        logo: "/x.svg",
        brandId: "orbita-l-b",
        hubHref: null,
      },
    ],
    pastProjects: [
      ...legacySlice().pastProjects!,
      { id: 30, label: "Casiba", logo: null, hubHref: null },
      { id: 31, label: "Clearwater", logo: null, hubHref: null },
      { id: 32, label: "Cloronor", logo: null, hubHref: null },
      { id: 33, label: "EXPEDICIÓN POLO", logo: null, hubHref: null },
      {
        id: 34,
        label: "Juegos Provinciales Tecnológicos",
        logo: null,
        hubHref: null,
      },
      { id: 35, label: "Mental Tech Training", logo: null, hubHref: null },
      { id: 36, label: "omni group", logo: null, hubHref: null },
    ],
  });
  const leg = normalizeLegacyHome(slice, "es");
  const v2 = normalizeHomeContentV2(v2Home());
  const report = compareHomeShadows(leg, v2);
  assert.equal(report.shadowOk, true);
  assert.ok(
    report.expected.some((d) => d.kind === "EXPECTED_REMOVED_ENTITY"),
  );
  assert.ok(
    report.expected.some((d) => d.kind === "EXPECTED_REMOVED_PROJECT"),
  );
});

test("unexpected removal fails shadow", () => {
  const slice = legacySlice({
    companies: [
      {
        id: 1,
        label: "AICORE IT Specialists",
        logo: "/a.svg",
        brandId: "aicore",
        hubHref: null,
      },
      {
        id: 2,
        label: "PUSH Software",
        logo: "/p.svg",
        brandId: "push",
        hubHref: null,
      },
      {
        id: 3,
        label: "APSMM",
        logo: "/x.svg",
        brandId: "apsmm",
        hubHref: null,
      },
      {
        id: 4,
        label: "CITF",
        logo: "/x.svg",
        brandId: "citf",
        hubHref: null,
      },
      {
        id: 5,
        label: "Lúdica Tech",
        logo: "/x.svg",
        brandId: "ludica",
        hubHref: null,
      },
      {
        id: 6,
        label: "Órbita LΔB",
        logo: "/x.svg",
        brandId: "orbita-l-b",
        hubHref: null,
      },
    ],
    pastProjects: [
      { id: 10, label: "Adapto Pay", logo: null, hubHref: null },
      { id: 11, label: "Casiba", logo: null, hubHref: null },
      { id: 12, label: "Clearwater", logo: null, hubHref: null },
      { id: 13, label: "Cloronor", logo: null, hubHref: null },
      { id: 14, label: "EXPEDICIÓN POLO", logo: null, hubHref: null },
      {
        id: 15,
        label: "Juegos Provinciales Tecnológicos",
        logo: null,
        hubHref: null,
      },
      { id: 16, label: "Mental Tech Training", logo: null, hubHref: null },
      { id: 17, label: "omni group", logo: null, hubHref: null },
      { id: 18, label: "Templeton & Matthews", logo: null, hubHref: null },
      // Extra legacy project that maps to a real id but is NOT whitelisted for removal
      // and NOT present on V2 → should be UNEXPECTED if we use a known key not in removed set
      { id: 19, label: "Unknown Widget", logo: null, hubHref: null },
    ],
    currentProjects: [
      { id: 20, label: "Concitar", logo: null, hubHref: null },
      { id: 21, label: "Repuestos Carlitos", logo: null, hubHref: null },
      { id: 22, label: "Taily", logo: null, hubHref: null },
    ],
  });
  const leg = normalizeLegacyHome(slice, "es");
  const v2 = normalizeHomeContentV2(v2Home());
  const report = compareHomeShadows(leg, v2);
  assert.equal(report.shadowOk, false);
  assert.ok(
    report.unexpected.some(
      (d) =>
        d.kind === "UNEXPECTED" && d.key.startsWith("__unmapped_"),
    ),
  );
});

test("expected section change does not fail", () => {
  const slice = legacySlice({
    companies: [
      {
        id: 1,
        label: "AICORE",
        logo: "/a.svg",
        brandId: "aicore",
        hubHref: null,
      },
      {
        id: 2,
        label: "APSMM",
        logo: "/x.svg",
        brandId: "apsmm",
        hubHref: null,
      },
      {
        id: 3,
        label: "CITF",
        logo: "/x.svg",
        brandId: "citf",
        hubHref: null,
      },
      {
        id: 4,
        label: "Lúdica",
        logo: "/x.svg",
        brandId: "ludica",
        hubHref: null,
      },
      {
        id: 5,
        label: "Órbita",
        logo: "/x.svg",
        brandId: "orbita-l-b",
        hubHref: null,
      },
      {
        id: 6,
        label: "PUSH",
        logo: "/p.svg",
        brandId: "push",
        hubHref: null,
      },
    ],
    pastProjects: [
      { id: 10, label: "Adapto Pay", logo: null, hubHref: null },
      { id: 11, label: "Casiba", logo: null, hubHref: null },
      { id: 12, label: "Clearwater", logo: null, hubHref: null },
      { id: 13, label: "Cloronor", logo: null, hubHref: null },
      { id: 14, label: "EXPEDICIÓN POLO", logo: null, hubHref: null },
      {
        id: 15,
        label: "Juegos Provinciales Tecnológicos",
        logo: null,
        hubHref: null,
      },
      { id: 16, label: "Mental Tech Training", logo: null, hubHref: null },
      { id: 17, label: "omni group", logo: null, hubHref: null },
      { id: 18, label: "Templeton & Matthews", logo: null, hubHref: null },
    ],
    currentProjects: [
      { id: 20, label: "Concitar", logo: null, hubHref: null },
      { id: 21, label: "Repuestos Carlitos", logo: null, hubHref: null },
      { id: 22, label: "Taily", logo: null, hubHref: null },
    ],
  });
  const report = compareHomeShadows(
    normalizeLegacyHome(slice, "es"),
    normalizeHomeContentV2(v2Home()),
  );
  assert.equal(report.shadowOk, true);
  assert.ok(
    report.expected.filter((d) => d.kind === "EXPECTED_SECTION_CHANGE")
      .length >= 2,
  );
});

test("unexpected section change fails", () => {
  const home = v2Home({
    pastProjects: v2Home().pastProjects.filter((p) => p.id !== "taily"),
    currentProjects: [
      ...v2Home().currentProjects,
      {
        id: "concitar",
        slug: "concitar",
        label: "Concitar",
        title: "Concitar",
        status: "ongoing",
        homeOrder: 1,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
    ],
  });
  // Force bad: move templeton to current unexpectedly — build minimal compare
  const badV2 = normalizeHomeContentV2({
    ...home,
    pastProjects: home.pastProjects.filter(
      (p) => p.id !== "templeton-digital-transformation-assessment",
    ),
    currentProjects: [
      ...home.currentProjects,
      {
        id: "templeton-digital-transformation-assessment",
        slug: "t",
        label: "Templeton",
        title: "Templeton",
        status: "ongoing",
        homeOrder: 2,
        clientLabel: null,
        coverUrl: null,
        href: null,
      },
    ],
  });

  const slice = legacySlice({
    companies: [
      {
        id: 1,
        label: "AICORE",
        logo: "/a.svg",
        brandId: "aicore",
        hubHref: null,
      },
      {
        id: 2,
        label: "APSMM",
        logo: "/x.svg",
        brandId: "apsmm",
        hubHref: null,
      },
      {
        id: 3,
        label: "CITF",
        logo: "/x.svg",
        brandId: "citf",
        hubHref: null,
      },
      {
        id: 4,
        label: "Lúdica",
        logo: "/x.svg",
        brandId: "ludica",
        hubHref: null,
      },
      {
        id: 5,
        label: "Órbita",
        logo: "/x.svg",
        brandId: "orbita-l-b",
        hubHref: null,
      },
      {
        id: 6,
        label: "PUSH",
        logo: "/p.svg",
        brandId: "push",
        hubHref: null,
      },
    ],
    pastProjects: [
      { id: 10, label: "Adapto Pay", logo: null, hubHref: null },
      { id: 11, label: "Casiba", logo: null, hubHref: null },
      { id: 12, label: "Clearwater", logo: null, hubHref: null },
      { id: 13, label: "Cloronor", logo: null, hubHref: null },
      { id: 14, label: "EXPEDICIÓN POLO", logo: null, hubHref: null },
      {
        id: 15,
        label: "Juegos Provinciales Tecnológicos",
        logo: null,
        hubHref: null,
      },
      { id: 16, label: "Mental Tech Training", logo: null, hubHref: null },
      { id: 17, label: "omni group", logo: null, hubHref: null },
      { id: 18, label: "Templeton & Matthews", logo: null, hubHref: null },
      { id: 19, label: "Concitar", logo: null, hubHref: null },
      { id: 20, label: "Repuestos Carlitos", logo: null, hubHref: null },
    ],
    currentProjects: [{ id: 22, label: "Taily", logo: null, hubHref: null }],
  });

  const report = compareHomeShadows(normalizeLegacyHome(slice, "es"), badV2);
  assert.equal(report.shadowOk, false);
  assert.ok(
    report.unexpected.some(
      (d) =>
        d.key === "templeton-digital-transformation-assessment" ||
        d.key === "current-set",
    ),
  );
});

test("href semantic: internal hub → expected no internal on V2", () => {
  const slice = legacySlice({
    companies: [
      {
        id: 1,
        label: "AICORE",
        logo: "/a.svg",
        brandId: "aicore",
        hubHref: "/marcas/aicore",
      },
      {
        id: 2,
        label: "APSMM",
        logo: "/x.svg",
        brandId: "apsmm",
        hubHref: null,
      },
      {
        id: 3,
        label: "CITF",
        logo: "/x.svg",
        brandId: "citf",
        hubHref: "/marcas/citf",
      },
      {
        id: 4,
        label: "Lúdica",
        logo: "/x.svg",
        brandId: "ludica",
        hubHref: null,
      },
      {
        id: 5,
        label: "Órbita",
        logo: "/x.svg",
        brandId: "orbita-l-b",
        hubHref: null,
      },
      {
        id: 6,
        label: "PUSH",
        logo: "/p.svg",
        brandId: "push",
        hubHref: "/marcas/push",
      },
    ],
    pastProjects: [
      { id: 10, label: "Adapto Pay", logo: null, hubHref: null },
      { id: 11, label: "Casiba", logo: null, hubHref: null },
      { id: 12, label: "Clearwater", logo: null, hubHref: null },
      { id: 13, label: "Cloronor", logo: null, hubHref: null },
      { id: 14, label: "EXPEDICIÓN POLO", logo: null, hubHref: null },
      {
        id: 15,
        label: "Juegos Provinciales Tecnológicos",
        logo: null,
        hubHref: null,
      },
      { id: 16, label: "Mental Tech Training", logo: null, hubHref: null },
      { id: 17, label: "omni group", logo: null, hubHref: null },
      { id: 18, label: "Templeton & Matthews", logo: null, hubHref: null },
    ],
    currentProjects: [
      { id: 20, label: "Concitar", logo: null, hubHref: null },
      { id: 21, label: "Repuestos Carlitos", logo: null, hubHref: null },
      { id: 22, label: "Taily", logo: null, hubHref: null },
    ],
  });
  const report = compareHomeShadows(
    normalizeLegacyHome(slice, "es"),
    normalizeHomeContentV2(v2Home()),
  );
  assert.equal(report.shadowOk, true);
  assert.ok(
    report.expected.some((d) => d.kind === "EXPECTED_NO_INTERNAL_HREF"),
  );
  assert.ok(report.linkMatrix.some((r) => r.item === "aicore"));
});

test("testimonials parity ES/EN structure", () => {
  for (const locale of ["es", "en"] as const) {
    const slice = legacySlice({
      companies: [
        {
          id: 1,
          label: "AICORE",
          logo: "/a.svg",
          brandId: "aicore",
          hubHref: null,
        },
        {
          id: 2,
          label: "APSMM",
          logo: "/x.svg",
          brandId: "apsmm",
          hubHref: null,
        },
        {
          id: 3,
          label: "CITF",
          logo: "/x.svg",
          brandId: "citf",
          hubHref: null,
        },
        {
          id: 4,
          label: "Lúdica",
          logo: "/x.svg",
          brandId: "ludica",
          hubHref: null,
        },
        {
          id: 5,
          label: "Órbita",
          logo: "/x.svg",
          brandId: "orbita-l-b",
          hubHref: null,
        },
        {
          id: 6,
          label: "PUSH",
          logo: "/p.svg",
          brandId: "push",
          hubHref: null,
        },
      ],
      pastProjects: [
        { id: 10, label: "Adapto Pay", logo: null, hubHref: null },
        { id: 11, label: "Casiba", logo: null, hubHref: null },
        { id: 12, label: "Clearwater", logo: null, hubHref: null },
        { id: 13, label: "Cloronor", logo: null, hubHref: null },
        { id: 14, label: "EXPEDICIÓN POLO", logo: null, hubHref: null },
        {
          id: 15,
          label: "Juegos Provinciales Tecnológicos",
          logo: null,
          hubHref: null,
        },
        { id: 16, label: "Mental Tech Training", logo: null, hubHref: null },
        { id: 17, label: "omni group", logo: null, hubHref: null },
        { id: 18, label: "Templeton & Matthews", logo: null, hubHref: null },
      ],
      currentProjects: [
        { id: 20, label: "Concitar", logo: null, hubHref: null },
        { id: 21, label: "Repuestos Carlitos", logo: null, hubHref: null },
        { id: 22, label: "Taily", logo: null, hubHref: null },
      ],
    });
    const report = compareHomeShadows(
      normalizeLegacyHome(slice, locale),
      normalizeHomeContentV2(v2Home({ locale })),
    );
    assert.equal(report.shadowOk, true, locale);
    assert.equal(report.v2Counts.testimonials, 4);
  }
});
