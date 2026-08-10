import { randomUUID } from "crypto";
import { getDataSource } from "@/db/data-source";
import { MediaAssetEntity, type MediaAssetRow } from "@/db/entities";

export type RegisterMediaInput = {
  path: string;
  mime?: string | null;
  width?: number | null;
  height?: number | null;
  originalName?: string | null;
  byteSize?: number | null;
};

/** Registra un archivo en la biblioteca (idempotente por path). */
export async function registerMediaAsset(
  input: RegisterMediaInput,
): Promise<MediaAssetRow> {
  const ds = await getDataSource();
  const repo = ds.getRepository(MediaAssetEntity);
  const existing = await repo.findOneBy({ path: input.path });
  if (existing) {
    const patched = {
      ...existing,
      mime: input.mime ?? existing.mime,
      width: input.width ?? existing.width,
      height: input.height ?? existing.height,
      originalName: input.originalName ?? existing.originalName,
      byteSize: input.byteSize ?? existing.byteSize,
    };
    await repo.save(patched);
    return patched;
  }
  const row: MediaAssetRow = {
    id: randomUUID(),
    path: input.path,
    mime: input.mime ?? null,
    width: input.width ?? null,
    height: input.height ?? null,
    originalName: input.originalName ?? null,
    byteSize: input.byteSize ?? null,
    createdAt: new Date(),
  };
  await repo.save(row);
  return row;
}

export async function findMediaAssetByPath(
  path: string,
): Promise<MediaAssetRow | null> {
  const ds = await getDataSource();
  return ds.getRepository(MediaAssetEntity).findOneBy({ path });
}

export async function listRecentMediaAssets(
  limit = 48,
): Promise<MediaAssetRow[]> {
  const ds = await getDataSource();
  return ds.getRepository(MediaAssetEntity).find({
    order: { createdAt: "DESC" },
    take: limit,
  });
}
