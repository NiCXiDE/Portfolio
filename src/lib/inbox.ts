import { randomUUID } from "crypto";
import { getDataSource } from "@/db/data-source";
import {
  GraphicItemEntity,
  InboxItemEntity,
  type InboxItemRow,
} from "@/db/entities";

/** Migra graphic_items.section=pending → inbox_items (idempotente por path). */
export async function migrateGraphicPendingToInbox(): Promise<number> {
  const ds = await getDataSource();
  const graphicRepo = ds.getRepository(GraphicItemEntity);
  const inboxRepo = ds.getRepository(InboxItemEntity);
  const pending = await graphicRepo.find({ where: { section: "pending" } });
  if (!pending.length) return 0;

  let migrated = 0;
  for (const row of pending) {
    const existing = await inboxRepo.findOneBy({ path: row.srcPath });
    if (!existing) {
      const item: InboxItemRow = {
        id: randomUUID(),
        path: row.srcPath,
        assetId: row.srcAssetId,
        originalName: row.alt || null,
        mime: null,
        width: null,
        height: null,
        createdAt: new Date(),
      };
      await inboxRepo.save(item);
      migrated += 1;
    }
    await graphicRepo.delete({ id: row.id });
  }
  return migrated;
}

export async function listInboxItems(): Promise<InboxItemRow[]> {
  const ds = await getDataSource();
  return ds.getRepository(InboxItemEntity).find({
    order: { createdAt: "DESC" },
  });
}
