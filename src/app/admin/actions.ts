"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { getDataSource } from "@/db/data-source";
import {
  BioEntity,
  BrandEntity,
  BrandManualEntity,
  GraphicItemEntity,
  InboxItemEntity,
  NamedListItemEntity,
  SiteSettingsEntity,
  SocialLinkEntity,
  TagEntity,
  TestimonialEntity,
  UiListItemEntity,
  UiProjectEntity,
  type GraphicSection,
  type LocalizedJson,
  type NamedListKind,
  type UiCategory,
} from "@/db/entities";
import { requireAdmin } from "@/lib/admin-auth";
import { isR2Configured, uploadToR2 } from "@/lib/r2";
import {
  normalizeHomeLayout,
  type HomeLayoutConfig,
  type MarqueeDirection,
  type MarqueeDisplayMode,
} from "@/lib/home-layout";
import {
  finishAdminMutation,
  snap,
  undoAuditLog,
} from "@/lib/audit";
import { withToastQuery } from "@/lib/admin-toast";
import { slugifyBrand } from "@/lib/brands";
import { findMediaAssetByPath } from "@/lib/media-assets";
import { isClassifiableSection } from "@/lib/suggest-graphic-section";
import { revalidatePath } from "next/cache";

function loc(es: FormDataEntryValue | null, en: FormDataEntryValue | null): LocalizedJson {
  return { es: String(es ?? ""), en: String(en ?? "") };
}

function bool(v: FormDataEntryValue | null) {
  return v === "on" || v === "true" || v === "1";
}

export async function undoAdminChange(formData: FormData) {
  const session = await requireAdmin();
  const auditId = String(formData.get("auditId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin");
  const result = await undoAuditLog(auditId, session);
  if (!result.ok) {
    redirect(
      withToastQuery(redirectTo, {
        message: result.error,
        undoable: false,
        variant: "danger",
      }),
    );
  }
  redirect(
    withToastQuery(redirectTo, {
      message: "Cambio deshecho",
      undoable: false,
      variant: "success",
    }),
  );
}

/** Client-callable undo for toast button */
export async function undoAdminChangeAction(auditId: string) {
  const session = await requireAdmin();
  return undoAuditLog(auditId, session);
}

export async function saveBrand(formData: FormData) {
  const session = await requireAdmin();
  let id = String(formData.get("id") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/brands?error=name");
  if (!id) id = slugifyBrand(name);
  const ds = await getDataSource();
  const repo = ds.getRepository(BrandEntity);
  const existing = await repo.findOneBy({ id });
  const before = snap(existing);
  const logoPath = String(formData.get("logoPath") ?? "") || null;
  const logoAssetId =
    String(formData.get("logoAssetId") ?? "").trim() ||
    (logoPath
      ? (await findMediaAssetByPath(logoPath))?.id ?? null
      : null);
  const after = {
    id,
    name,
    logoPath,
    logoAssetId,
    href: String(formData.get("href") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
    createdAt: existing?.createdAt ?? new Date(),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: existing ? "update" : "create",
    entityType: "brand",
    entityId: id,
    summary: existing ? `Actualizó marca “${name}”` : `Creó marca “${name}”`,
    before,
    after: snap(after),
    redirectTo: "/admin/brands",
    toastMessage: existing ? "Marca guardada" : "Marca creada",
  });
}

export async function deleteBrand(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ds = await getDataSource();
  const repo = ds.getRepository(BrandEntity);
  const before = snap(await repo.findOneBy({ id }));
  await repo.delete({ id });
  await finishAdminMutation({
    session,
    action: "delete",
    entityType: "brand",
    entityId: id,
    summary: `Eliminó marca “${id}”`,
    before,
    after: null,
    redirectTo: "/admin/brands",
    toastMessage: "Marca eliminada",
  });
}

export async function saveBio(formData: FormData) {
  const session = await requireAdmin();
  const ds = await getDataSource();
  const repo = ds.getRepository(BioEntity);
  const before = snap(await repo.findOneBy({ id: "main" }));
  const after = {
    id: "main",
    photoPath: String(formData.get("photoPath") ?? ""),
    photoAlt: loc(formData.get("photoAltEs"), formData.get("photoAltEn")),
    signaturePath: String(formData.get("signaturePath") ?? ""),
    signatureAlt: loc(
      formData.get("signatureAltEs"),
      formData.get("signatureAltEn"),
    ),
    cvPath: String(formData.get("cvPath") ?? "") || null,
    cvPathEn: String(formData.get("cvPathEn") ?? "") || null,
    text: loc(formData.get("textEs"), formData.get("textEn")),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: "update",
    entityType: "bio",
    entityId: "main",
    summary: "Actualizó bio / CV",
    before,
    after: snap(after),
    redirectTo: "/admin/bio",
    toastMessage: "Bio guardada",
  });
}

export async function saveSettings(formData: FormData) {
  const session = await requireAdmin();
  const ds = await getDataSource();
  const repo = ds.getRepository(SiteSettingsEntity);
  const existing = await repo.findOneBy({ id: "main" });
  const before = snap(existing);
  const after = {
    id: "main",
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    noteEs: String(formData.get("noteEs") ?? ""),
    noteEn: String(formData.get("noteEn") ?? ""),
    poweredBy: String(formData.get("poweredBy") ?? ""),
    carouselIntervalMs: Number(formData.get("carouselIntervalMs") ?? 2000),
    graphicPreviewLimit: Number(formData.get("graphicPreviewLimit") ?? 7),
    interfacesPreviewLimit: Number(
      formData.get("interfacesPreviewLimit") ?? 7,
    ),
    homeLayout: existing?.homeLayout ?? null,
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: "update",
    entityType: "site_settings",
    entityId: "main",
    summary: "Actualizó ajustes del sitio",
    before,
    after: snap(after),
    redirectTo: "/admin/settings",
    toastMessage: "Ajustes guardados",
  });
}

export async function saveHomeLayout(formData: FormData) {
  const session = await requireAdmin();
  const ds = await getDataSource();
  const repo = ds.getRepository(SiteSettingsEntity);
  const existing = await repo.findOneByOrFail({ id: "main" });
  const before = snap(
    normalizeHomeLayout(existing.homeLayout as HomeLayoutConfig | null),
  );
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(String(formData.get("homeLayout") ?? "null"));
  } catch {
    parsed = null;
  }
  const layout = normalizeHomeLayout(parsed as HomeLayoutConfig | null);
  await repo.save({
    ...existing,
    homeLayout: layout as unknown as Record<string, unknown>,
  });
  await finishAdminMutation({
    session,
    action: "update",
    entityType: "home_layout",
    entityId: "main",
    summary: "Cambió el orden de secciones del home",
    before,
    after: snap(layout),
    redirectTo: "/admin/lists",
    toastMessage: "Orden del home guardado",
  });
}

export async function saveNamedList(formData: FormData) {
  const session = await requireAdmin();
  const kind = String(formData.get("kind")) as NamedListKind;
  const ds = await getDataSource();

  let items: {
    label: string;
    logoPath?: string | null;
    brandId?: string | null;
    createdAt?: string | null;
  }[] = [];
  const itemsJson = String(formData.get("itemsJson") ?? "").trim();
  if (itemsJson) {
    try {
      const parsed = JSON.parse(itemsJson) as unknown;
      if (Array.isArray(parsed)) {
        items = parsed
          .map((row) => {
            if (typeof row === "string") {
              return {
                label: row.trim(),
                logoPath: null,
                brandId: null,
                createdAt: null,
              };
            }
            if (row && typeof row === "object") {
              const r = row as {
                label?: unknown;
                logoPath?: unknown;
                brandId?: unknown;
                createdAt?: unknown;
              };
              return {
                label: String(r.label ?? "").trim(),
                logoPath: String(r.logoPath ?? "").trim() || null,
                brandId: String(r.brandId ?? "").trim() || null,
                createdAt: String(r.createdAt ?? "").trim() || null,
              };
            }
            return {
              label: "",
              logoPath: null,
              brandId: null,
              createdAt: null,
            };
          })
          .filter((r) => r.label);
      }
    } catch {
      items = [];
    }
  } else {
    const raw = String(formData.get("items") ?? "");
    items = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((label) => ({
        label,
        logoPath: null,
        brandId: null,
        createdAt: null,
      }));
  }

  const repo = ds.getRepository(NamedListItemEntity);
  const prevItems = await repo.find({
    where: { kind },
    order: { sortOrder: "ASC" },
  });
  const settingsRepo = ds.getRepository(SiteSettingsEntity);
  const settings = await settingsRepo.findOneByOrFail({ id: "main" });
  const layoutBefore = normalizeHomeLayout(
    settings.homeLayout as HomeLayoutConfig | null,
  );

  const before = snap({
    kind,
    items: prevItems.map((i) => ({
      label: i.label,
      logoPath: i.logoPath,
      brandId: i.brandId,
      sortOrder: i.sortOrder,
      published: i.published,
      createdAt: i.createdAt?.toISOString?.() ?? i.createdAt,
    })),
    marquee: layoutBefore.marquees[kind],
  });

  await repo.delete({ kind });
  await repo.save(
    items.map((item, sortOrder) => ({
      kind,
      label: item.label,
      logoPath: item.logoPath ?? null,
      brandId: item.brandId ?? null,
      sortOrder,
      published: true,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    })),
  );

  const lines = formData.get("lines");
  const direction = formData.get("direction");
  const speed = formData.get("speed");
  const displayMode = formData.get("displayMode");
  let layoutAfter = layoutBefore;
  if (lines != null || direction != null || speed != null || displayMode != null) {
    layoutAfter = normalizeHomeLayout({
      ...layoutBefore,
      marquees: {
        ...layoutBefore.marquees,
        [kind]: {
          lines: Number(lines ?? layoutBefore.marquees[kind].lines),
          direction: String(
            direction ?? layoutBefore.marquees[kind].direction,
          ) as MarqueeDirection,
          speed: Number(speed ?? layoutBefore.marquees[kind].speed),
          displayMode: String(
            displayMode ?? layoutBefore.marquees[kind].displayMode,
          ) as MarqueeDisplayMode,
        },
      },
    });
    await settingsRepo.save({
      ...settings,
      homeLayout: layoutAfter as unknown as Record<string, unknown>,
    });
  }

  const after = snap({
    kind,
    items: items.map((item, sortOrder) => ({
      label: item.label,
      logoPath: item.logoPath ?? null,
      brandId: item.brandId ?? null,
      sortOrder,
      published: true,
      createdAt: item.createdAt ?? null,
    })),
    marquee: layoutAfter.marquees[kind],
  });

  await finishAdminMutation({
    session,
    action: "replace",
    entityType: "named_list",
    entityId: kind,
    summary: `Actualizó lista ${kind}`,
    before,
    after,
    redirectTo: "/admin/lists",
    toastMessage: "Lista guardada",
  });
}

export async function saveTestimonial(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/testimonials?error=id");
  const ds = await getDataSource();
  const repo = ds.getRepository(TestimonialEntity);
  const existing = await repo.findOneBy({ id });
  const before = snap(existing);
  const after = {
    id,
    name: String(formData.get("name") ?? ""),
    imagePath: String(formData.get("imagePath") ?? ""),
    quote: loc(formData.get("quoteEs"), formData.get("quoteEn")),
    role: loc(formData.get("roleEs"), formData.get("roleEn")),
    companyName: String(formData.get("companyName") ?? ""),
    companyLogoPath: String(formData.get("companyLogoPath") ?? "") || null,
    companyHref: String(formData.get("companyHref") ?? "") || null,
    companyBrandId: String(formData.get("companyBrandId") ?? "").trim() || null,
    linkLabel:
      String(formData.get("linkLabelEs") ?? "").trim() ||
      String(formData.get("linkLabelEn") ?? "").trim()
        ? loc(formData.get("linkLabelEs"), formData.get("linkLabelEn"))
        : null,
    hidden: bool(formData.get("hidden")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: existing ? "update" : "create",
    entityType: "testimonial",
    entityId: id,
    summary: existing
      ? `Actualizó testimonio “${after.name}”`
      : `Creó testimonio “${after.name}”`,
    before,
    after: snap(after),
    redirectTo: "/admin/testimonials",
    toastMessage: existing ? "Testimonio guardado" : "Testimonio creado",
  });
}

export async function deleteTestimonial(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ds = await getDataSource();
  const repo = ds.getRepository(TestimonialEntity);
  const before = snap(await repo.findOneBy({ id }));
  await repo.delete({ id });
  await finishAdminMutation({
    session,
    action: "delete",
    entityType: "testimonial",
    entityId: id,
    summary: `Eliminó testimonio ${id}`,
    before,
    after: null,
    redirectTo: "/admin/testimonials",
    toastMessage: "Testimonio eliminado",
  });
}

export async function saveGraphicItem(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const section = String(formData.get("section")) as GraphicSection;
  if (!id) redirect(`/admin/graphic/${section}?error=id`);
  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const ds = await getDataSource();
  const repo = ds.getRepository(GraphicItemEntity);
  const existing = await repo.findOneBy({ id });
  const before = snap(existing);
  const srcPath = String(formData.get("srcPath") ?? "");
  const relatedSrcPath =
    String(formData.get("relatedSrcPath") ?? "") || null;
  const srcAssetId =
    String(formData.get("srcAssetId") ?? "").trim() ||
    (srcPath ? (await findMediaAssetByPath(srcPath))?.id ?? null : null);
  const relatedAssetId =
    String(formData.get("relatedAssetId") ?? "").trim() ||
    (relatedSrcPath
      ? (await findMediaAssetByPath(relatedSrcPath))?.id ?? null
      : null);
  const after = {
    id,
    section,
    srcPath,
    srcAssetId,
    alt: String(formData.get("alt") ?? ""),
    title: loc(formData.get("titleEs"), formData.get("titleEn")),
    year: String(formData.get("year") ?? "") || null,
    detail: loc(formData.get("detailEs"), formData.get("detailEn")),
    href: String(formData.get("href") ?? "") || null,
    hrefLabel: loc(formData.get("hrefLabelEs"), formData.get("hrefLabelEn")),
    tags: tags.length ? tags : null,
    fit:
      formData.get("fit") === "contain" || formData.get("fit") === "cover"
        ? (formData.get("fit") as "cover" | "contain")
        : null,
    relatedSrcPath,
    relatedAssetId,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: existing ? "update" : "create",
    entityType: "graphic_item",
    entityId: id,
    summary: existing
      ? `Actualizó ítem gráfico “${id}”`
      : `Creó ítem gráfico “${id}”`,
    before,
    after: snap(after),
    redirectTo: `/admin/graphic/${section}`,
    toastMessage: existing ? "Ítem guardado" : "Ítem creado",
  });
}

export async function enqueueInboxItem(formData: FormData) {
  const session = await requireAdmin();
  const srcPath = String(formData.get("path") ?? "").trim();
  if (!srcPath) {
    return { ok: false as const, error: "Falta la ruta del archivo." };
  }
  const asset =
    (await findMediaAssetByPath(srcPath)) ??
    null;
  const assetId =
    String(formData.get("assetId") ?? "").trim() || asset?.id || null;
  const originalName =
    String(formData.get("originalName") ?? "").trim() ||
    asset?.originalName ||
    null;
  const id = randomUUID();
  const ds = await getDataSource();
  const after = {
    id,
    path: srcPath,
    assetId,
    originalName,
    mime: asset?.mime ?? null,
    width: asset?.width ?? null,
    height: asset?.height ?? null,
    createdAt: new Date(),
  };
  await ds.getRepository(InboxItemEntity).save(after);
  await finishAdminMutation({
    session,
    action: "create",
    entityType: "inbox_item",
    entityId: id,
    summary: `Encoló pendiente “${originalName || id}”`,
    before: null,
    after: snap(after),
    redirectTo: "/admin",
    toastMessage: "Agregado a pendientes",
    skipRedirect: true,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/pending");
  return { ok: true as const, id };
}

/** @deprecated alias */
export const enqueuePendingGraphic = enqueueInboxItem;

export async function classifyInboxItem(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const destination = String(formData.get("destination") ?? "graphic").trim();
  if (!id) redirect("/admin/pending?error=id");

  const ds = await getDataSource();
  const inboxRepo = ds.getRepository(InboxItemEntity);
  const existing = await inboxRepo.findOneBy({ id });
  if (!existing) redirect("/admin/pending?error=missing");
  const before = snap(existing);
  const published = formData.has("published")
    ? bool(formData.get("published"))
    : true;
  const baseName =
    slugifyBrand(
      (existing.originalName || existing.path).replace(/\.[^.]+$/, ""),
    ) || "pieza";
  const entityId = `${baseName}-${Date.now().toString(36).slice(-5)}`;

  if (destination === "ui") {
    const uiRepo = ds.getRepository(UiProjectEntity);
    const sortOrder = await uiRepo.count();
    const uiAfter = {
      id: entityId,
      category: "sistemas-a-medida" as UiCategory,
      title: { es: existing.originalName || entityId, en: existing.originalName || entityId },
      meta: { es: "", en: "" },
      images: [existing.path],
      prototypeUrl: null,
      sortOrder,
      published: false,
    };
    await uiRepo.save(uiAfter);
    await inboxRepo.delete({ id });
    await finishAdminMutation({
      session,
      action: "create",
      entityType: "ui_project",
      entityId,
      summary: `Clasificó inbox → proyecto UI “${entityId}”`,
      before,
      after: snap(uiAfter),
      redirectTo: "/admin/interfaces/projects",
      toastMessage: "Creado como proyecto UI (borrador)",
    });
  }

  const toSection = String(formData.get("toSection") ?? "").trim();
  if (!isClassifiableSection(toSection)) {
    redirect("/admin/pending?error=section");
  }
  const graphicRepo = ds.getRepository(GraphicItemEntity);
  const sortOrder = await graphicRepo.count({ where: { section: toSection } });
  const graphicAfter = {
    id: entityId,
    section: toSection,
    srcPath: existing.path,
    srcAssetId: existing.assetId,
    alt: existing.originalName || entityId,
    title: null,
    year: null,
    detail: null,
    href: null,
    hrefLabel: null,
    tags: null,
    fit: null,
    relatedSrcPath: null,
    relatedAssetId: null,
    sortOrder,
    published,
  };
  await graphicRepo.save(graphicAfter);
  await inboxRepo.delete({ id });
  await finishAdminMutation({
    session,
    action: "create",
    entityType: "graphic_item",
    entityId,
    summary: `Clasificó inbox → ${toSection} “${entityId}”`,
    before,
    after: snap(graphicAfter),
    redirectTo: `/admin/graphic/${toSection}`,
    toastMessage: `Movido a ${toSection}`,
  });
}

export async function deleteInboxItem(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const ds = await getDataSource();
  const repo = ds.getRepository(InboxItemEntity);
  const before = snap(await repo.findOneBy({ id }));
  await repo.delete({ id });
  await finishAdminMutation({
    session,
    action: "delete",
    entityType: "inbox_item",
    entityId: id,
    summary: `Eliminó pendiente ${id}`,
    before,
    after: null,
    redirectTo: "/admin/pending",
    toastMessage: "Pendiente eliminado",
  });
}

export async function classifyGraphicItem(formData: FormData) {
  // Legacy: piezas que aún estén en graphic pending
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const toSection = String(formData.get("toSection") ?? "").trim();
  if (!id) redirect("/admin/pending?error=id");
  if (!isClassifiableSection(toSection)) {
    redirect("/admin/pending?error=section");
  }
  const ds = await getDataSource();
  const repo = ds.getRepository(GraphicItemEntity);
  const existing = await repo.findOneBy({ id });
  if (!existing) redirect("/admin/pending?error=missing");
  const before = snap(existing);
  const published = formData.has("published")
    ? bool(formData.get("published"))
    : true;
  const after = {
    ...existing,
    section: toSection,
    published,
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: "update",
    entityType: "graphic_item",
    entityId: id,
    summary: `Clasificó “${id}” → ${toSection}`,
    before,
    after: snap(after),
    redirectTo: `/admin/graphic/${toSection}`,
    toastMessage: `Movido a ${toSection}`,
  });
}

export async function deleteGraphicItem(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const section = String(formData.get("section") ?? "covers");
  const ds = await getDataSource();
  const repo = ds.getRepository(GraphicItemEntity);
  const before = snap(await repo.findOneBy({ id }));
  await repo.delete({ id });
  await finishAdminMutation({
    session,
    action: "delete",
    entityType: "graphic_item",
    entityId: id,
    summary: `Eliminó ítem gráfico “${id}”`,
    before,
    after: null,
    redirectTo: `/admin/graphic/${section}`,
    toastMessage: "Ítem eliminado",
  });
}

export async function saveManual(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/manuals?error=id");
  const ds = await getDataSource();
  const repo = ds.getRepository(BrandManualEntity);
  const existing = await repo.findOneBy({ id });
  const before = snap(existing);
  const after = {
    id,
    coverPath: String(formData.get("coverPath") ?? ""),
    pdfPath: String(formData.get("pdfPath") ?? ""),
    title: loc(formData.get("titleEs"), formData.get("titleEn")),
    year: String(formData.get("year") ?? "") || null,
    meta: loc(formData.get("metaEs"), formData.get("metaEn")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: existing ? "update" : "create",
    entityType: "brand_manual",
    entityId: id,
    summary: existing ? `Actualizó manual “${id}”` : `Creó manual “${id}”`,
    before,
    after: snap(after),
    redirectTo: "/admin/manuals",
    toastMessage: existing ? "Manual guardado" : "Manual creado",
  });
}

export async function saveUiProject(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/interfaces/projects?error=id");
  const images = String(formData.get("images") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const ds = await getDataSource();
  const repo = ds.getRepository(UiProjectEntity);
  const existing = await repo.findOneBy({ id });
  const before = snap(existing);
  const after = {
    id,
    category: String(formData.get("category")) as UiCategory,
    title: loc(formData.get("titleEs"), formData.get("titleEn")),
    meta: loc(formData.get("metaEs"), formData.get("metaEn")),
    images,
    prototypeUrl: String(formData.get("prototypeUrl") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: existing ? "update" : "create",
    entityType: "ui_project",
    entityId: id,
    summary: existing
      ? `Actualizó proyecto UI “${id}”`
      : `Creó proyecto UI “${id}”`,
    before,
    after: snap(after),
    redirectTo: "/admin/interfaces/projects",
    toastMessage: existing ? "Proyecto guardado" : "Proyecto creado",
  });
}

export async function saveUiListItem(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/interfaces/list?error=id");
  const ds = await getDataSource();
  const repo = ds.getRepository(UiListItemEntity);
  const existing = await repo.findOneBy({ id });
  const before = snap(existing);
  const after = {
    id,
    title: loc(formData.get("titleEs"), formData.get("titleEn")),
    logoPath: String(formData.get("logoPath") ?? "") || null,
    caption: String(formData.get("caption") ?? "") || null,
    wordmark: String(formData.get("wordmark") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: existing ? "update" : "create",
    entityType: "ui_list_item",
    entityId: id,
    summary: existing ? `Actualizó ítem UI “${id}”` : `Creó ítem UI “${id}”`,
    before,
    after: snap(after),
    redirectTo: "/admin/interfaces/list",
    toastMessage: existing ? "Ítem guardado" : "Ítem creado",
  });
}

export async function saveTag(formData: FormData) {
  const session = await requireAdmin();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (!slug) redirect("/admin/tags?error=slug");
  const ds = await getDataSource();
  const repo = ds.getRepository(TagEntity);
  const existing = await repo.findOneBy({ slug });
  const before = snap(existing);
  const after = {
    slug,
    labelEs: String(formData.get("labelEs") ?? slug),
    labelEn: String(formData.get("labelEn") ?? slug),
    isNsfw: bool(formData.get("isNsfw")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: existing ? "update" : "create",
    entityType: "tag",
    entityId: slug,
    summary: existing ? `Actualizó etiqueta “${slug}”` : `Creó etiqueta “${slug}”`,
    before,
    after: snap(after),
    redirectTo: "/admin/tags",
    toastMessage: existing ? "Etiqueta guardada" : "Etiqueta creada",
  });
}

export async function deleteTag(formData: FormData) {
  const session = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const ds = await getDataSource();
  const repo = ds.getRepository(TagEntity);
  const before = snap(await repo.findOneBy({ slug }));
  await repo.delete({ slug });
  await finishAdminMutation({
    session,
    action: "delete",
    entityType: "tag",
    entityId: slug,
    summary: `Eliminó etiqueta “${slug}”`,
    before,
    after: null,
    redirectTo: "/admin/tags",
    toastMessage: "Etiqueta eliminada",
  });
}

export async function saveSocial(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/settings?error=id");
  const ds = await getDataSource();
  const repo = ds.getRepository(SocialLinkEntity);
  const existing = await repo.findOneBy({ id });
  const before = snap(existing);
  const after = {
    id,
    network: String(formData.get("network") ?? id),
    label: String(formData.get("label") ?? ""),
    href: String(formData.get("href") ?? ""),
    iconPath: String(formData.get("iconPath") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  };
  await repo.save(after);
  await finishAdminMutation({
    session,
    action: existing ? "update" : "create",
    entityType: "social_link",
    entityId: id,
    summary: existing ? `Actualizó red “${id}”` : `Creó red “${id}”`,
    before,
    after: snap(after),
    redirectTo: "/admin/settings",
    toastMessage: existing ? "Red guardada" : "Red creada",
  });
}

export async function uploadMedia(formData: FormData) {
  await requireAdmin();
  if (!isR2Configured()) {
    redirect("/admin/media?error=r2");
  }
  const file = formData.get("file");
  const keyPrefix = String(formData.get("keyPrefix") ?? "assets/uploads");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/media?error=file");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const key = `${keyPrefix.replace(/\/$/, "")}/${Date.now()}-${safeName}`;
  const path = await uploadToR2({
    key,
    body: buf,
    contentType: file.type || "application/octet-stream",
  });
  revalidatePath("/admin", "layout");
  redirect(
    withToastQuery(`/admin/media?path=${encodeURIComponent(path)}`, {
      message: "Archivo subido",
      undoable: false,
    }),
  );
}
