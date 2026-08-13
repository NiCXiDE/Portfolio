/**
 * Canonical slug helpers for Content Model V2.
 * Language-agnostic; used for entities, projects, and optional piece URLs.
 */

const SLUG_MAX_LENGTH = 128;

/** Strip accents, lowercase, hyphens; remove invalid characters. */
export function slugify(input: string, maxLength = SLUG_MAX_LENGTH): string {
  const base = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return base || "item";
}

/**
 * Resolve slug collisions by appending -2, -3, …
 * `exists` receives the candidate slug and returns true if taken.
 */
export async function resolveUniqueSlug(
  baseInput: string,
  exists: (slug: string) => boolean | Promise<boolean>,
  maxLength = SLUG_MAX_LENGTH,
): Promise<string> {
  const base = slugify(baseInput, maxLength);
  if (!(await exists(base))) return base;

  for (let n = 2; n <= 9999; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, maxLength - suffix.length)}${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  throw new Error(`Unable to resolve unique slug for "${baseInput}"`);
}

/** Sync variant for tests and seed scripts. */
export function resolveUniqueSlugSync(
  baseInput: string,
  exists: (slug: string) => boolean,
  maxLength = SLUG_MAX_LENGTH,
): string {
  const base = slugify(baseInput, maxLength);
  if (!exists(base)) return base;

  for (let n = 2; n <= 9999; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, maxLength - suffix.length)}${suffix}`;
    if (!exists(candidate)) return candidate;
  }

  throw new Error(`Unable to resolve unique slug for "${baseInput}"`);
}
