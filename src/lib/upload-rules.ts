/**
 * Reglas de upload compartidas (cliente + servidor).
 * Mantener alineado con `prepareUploadFile` / ImageDropField.
 */

export const UPLOAD_MAX_BYTES = 20 * 1024 * 1024;

export const UPLOAD_IMAGE_EXTS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
] as const;

export const UPLOAD_PDF_EXTS = ["pdf"] as const;

export type UploadProfile = "logo" | "image" | "pdf" | "any";

export type UploadRuleHint = {
  /** Línea principal: formatos + recomendado + máx. */
  summary: string;
  /** Nota opcional (p.ej. SVG para tema). */
  note?: string;
  accept: string;
};

const EXT_LABEL: Record<UploadProfile, string> = {
  logo: "SVG, PNG, JPG, WebP y GIF",
  image: "PNG, JPG, WebP, GIF y SVG",
  pdf: "PDF",
  any: "imágenes (SVG, PNG, JPG, WebP, GIF) y PDF",
};

function maxLabel(): string {
  const mb = UPLOAD_MAX_BYTES / (1024 * 1024);
  return `Máx. ${mb} MB`;
}

export function uploadRuleHint(profile: UploadProfile): UploadRuleHint {
  switch (profile) {
    case "logo":
      return {
        summary: `Admite ${EXT_LABEL.logo} · Recomendado: SVG · ${maxLabel()}`,
        note: "Para logos monocromáticos, preferí SVG para adaptar el color al tema.",
        accept: "image/*,.jpg,.jpeg,.png,.webp,.gif,.svg",
      };
    case "image":
      return {
        summary: `Admite ${EXT_LABEL.image} · Recomendado: WebP o PNG · ${maxLabel()}`,
        accept: "image/*,.jpg,.jpeg,.png,.webp,.gif,.svg",
      };
    case "pdf":
      return {
        summary: `Admite ${EXT_LABEL.pdf} · ${maxLabel()}`,
        accept: "application/pdf,.pdf",
      };
    case "any":
    default:
      return {
        summary: `Admite ${EXT_LABEL.any} · ${maxLabel()}`,
        accept:
          "image/*,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.svg,.pdf",
      };
  }
}

export function fileExtension(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name.trim());
  return m?.[1]?.toLowerCase() ?? "";
}

export function isAllowedUploadFile(
  file: Pick<File, "name" | "type" | "size">,
  profile: UploadProfile = "any",
): boolean {
  if (profile === "pdf") {
    return (
      file.type === "application/pdf" ||
      fileExtension(file.name) === "pdf"
    );
  }
  if (profile === "logo" || profile === "image") {
    return (
      file.type.startsWith("image/") ||
      UPLOAD_IMAGE_EXTS.includes(
        fileExtension(file.name) as (typeof UPLOAD_IMAGE_EXTS)[number],
      )
    );
  }
  return (
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    /\.(jpe?g|png|webp|gif|svg|pdf)$/i.test(file.name)
  );
}

/**
 * Validación previa en cliente. Devuelve código o null si OK.
 * El servidor vuelve a validar.
 */
export function preflightUploadFile(
  file: Pick<File, "name" | "type" | "size">,
  profile: UploadProfile = "any",
): "INVALID_FILE" | "FILE_TOO_LARGE" | "UNSUPPORTED_FILE" | null {
  if (!file || file.size <= 0) return "INVALID_FILE";
  if (file.size > UPLOAD_MAX_BYTES) return "FILE_TOO_LARGE";
  if (!isAllowedUploadFile(file, profile)) return "UNSUPPORTED_FILE";
  return null;
}
