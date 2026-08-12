export type GraphicFrame =
  | "square" // 1:1
  | "landscape" // ~16:9
  | "portrait" // ~3:4
  | "four-three" // ~4:3
  | "five-four" // ~5:4
  | "banner"; // ~1:2 (alto)

export type GraphicGalleryLabel = {
  es: string;
  en: string;
};

export type GraphicGalleryItem = {
  src: string;
  label?: GraphicGalleryLabel;
  frame?: GraphicFrame;
};

export function aspectClass(frame?: GraphicFrame): string {
  if (!frame) return "aspect-video";
  switch (frame) {
    case "square":
      return "aspect-square";
    case "landscape":
      return "aspect-video";
    case "portrait":
      return "aspect-[3/4]";
    case "four-three":
      return "aspect-[4/3]";
    case "five-four":
      return "aspect-[5/4]";
    case "banner":
      return "aspect-[1/2]";
  }
}

function ratioToFrame(r: number): GraphicFrame {
  // r = width/height
  if (!Number.isFinite(r) || r <= 0) return "landscape";

  // Common ratios (with generous buckets to tolerate export variance):
  // square: 1.00
  // 4:3 => 1.33
  // 16:9 => 1.78
  // 5:4 => 1.25
  // portrait uses inverse: width/height ~0.75
  if (r >= 1.55) return "landscape";
  if (r >= 1.32) return "four-three";
  if (r >= 1.18) return "five-four";
  if (r >= 0.92) return "square";
  if (r >= 0.66) return "portrait";
  return "banner";
}

/** Infer a graphic frame preset from raw dimensions. */
export function inferFrameFromDimensions(
  width: number | null | undefined,
  height: number | null | undefined,
): GraphicFrame {
  if (!width || !height) return "landscape";
  const r = width / height;
  return ratioToFrame(r);
}

/**
 * Normaliza `gallery_paths` (DB) hacia `{src, frame?, label?}`.
 * Soporta legado:
 * - string[] (solo src)
 * - objetos {src, frame?, label?}
 */
export function normalizeGraphicGallery(
  raw: unknown,
): GraphicGalleryItem[] {
  if (!Array.isArray(raw)) return [];

  const out: GraphicGalleryItem[] = [];
  for (const entry of raw) {
    if (!entry) continue;
    if (typeof entry === "string") {
      const src = entry.trim();
      if (!src) continue;
      out.push({ src });
      continue;
    }
    if (typeof entry === "object") {
      const obj = entry as Record<string, unknown>;
      const srcVal = obj.src ?? obj.path ?? null;
      if (typeof srcVal !== "string") continue;
      const src = srcVal.trim();
      if (!src) continue;

      const frameRaw = obj.frame;
      const frame =
        typeof frameRaw === "string" ? (frameRaw as GraphicFrame) : undefined;

      let label: GraphicGalleryLabel | undefined;
      if (
        obj.label &&
        typeof obj.label === "object" &&
        obj.label !== null
      ) {
        const lbl = obj.label as Record<string, unknown>;
        if (typeof lbl.es === "string" && typeof lbl.en === "string") {
          label = { es: lbl.es, en: lbl.en };
        }
      }

      out.push({ src, frame, label });
    }
  }
  return out;
}

