import path from "node:path";
import sharp from "sharp";
import { isR2Configured, uploadToR2 } from "@/lib/r2";
import { registerMediaAsset } from "@/lib/media-assets";

const MAX_BYTES = 20 * 1024 * 1024;
const WEBP_QUALITY = 82;
const MAX_EDGE = 4096;

export type PreparedUpload = {
  key: string;
  body: Buffer;
  contentType: string;
  width: number | null;
  height: number | null;
  originalName: string;
  byteSize: number;
};

export type UploadAssetResult =
  | { ok: true; path: string; assetId: string }
  | { ok: false; error: string };

function sanitizeFolder(folderRaw: string): string {
  return folderRaw
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+/, "")
    .replace(/^public\//, "");
}

function baseNameWithoutExt(name: string): string {
  const safe = name.replace(/[^\w.\-]+/g, "_");
  const parsed = path.posix.parse(safe);
  return parsed.name || "file";
}

function isSvg(file: File, buffer: Buffer): boolean {
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) return true;
  const head = buffer.subarray(0, 256).toString("utf8").trimStart();
  return head.startsWith("<svg") || head.includes("http://www.w3.org/2000/svg");
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isAllowed(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    /\.(jpe?g|png|webp|gif|svg|pdf)$/i.test(file.name)
  );
}

/**
 * Raster → WebP comprimido. SVG y PDF se dejan intactos.
 */
export async function prepareUploadFile(
  file: File,
  folderRaw = "assets/uploads",
): Promise<
  { ok: true; prepared: PreparedUpload } | { ok: false; error: string }
> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Elegí un archivo." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "El archivo supera 20 MB." };
  }
  if (!isAllowed(file)) {
    return { ok: false, error: "Solo imágenes o PDF." };
  }

  const folder = sanitizeFolder(folderRaw) || "assets/uploads";
  const input = Buffer.from(await file.arrayBuffer());
  const stamp = Date.now();
  const stem = baseNameWithoutExt(file.name);

  if (isPdf(file)) {
    const key = `${folder}/${stamp}-${stem}.pdf`;
    return {
      ok: true,
      prepared: {
        key,
        body: input,
        contentType: "application/pdf",
        width: null,
        height: null,
        originalName: file.name,
        byteSize: input.byteLength,
      },
    };
  }

  if (isSvg(file, input)) {
    const key = `${folder}/${stamp}-${stem}.svg`;
    return {
      ok: true,
      prepared: {
        key,
        body: input,
        contentType: "image/svg+xml",
        width: null,
        height: null,
        originalName: file.name,
        byteSize: input.byteLength,
      },
    };
  }

  try {
    const meta = await sharp(input, {
      animated: true,
      failOn: "none",
    }).metadata();

    let pipeline = sharp(input, {
      animated: true,
      failOn: "none",
    }).rotate();

    const maxSide = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (maxSide > MAX_EDGE) {
      pipeline = pipeline.resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const { data, info } = await pipeline
      .webp({
        quality: WEBP_QUALITY,
        effort: 4,
      })
      .toBuffer({ resolveWithObject: true });

    const key = `${folder}/${stamp}-${stem}.webp`;
    return {
      ok: true,
      prepared: {
        key,
        body: data,
        contentType: "image/webp",
        width: info.width || meta.width || null,
        height: info.height || meta.height || null,
        originalName: file.name,
        byteSize: data.byteLength,
      },
    };
  } catch {
    return {
      ok: false,
      error: "No se pudo comprimir la imagen. Probá otro archivo.",
    };
  }
}

export async function uploadPreparedToR2(
  prepared: PreparedUpload,
): Promise<UploadAssetResult> {
  if (!isR2Configured()) {
    return {
      ok: false,
      error:
        "R2 no configurado. Completá R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET y R2_PUBLIC_URL.",
    };
  }

  try {
    const publicPath = await uploadToR2({
      key: prepared.key,
      body: prepared.body,
      contentType: prepared.contentType,
    });
    const asset = await registerMediaAsset({
      path: publicPath,
      mime: prepared.contentType,
      width: prepared.width,
      height: prepared.height,
      originalName: prepared.originalName,
      byteSize: prepared.byteSize,
    });
    return { ok: true, path: publicPath, assetId: asset.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error subiendo a R2";
    return { ok: false, error: message };
  }
}

export async function uploadFileToR2(
  file: File,
  folderRaw = "assets/uploads",
): Promise<UploadAssetResult> {
  const prepared = await prepareUploadFile(file, folderRaw);
  if (!prepared.ok) return prepared;
  return uploadPreparedToR2(prepared.prepared);
}
