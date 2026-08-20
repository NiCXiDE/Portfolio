/**
 * Presentation mapper: HomeContentV2 → current HomeLayer / marquee contract.
 * Does not recreate named_list_items as a domain model.
 *
 * 4C.5B: Home UI uses a single Featured Projects list (not status sections).
 * Entity/project hrefs stay in the read model but are not wired as navigation.
 */
import type {
  HomeProjectsPresentation,
  NamedListItemContent,
  TestimonialContent,
} from "@/lib/content";
import type { HomeContentV2 } from "./home";

export type { HomeProjectsPresentation };

export type HomeUiLists = {
  companies: NamedListItemContent[];
  /** Featured projects when presentation=featured; past-only when legacy-split. */
  pastProjects: NamedListItemContent[];
  /** Empty when presentation=featured (Current section not rendered). */
  currentProjects: NamedListItemContent[];
  testimonials: TestimonialContent[];
  homeProjectsPresentation: HomeProjectsPresentation;
};

/** Stable positive int for React keys / legacy NamedListItemContent.id. */
export function stableNumericId(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  const n = Math.abs(h);
  return n === 0 ? 1 : n;
}

function toLocalizedBoth(value: string): { es: string; en: string } {
  return { es: value, en: value };
}

function mapProjectChip(
  p: HomeContentV2["featuredProjects"][number],
): NamedListItemContent {
  return {
    id: stableNumericId(`project:${p.id}`),
    label: p.label,
    logo: null,
    brandId: null,
    // Project detail routes do not exist yet — label only.
    hubHref: null,
  };
}

/**
 * Map V2 Home payload into the shapes InfiniteMarquee + HomeLayer expect.
 * - logoUrl → logo
 * - Entity/project hrefs intentionally omitted from hubHref for Home (4C.5B)
 */
export function mapHomeContentV2ToCurrentUI(
  home: HomeContentV2,
): HomeUiLists {
  const companies: NamedListItemContent[] = home.entities.map((e) => ({
    id: stableNumericId(`entity:${e.id}`),
    label: e.label,
    logo: e.logoUrl,
    brandId: e.id,
    // Keep visitor on portfolio; external entity URLs stay in read model only.
    hubHref: null,
  }));

  const featuredSource =
    home.featuredProjects.length > 0
      ? home.featuredProjects
      : [...home.pastProjects, ...home.currentProjects].sort((a, b) => {
          const ao = a.homeOrder ?? Number.POSITIVE_INFINITY;
          const bo = b.homeOrder ?? Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          return a.id.localeCompare(b.id);
        });

  const pastProjects = featuredSource.map(mapProjectChip);
  const currentProjects: NamedListItemContent[] = [];

  const testimonials: TestimonialContent[] = home.testimonials.map((row) => ({
    id: row.id,
    name: row.name,
    image: row.imageUrl,
    quote: toLocalizedBoth(row.quote),
    role: toLocalizedBoth(row.role),
    company: {
      name: row.organization.name,
      logo: row.organization.logoUrl,
      href: row.organization.href,
      linkLabel: row.organization.linkLabel
        ? toLocalizedBoth(row.organization.linkLabel)
        : null,
    },
  }));

  return {
    companies,
    pastProjects,
    currentProjects,
    testimonials,
    homeProjectsPresentation: "featured",
  };
}
