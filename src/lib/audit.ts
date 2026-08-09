import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getDataSource } from "@/db/data-source";
import {
  AdminAuditLogEntity,
  BioEntity,
  BrandEntity,
  BrandManualEntity,
  GraphicItemEntity,
  NamedListItemEntity,
  SiteSettingsEntity,
  SocialLinkEntity,
  TagEntity,
  TestimonialEntity,
  UiListItemEntity,
  UiProjectEntity,
  type AdminAuditLogRow,
  type AuditAction,
  type AuditEntityType,
  type NamedListKind,
} from "@/db/entities";
import type { AdminSession } from "@/lib/admin-auth";
import {
  normalizeHomeLayout,
  type HomeLayoutConfig,
  type MarqueeSectionConfig,
} from "@/lib/home-layout";
import { withToastQuery } from "@/lib/admin-toast";

export type JsonSnap = Record<string, unknown>;

export function snap<T>(value: T): JsonSnap | null {
  if (value == null) return null;
  return JSON.parse(JSON.stringify(value)) as JsonSnap;
}

export const ENTITY_LABELS: Record<AuditEntityType, string> = {
  bio: "Bio",
  site_settings: "Ajustes",
  home_layout: "Orden home",
  named_list: "Lista",
  testimonial: "Testimonio",
  graphic_item: "Gráfico",
  brand_manual: "Manual",
  ui_project: "Proyecto UI",
  ui_list_item: "Ítem UI",
  tag: "Etiqueta",
  social_link: "Red social",
  brand: "Marca",
};

export const ACTION_LABELS: Record<AuditAction, string> = {
  create: "Creó",
  update: "Actualizó",
  delete: "Eliminó",
  replace: "Reemplazó",
};

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function writeAuditLog(input: {
  session: AdminSession;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  before: JsonSnap | null;
  after: JsonSnap | null;
  undoable?: boolean;
}): Promise<AdminAuditLogRow> {
  const ds = await getDataSource();
  const row: AdminAuditLogRow = {
    id: randomUUID(),
    userId: input.session.userId,
    username: input.session.username,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary.slice(0, 512),
    beforeJson: input.before,
    afterJson: input.after,
    undoable: input.undoable ?? true,
    undoneAt: null,
    createdAt: new Date(),
  };
  await ds.getRepository(AdminAuditLogEntity).save(row);
  return row;
}

export async function finishAdminMutation(input: {
  session: AdminSession;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  before: JsonSnap | null;
  after: JsonSnap | null;
  undoable?: boolean;
  redirectTo: string;
  toastMessage?: string;
}) {
  const log = await writeAuditLog(input);
  revalidatePublic();
  const undoable =
    (input.undoable ?? true) &&
    (input.action === "create" || Boolean(input.before));
  redirect(
    withToastQuery(input.redirectTo, {
      message: input.toastMessage ?? input.summary,
      auditId: log.id,
      undoable,
      variant: input.action === "delete" ? "danger" : "success",
    }),
  );
}

export async function isLatestAudit(log: AdminAuditLogRow): Promise<boolean> {
  if (!log.undoable || log.undoneAt) return false;
  const ds = await getDataSource();
  const latest = await ds.getRepository(AdminAuditLogEntity).findOne({
    where: {
      entityType: log.entityType,
      entityId: log.entityId,
    },
    order: { createdAt: "DESC" },
  });
  return latest?.id === log.id && !latest.undoneAt;
}

async function restoreNamedList(payload: {
  kind: NamedListKind;
  items: Array<{
    label: string;
    logoPath?: string | null;
    brandId?: string | null;
    sortOrder?: number;
    published?: boolean;
    createdAt?: string | null;
  }>;
  marquee?: MarqueeSectionConfig;
}) {
  const ds = await getDataSource();
  const repo = ds.getRepository(NamedListItemEntity);
  await repo.delete({ kind: payload.kind });
  if (payload.items.length) {
    await repo.save(
      payload.items.map((item, sortOrder) => ({
        kind: payload.kind,
        label: item.label,
        logoPath: item.logoPath ?? null,
        brandId: item.brandId ?? null,
        sortOrder: item.sortOrder ?? sortOrder,
        published: item.published ?? true,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      })),
    );
  }
  if (payload.marquee) {
    const settingsRepo = ds.getRepository(SiteSettingsEntity);
    const settings = await settingsRepo.findOneByOrFail({ id: "main" });
    const layout = normalizeHomeLayout(
      settings.homeLayout as HomeLayoutConfig | null,
    );
    layout.marquees[payload.kind] = payload.marquee;
    await settingsRepo.save({
      ...settings,
      homeLayout: normalizeHomeLayout(layout) as unknown as Record<
        string,
        unknown
      >,
    });
  }
}

async function applySnapshot(
  entityType: AuditEntityType,
  action: AuditAction,
  before: JsonSnap | null,
  after: JsonSnap | null,
) {
  const ds = await getDataSource();

  switch (entityType) {
    case "bio": {
      if (!before) throw new Error("No hay snapshot previo");
      await ds.getRepository(BioEntity).save(before as never);
      return;
    }
    case "site_settings": {
      if (!before) throw new Error("No hay snapshot previo");
      await ds.getRepository(SiteSettingsEntity).save(before as never);
      return;
    }
    case "home_layout": {
      if (!before) throw new Error("No hay snapshot previo");
      const settings = await ds
        .getRepository(SiteSettingsEntity)
        .findOneByOrFail({ id: "main" });
      await ds.getRepository(SiteSettingsEntity).save({
        ...settings,
        homeLayout: before as Record<string, unknown>,
      });
      return;
    }
    case "named_list": {
      if (!before) throw new Error("No hay snapshot previo");
      await restoreNamedList(before as never);
      return;
    }
    case "testimonial": {
      const repo = ds.getRepository(TestimonialEntity);
      if (action === "create") {
        const id = String(after?.id ?? "");
        if (id) await repo.delete({ id });
        return;
      }
      if (!before) throw new Error("No hay snapshot previo");
      await repo.save(before as never);
      return;
    }
    case "graphic_item": {
      const repo = ds.getRepository(GraphicItemEntity);
      if (action === "create") {
        const id = String(after?.id ?? "");
        if (id) await repo.delete({ id });
        return;
      }
      if (!before) throw new Error("No hay snapshot previo");
      await repo.save(before as never);
      return;
    }
    case "brand_manual": {
      const repo = ds.getRepository(BrandManualEntity);
      if (action === "create") {
        const id = String(after?.id ?? "");
        if (id) await repo.delete({ id });
        return;
      }
      if (!before) throw new Error("No hay snapshot previo");
      await repo.save(before as never);
      return;
    }
    case "ui_project": {
      const repo = ds.getRepository(UiProjectEntity);
      if (action === "create") {
        const id = String(after?.id ?? "");
        if (id) await repo.delete({ id });
        return;
      }
      if (!before) throw new Error("No hay snapshot previo");
      await repo.save(before as never);
      return;
    }
    case "ui_list_item": {
      const repo = ds.getRepository(UiListItemEntity);
      if (action === "create") {
        const id = String(after?.id ?? "");
        if (id) await repo.delete({ id });
        return;
      }
      if (!before) throw new Error("No hay snapshot previo");
      await repo.save(before as never);
      return;
    }
    case "tag": {
      const repo = ds.getRepository(TagEntity);
      if (action === "create") {
        const slug = String(after?.slug ?? "");
        if (slug) await repo.delete({ slug });
        return;
      }
      if (!before) throw new Error("No hay snapshot previo");
      await repo.save(before as never);
      return;
    }
    case "social_link": {
      const repo = ds.getRepository(SocialLinkEntity);
      if (action === "create") {
        const id = String(after?.id ?? "");
        if (id) await repo.delete({ id });
        return;
      }
      if (!before) throw new Error("No hay snapshot previo");
      await repo.save(before as never);
      return;
    }
    case "brand": {
      const repo = ds.getRepository(BrandEntity);
      if (action === "create") {
        const id = String(after?.id ?? "");
        if (id) await repo.delete({ id });
        return;
      }
      if (!before) throw new Error("No hay snapshot previo");
      await repo.save(before as never);
      return;
    }
    default:
      throw new Error("Tipo no soportado");
  }
}

export async function undoAuditLog(
  auditId: string,
  session: AdminSession,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ds = await getDataSource();
  const repo = ds.getRepository(AdminAuditLogEntity);
  const log = await repo.findOneBy({ id: auditId });
  if (!log) return { ok: false, error: "Registro no encontrado" };
  if (!(await isLatestAudit(log))) {
    return {
      ok: false,
      error: "Solo se puede deshacer el último cambio de ese ítem",
    };
  }

  try {
    await applySnapshot(
      log.entityType,
      log.action,
      log.beforeJson,
      log.afterJson,
    );
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo deshacer",
    };
  }

  log.undoneAt = new Date();
  await repo.save(log);

  await writeAuditLog({
    session,
    action: "update",
    entityType: log.entityType,
    entityId: log.entityId,
    summary: `Deshizo: ${log.summary}`,
    before: log.afterJson,
    after: log.beforeJson,
    undoable: false,
  });

  revalidatePublic();
  return { ok: true };
}
