/**
 * Presentation mapper: HomeContentV2 → current HomeLayer / marquee contract.
 * Does not recreate named_list_items as a domain model.
 */
import type {
  NamedListItemContent,
  TestimonialContent,
} from "@/lib/content";
import type { HomeContentV2 } from "./home";

export type HomeUiLists = {
  companies: NamedListItemContent[];
  pastProjects: NamedListItemContent[];
  currentProjects: NamedListItemContent[];
  testimonials: TestimonialContent[];
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

/**
 * Map V2 Home payload into the shapes InfiniteMarquee + HomeLayer expect.
 * - logoUrl → logo
 * - href → hubHref (external URL or null; never invent /entidades|/marcas)
 */
export function mapHomeContentV2ToCurrentUI(
  home: HomeContentV2,
): HomeUiLists {
  const companies: NamedListItemContent[] = home.entities.map((e) => ({
    id: stableNumericId(`entity:${e.id}`),
    label: e.label,
    logo: e.logoUrl,
    brandId: e.id,
    hubHref: e.href, // null or https?:// — InfiniteMarquee handles external
  }));

  const mapProject = (
    p: HomeContentV2["pastProjects"][number],
  ): NamedListItemContent => ({
    id: stableNumericId(`project:${p.id}`),
    label: p.label,
    logo: null, // covers not required for current marquee chips
    brandId: null,
    hubHref: p.href,
  });

  const pastProjects = home.pastProjects.map(mapProject);
  const currentProjects = home.currentProjects.map(mapProject);

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
  };
}
