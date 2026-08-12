export type UiSlideAspect = "landscape" | "portrait";

export type UiSlide = {
  src: string;
  aspect: UiSlideAspect;
};

export function normalizeUiSlides(raw: unknown): UiSlide[] {
  if (!Array.isArray(raw)) return [];
  const out: UiSlide[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push({ src: item.trim(), aspect: "landscape" });
      continue;
    }
    if (item && typeof item === "object" && "src" in item) {
      const src = String((item as { src: unknown }).src ?? "").trim();
      if (!src) continue;
      const aspectRaw = (item as { aspect?: unknown }).aspect;
      const aspect: UiSlideAspect =
        aspectRaw === "portrait" ? "portrait" : "landscape";
      out.push({ src, aspect });
    }
  }
  return out;
}

/** Form: newline paths or JSON array of slides / strings. */
export function parseUiSlidesForm(raw: string): UiSlide[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      return normalizeUiSlides(JSON.parse(trimmed) as unknown);
    } catch {
      /* fall through */
    }
  }
  return trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((src) => ({ src, aspect: "landscape" as const }));
}

export function slideSrcs(slides: readonly UiSlide[]): string[] {
  return slides.map((s) => s.src);
}

export function coverSlide(
  slides: readonly UiSlide[],
): UiSlide | null {
  return slides.find((s) => s.aspect === "landscape") ?? slides[0] ?? null;
}

export function hasMixedAspects(slides: readonly UiSlide[]): boolean {
  let hasL = false;
  let hasP = false;
  for (const s of slides) {
    if (s.aspect === "landscape") hasL = true;
    if (s.aspect === "portrait") hasP = true;
    if (hasL && hasP) return true;
  }
  return false;
}

export function mixedPlatformLabel(
  slides: readonly UiSlide[],
  metaText: string,
  labels: { mixed: string; totem: string },
): string | null {
  if (!hasMixedAspects(slides)) return null;
  if (/t[oó]tem/i.test(metaText)) return labels.totem;
  return labels.mixed;
}
