"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDataSource } from "@/db/data-source";
import {
  BioEntity,
  BrandManualEntity,
  GraphicItemEntity,
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
import { requireSession } from "@/lib/admin-auth";
import { isR2Configured, uploadToR2 } from "@/lib/r2";

function loc(es: FormDataEntryValue | null, en: FormDataEntryValue | null): LocalizedJson {
  return { es: String(es ?? ""), en: String(en ?? "") };
}

function bool(v: FormDataEntryValue | null) {
  return v === "on" || v === "true" || v === "1";
}

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function saveBio(formData: FormData) {
  await requireSession();
  const ds = await getDataSource();
  await ds.getRepository(BioEntity).save({
    id: "main",
    photoPath: String(formData.get("photoPath") ?? ""),
    photoAlt: loc(formData.get("photoAltEs"), formData.get("photoAltEn")),
    signaturePath: String(formData.get("signaturePath") ?? ""),
    signatureAlt: loc(
      formData.get("signatureAltEs"),
      formData.get("signatureAltEn"),
    ),
    cvPath: String(formData.get("cvPath") ?? "") || null,
    text: loc(formData.get("textEs"), formData.get("textEn")),
  });
  revalidatePublic();
  redirect("/admin/bio?saved=1");
}

export async function saveSettings(formData: FormData) {
  await requireSession();
  const ds = await getDataSource();
  await ds.getRepository(SiteSettingsEntity).save({
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
  });
  revalidatePublic();
  redirect("/admin/settings?saved=1");
}

export async function saveNamedList(formData: FormData) {
  await requireSession();
  const kind = String(formData.get("kind")) as NamedListKind;
  const raw = String(formData.get("items") ?? "");
  const labels = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const ds = await getDataSource();
  const repo = ds.getRepository(NamedListItemEntity);
  await repo.delete({ kind });
  await repo.save(
    labels.map((label, sortOrder) => ({
      kind,
      label,
      sortOrder,
      published: true,
    })),
  );
  revalidatePublic();
  redirect("/admin/lists?saved=1");
}

export async function saveTestimonial(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/testimonials?error=id");
  const ds = await getDataSource();
  await ds.getRepository(TestimonialEntity).save({
    id,
    name: String(formData.get("name") ?? ""),
    imagePath: String(formData.get("imagePath") ?? ""),
    quote: loc(formData.get("quoteEs"), formData.get("quoteEn")),
    role: loc(formData.get("roleEs"), formData.get("roleEn")),
    companyName: String(formData.get("companyName") ?? ""),
    companyLogoPath: String(formData.get("companyLogoPath") ?? "") || null,
    companyHref: String(formData.get("companyHref") ?? "") || null,
    linkLabel:
      String(formData.get("linkLabelEs") ?? "").trim() ||
      String(formData.get("linkLabelEn") ?? "").trim()
        ? loc(formData.get("linkLabelEs"), formData.get("linkLabelEn"))
        : null,
    hidden: bool(formData.get("hidden")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  revalidatePublic();
  redirect("/admin/testimonials?saved=1");
}

export async function deleteTestimonial(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const ds = await getDataSource();
  await ds.getRepository(TestimonialEntity).delete({ id });
  revalidatePublic();
  redirect("/admin/testimonials?saved=1");
}

export async function saveGraphicItem(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  const section = String(formData.get("section")) as GraphicSection;
  if (!id) redirect(`/admin/graphic/${section}?error=id`);
  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const ds = await getDataSource();
  await ds.getRepository(GraphicItemEntity).save({
    id,
    section,
    srcPath: String(formData.get("srcPath") ?? ""),
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
    relatedSrcPath: String(formData.get("relatedSrcPath") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  });
  revalidatePublic();
  redirect(`/admin/graphic/${section}?saved=1`);
}

export async function deleteGraphicItem(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  const section = String(formData.get("section") ?? "covers");
  const ds = await getDataSource();
  await ds.getRepository(GraphicItemEntity).delete({ id });
  revalidatePublic();
  redirect(`/admin/graphic/${section}?saved=1`);
}

export async function saveManual(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/manuals?error=id");
  const ds = await getDataSource();
  await ds.getRepository(BrandManualEntity).save({
    id,
    coverPath: String(formData.get("coverPath") ?? ""),
    pdfPath: String(formData.get("pdfPath") ?? ""),
    title: loc(formData.get("titleEs"), formData.get("titleEn")),
    year: String(formData.get("year") ?? "") || null,
    meta: loc(formData.get("metaEs"), formData.get("metaEn")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  });
  revalidatePublic();
  redirect("/admin/manuals?saved=1");
}

export async function saveUiProject(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/interfaces?error=id");
  const images = String(formData.get("images") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const ds = await getDataSource();
  await ds.getRepository(UiProjectEntity).save({
    id,
    category: String(formData.get("category")) as UiCategory,
    title: loc(formData.get("titleEs"), formData.get("titleEn")),
    meta: loc(formData.get("metaEs"), formData.get("metaEn")),
    images,
    prototypeUrl: String(formData.get("prototypeUrl") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  });
  revalidatePublic();
  redirect("/admin/interfaces?saved=1");
}

export async function saveUiListItem(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/interfaces?error=id");
  const ds = await getDataSource();
  await ds.getRepository(UiListItemEntity).save({
    id,
    title: loc(formData.get("titleEs"), formData.get("titleEn")),
    logoPath: String(formData.get("logoPath") ?? "") || null,
    caption: String(formData.get("caption") ?? "") || null,
    wordmark: String(formData.get("wordmark") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  });
  revalidatePublic();
  redirect("/admin/interfaces?saved=1");
}

export async function saveTag(formData: FormData) {
  await requireSession();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (!slug) redirect("/admin/tags?error=slug");
  const ds = await getDataSource();
  await ds.getRepository(TagEntity).save({
    slug,
    labelEs: String(formData.get("labelEs") ?? slug),
    labelEn: String(formData.get("labelEn") ?? slug),
    isNsfw: bool(formData.get("isNsfw")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  revalidatePublic();
  redirect("/admin/tags?saved=1");
}

export async function deleteTag(formData: FormData) {
  await requireSession();
  const slug = String(formData.get("slug") ?? "");
  const ds = await getDataSource();
  await ds.getRepository(TagEntity).delete({ slug });
  revalidatePublic();
  redirect("/admin/tags?saved=1");
}

export async function saveSocial(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/settings?error=id");
  const ds = await getDataSource();
  await ds.getRepository(SocialLinkEntity).save({
    id,
    network: String(formData.get("network") ?? id),
    label: String(formData.get("label") ?? ""),
    href: String(formData.get("href") ?? ""),
    iconPath: String(formData.get("iconPath") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: bool(formData.get("published")),
  });
  revalidatePublic();
  redirect("/admin/settings?saved=1");
}

export async function uploadMedia(formData: FormData) {
  await requireSession();
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
  redirect(`/admin/media?saved=1&path=${encodeURIComponent(path)}`);
}
