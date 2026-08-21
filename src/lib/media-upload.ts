import path from "node:path";
import sharp from "sharp";
import { isR2Configured, uploadToR2 } from "@/lib/r2";
import { registerMediaAsset } from "@/lib/media-assets";
import {
  failUpload,
  logUploadEvent,
  logUploadFailure,
  type UploadErrorCode,
} from "@/lib/upload-errors";

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
  | { ok: false; code: UploadErrorCode; error: string };

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
  | { ok: true; prepared: PreparedUpload }
  | { ok: false; code: UploadErrorCode; error: string }
> {
  if (!(file instanceof File) || file.size === 0) {
    return failUpload("INVALID_FILE");
  }
  if (file.size > MAX_BYTES) {
    return failUpload("FILE_TOO_LARGE");
  }
  if (!isAllowed(file)) {
    return failUpload("UNSUPPORTED_FILE");
  }

  const folder = sanitizeFolder(folderRaw) || "assets/uploads";

  let input: Buffer;
  try {
    input = Buffer.from(await file.arrayBuffer());
  } catch (e) {
    logUploadFailure(
      {
        operation: "prepareUploadFile.arrayBuffer",
        mime: file.type || null,
        byteSize: file.size,
        folder,
      },
      e,
    );
    return failUpload("INVALID_FILE");
  }

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
  } catch (e) {
    logUploadFailure(
      {
        operation: "prepareUploadFile.sharp",
        mime: file.type || null,
        byteSize: input.byteLength,
        folder,
      },
      e,
    );
    return failUpload("IMAGE_PROCESS_FAILED");
  }
}

export async function uploadPreparedToR2(
  prepared: PreparedUpload,
): Promise<UploadAssetResult> {
  if (!isR2Configured()) {
    logUploadEvent("warn", {
      operation: "uploadPreparedToR2",
      code: "R2_NOT_CONFIGURED",
      key: prepared.key,
      mime: prepared.contentType,
      byteSize: prepared.byteSize,
    });
    return failUpload("R2_NOT_CONFIGURED");
  }

  const bucket = process.env.R2_BUCKET;
  let publicPath: string;

  try {
    publicPath = await uploadToR2({
      key: prepared.key,
      body: prepared.body,
      contentType: prepared.contentType,
    });
  } catch (e) {
    logUploadFailure(
      {
        operation: "PutObject",
        bucket,
        key: prepared.key,
        mime: prepared.contentType,
        byteSize: prepared.byteSize,
      },
      e,
    );
    return failUpload("R2_UPLOAD_FAILED");
  }

  try {
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
    // PutObject ya tuvo éxito; el objeto puede existir en R2 sin fila en media_assets.
    logUploadFailure(
      {
        operation: "registerMediaAsset",
        bucket,
        key: prepared.key,
        path: publicPath,
        mime: prepared.contentType,
        byteSize: prepared.byteSize,
      },
      e,
    );
    return failUpload("MEDIA_REGISTRATION_FAILED");
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

export { MAX_BYTES as UPLOAD_MAX_BYTES };
