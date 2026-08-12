import type { GraphicSection } from "@/db/entities";

export type SectionSuggestion = {
  section: Exclude<GraphicSection, "pending">;
  reason: string;
  confidence: "low" | "medium" | "high";
};

const CLASSIFIABLE: Exclude<GraphicSection, "pending">[] = [
  "covers",
  "logos",
  "personal",
  "illustration",
  "banners",
  "eventos",
];

/**
 * Heurística suave: sugiere sección por nombre, mime y proporción.
 * No es verdad absoluta — el admin siempre elige.
 */
export type InboxDestinationKind = "graphic" | "ui";

export function suggestInboxKind(input: {
  path?: string | null;
  originalName?: string | null;
}): InboxDestinationKind {
  const name = `${input.originalName ?? ""} ${input.path ?? ""}`.toLowerCase();
  if (
    /ui|ux|app|sistema|dashboard|interfaz|prototype|login|saas|web.?app/.test(
      name,
    )
  ) {
    return "ui";
  }
  return "graphic";
}

export function suggestGraphicSection(input: {
  path?: string | null;
  originalName?: string | null;
  mime?: string | null;
  width?: number | null;
  height?: number | null;
}): SectionSuggestion {
  const name = `${input.originalName ?? ""} ${input.path ?? ""}`.toLowerCase();
  const mime = (input.mime ?? "").toLowerCase();
  const w = input.width && input.width > 0 ? input.width : null;
  const h = input.height && input.height > 0 ? input.height : null;
  const ratio = w && h ? w / h : null;

  if (/\.svg(\b|$)/i.test(name) || mime.includes("svg")) {
    return {
      section: "logos",
      reason: "Archivo vectorial (SVG) → suele ser logo",
      confidence: "high",
    };
  }

  if (/logo|wordmark|isotipo|marca/.test(name)) {
    return {
      section: "logos",
      reason: "El nombre sugiere logo / marca",
      confidence: "high",
    };
  }
  if (/banner|header|hero.?strip|brigado|jbc/.test(name)) {
    return {
      section: "banners",
      reason: "El nombre sugiere banner",
      confidence: "high",
    };
  }
  if (/evento|event|flyer|afiche|insta|publicidad/.test(name)) {
    return {
      section: "eventos",
      reason: "El nombre sugiere evento / publicidad",
      confidence: "high",
    };
  }
  if (/cover|portada|album|disco/.test(name)) {
    return {
      section: "covers",
      reason: "El nombre sugiere portada",
      confidence: "high",
    };
  }
  if (/illust|dibujo|draw|sketch|fan.?art/.test(name)) {
    return {
      section: "illustration",
      reason: "El nombre sugiere ilustración",
      confidence: "medium",
    };
  }
  if (/personal|selfie|retrato|portrait/.test(name)) {
    return {
      section: "personal",
      reason: "El nombre sugiere pieza personal",
      confidence: "medium",
    };
  }

  if (ratio != null) {
    if (ratio >= 2.4) {
      return {
        section: "banners",
        reason: `Proporción muy ancha (${w}×${h})`,
        confidence: "medium",
      };
    }
    if (ratio >= 0.9 && ratio <= 1.15) {
      return {
        section: "logos",
        reason: `Proporción casi cuadrada (${w}×${h})`,
        confidence: "low",
      };
    }
    if (ratio >= 1.4 && ratio <= 1.9) {
      return {
        section: "covers",
        reason: `Proporción landscape tipo portada (${w}×${h})`,
        confidence: "low",
      };
    }
    if (ratio < 0.85) {
      return {
        section: "illustration",
        reason: `Proporción vertical (${w}×${h})`,
        confidence: "low",
      };
    }
  }

  return {
    section: "covers",
    reason: "Sin señales claras — default portadas",
    confidence: "low",
  };
}

export function isClassifiableSection(
  section: string,
): section is Exclude<GraphicSection, "pending"> {
  return (CLASSIFIABLE as string[]).includes(section);
}

export { CLASSIFIABLE as CLASSIFIABLE_GRAPHIC_SECTIONS };
