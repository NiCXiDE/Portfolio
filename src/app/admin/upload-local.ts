"use server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  uploadFileToR2,
  type UploadAssetResult,
} from "@/lib/media-upload";

export type UploadLocalResult = UploadAssetResult;

/** Sube a R2 (imágenes → WebP). Mantiene el nombre histórico usado por el admin. */
export async function uploadLocalAsset(
  formData: FormData,
): Promise<UploadLocalResult> {
  await requireAdmin();

  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "assets/uploads");

  if (!(file instanceof File)) {
    return { ok: false, error: "Elegí un archivo." };
  }

  return uploadFileToR2(file, folder);
}
