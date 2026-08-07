"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireSession } from "@/lib/admin-auth";

export type UploadLocalResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

export async function uploadLocalAsset(
  formData: FormData,
): Promise<UploadLocalResult> {
  await requireSession();

  const file = formData.get("file");
  const folderRaw = String(formData.get("folder") ?? "assets/uploads");
  const folder = folderRaw
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+/, "")
    .replace(/^public\//, "");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Elegí un archivo." };
  }
  if (file.size > 20 * 1024 * 1024) {
    return { ok: false, error: "El archivo supera 20 MB." };
  }

  const okType =
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    /\.(jpe?g|png|webp|gif|svg|pdf)$/i.test(file.name);
  if (!okType) {
    return { ok: false, error: "Solo imágenes o PDF." };
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const rel = path.posix.join(
    folder || "assets/uploads",
    `${Date.now()}-${safeName}`,
  );
  const abs = path.join(process.cwd(), "public", ...rel.split("/"));

  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(await file.arrayBuffer()));

  return { ok: true, path: `/${rel}` };
}
