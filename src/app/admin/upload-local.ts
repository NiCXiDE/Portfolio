"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { mediaUrl } from "@/lib/media";
import { uploadFileToR2 } from "@/lib/media-upload";
import {
  failUpload,
  logUploadFailure,
  type UploadErrorCode,
} from "@/lib/upload-errors";

export type UploadLocalResult =
  | { ok: true; path: string; assetId: string; previewUrl: string }
  | { ok: false; code: UploadErrorCode; error: string };

/**
 * Sube a R2 (imágenes → WebP). Mantiene el nombre histórico usado por el admin.
 *
 * `path` = storage path (`/assets/...`) para persistir en DB/forms.
 * `previewUrl` = misma semántica que `mediaUrl(path)` para previews del admin
 * sin guardar la URL absoluta por accidente.
 *
 * Nunca lanza hacia el cliente: auth, R2 y DB se mapean a `{ ok: false, code, error }`.
 */
export async function uploadLocalAsset(
  formData: FormData,
): Promise<UploadLocalResult> {
  try {
    try {
      await requireAdmin();
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      if (message === "UNAUTHORIZED") {
        return failUpload("UNAUTHORIZED");
      }
      if (message === "FORBIDDEN") {
        return failUpload("FORBIDDEN");
      }
      logUploadFailure({ operation: "requireAdmin" }, e);
      return failUpload("UNKNOWN_UPLOAD_ERROR");
    }

    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "assets/uploads");

    if (!(file instanceof File)) {
      return failUpload("INVALID_FILE");
    }

    const result = await uploadFileToR2(file, folder);
    if (!result.ok) return result;

    return {
      ok: true,
      path: result.path,
      assetId: result.assetId,
      previewUrl: mediaUrl(result.path),
    };
  } catch (e) {
    logUploadFailure({ operation: "uploadLocalAsset" }, e);
    return failUpload("UNKNOWN_UPLOAD_ERROR");
  }
}
