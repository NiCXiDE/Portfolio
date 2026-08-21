"use client";

import { useRef, useState } from "react";
import {
  Calendar,
  Eye,
  Hash,
  Link2,
  Plus,
  Save,
  Tags,
  Type,
} from "lucide-react";
import { deleteGraphicItem, saveGraphicItem } from "@/app/admin/actions";
import { ClassifyGraphicForm } from "@/components/admin/ClassifyGraphicForm";
import { useAdminMediaUrl } from "@/components/admin/AdminMediaProvider";
import { CollapsibleEditor } from "@/components/admin/CollapsibleEditor";
import { FieldLabel, fieldClass, selectClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { ImageGalleryField } from "@/components/admin/ImageGalleryField";
import { LogoGalleryField } from "@/components/admin/LogoGalleryField";
import { WithGraphicPreview } from "@/components/admin/WithPreview";
import { GraphicItemPreview } from "@/components/admin/previews";
import type { Draft } from "@/components/admin/draft";
import type { GraphicSection } from "@/db/entities";
import {
  ensureVectorTag,
  isVectorRecolorPath,
} from "@/lib/graphic-constants";
import type { BrandRef } from "@/lib/brands";

export type GraphicItemDTO = {
  id: string;
  srcPath: string;
  srcAssetId: string | null;
  alt: string;
  title: { es: string; en: string } | null;
  year: string | null;
  detail: { es: string; en: string } | null;
  href: string | null;
  hrefLabel: { es: string; en: string } | null;
  tags: string[] | null;
  fit: "cover" | "contain" | null;
  relatedSrcPath: string | null;
  relatedAssetId: string | null;
  galleryPaths: unknown[] | null;
  brandId: string | null;
  sortOrder: number;
  published: boolean;
  /** Metadatos del asset para heurística de clasificación */
  assetMeta?: {
    originalName: string | null;
    mime: string | null;
    width: number | null;
    height: number | null;
  } | null;
};

function gallerySrcList(galleryPaths: unknown[] | null | undefined): string[] {
  if (!galleryPaths) return [];
  const out: string[] = [];
  for (const entry of galleryPaths) {
    if (!entry) continue;
    if (typeof entry === "string") {
      const src = entry.trim();
      if (src) out.push(src);
      continue;
    }
    if (typeof entry === "object") {
      const obj = entry as Record<string, unknown>;
      const srcVal = obj.src;
      if (typeof srcVal === "string") {
        const src = srcVal.trim();
        if (src) out.push(src);
      }
    }
  }
  return out;
}

const SECTION_LABELS: Record<GraphicSection, string> = {
  covers: "Portadas",
  logos: "Logos",
  personal: "Personales",
  pending: "Pendientes",
  illustration: "Ilustración",
  banners: "Banners",
  eventos: "Eventos",
};

function itemToDraft(item: GraphicItemDTO): Draft {
  return {
    srcPath: item.srcPath,
    alt: item.alt,
    titleEs: item.title?.es ?? "",
    titleEn: item.title?.en ?? "",
    detailEs: item.detail?.es ?? "",
    detailEn: item.detail?.en ?? "",
    year: item.year ?? "",
    href: item.href ?? "",
    hrefLabelEs: item.hrefLabel?.es ?? "",
    hrefLabelEn: item.hrefLabel?.en ?? "",
    tags: item.tags?.join(", ") ?? "",
    relatedSrcPath: item.relatedSrcPath ?? "",
    galleryPaths: gallerySrcList(item.galleryPaths).join("\n"),
    fit: item.fit ?? "",
    published: item.published,
    sortOrder: String(item.sortOrder),
  };
}

function GraphicGalleryField({
  folder,
  defaultPaths,
  label,
  hint,
}: {
  folder: string;
  defaultPaths: string[];
  label?: string;
  hint?: string;
}) {
  const [paths, setPaths] = useState(defaultPaths);
  return (
    <ImageGalleryField
      name="galleryPaths"
      folder={folder}
      value={paths}
      onChange={setPaths}
      label={label ?? "Galería (detalle)"}
      hint={
        hint ??
        "La grilla muestra solo la imagen principal. Estas aparecen al expandir."
      }
    />
  );
}

function GraphicFields({
  item,
  section,
  showIdInput,
  library,
  brands = [],
}: {
  item?: GraphicItemDTO;
  section: GraphicSection;
  showIdInput?: boolean;
  library?: { id: string; path: string; originalName: string | null }[];
  brands?: BrandRef[];
}) {
  const folder = `assets/grafico/${section}`;
  const tagsRef = useRef<HTMLInputElement>(null);

  function applyVectorTag(path: string) {
    if (section !== "logos" || !isVectorRecolorPath(path)) return;
    const el = tagsRef.current;
    if (!el) return;
    el.value = ensureVectorTag(el.value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <>
      {showIdInput ? (
        <label className="block">
          <FieldLabel
            icon={Hash}
            hint="Solo letras, números y guiones. No se puede cambiar después."
          >
            Identificador
          </FieldLabel>
          <input
            name="id"
            placeholder="ej: kadaver-jez-ebel"
            required
            className={fieldClass}
          />
        </label>
      ) : null}

      <ImageDropField
        name="srcPath"
        assetName="srcAssetId"
        label="Imagen principal"
        hint={
          section === "logos"
            ? "SVG o PNG monocromo (blanco sobre negro). Al subir se etiqueta como vector para recolor del tema."
            : "Arrastrá la imagen. No hace falta escribir la ruta."
        }
        defaultValue={item?.srcPath}
        defaultAssetId={item?.srcAssetId ?? ""}
        folder={folder}
        library={library}
        onUploaded={applyVectorTag}
      />

      <label className="block">
        <FieldLabel
          icon={Type}
          hint="Texto alternativo obligatorio para SEO y accesibilidad (describe la imagen)."
        >
          Nombre descriptivo
        </FieldLabel>
        <input
          name="alt"
          defaultValue={item?.alt}
          placeholder="ej: KADAVER - Jez_ebel"
          className={fieldClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Título (español)</FieldLabel>
          <input
            name="titleEs"
            defaultValue={item?.title?.es ?? ""}
            placeholder="Opcional"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Título (inglés)</FieldLabel>
          <input
            name="titleEn"
            defaultValue={item?.title?.en ?? ""}
            placeholder="Opcional"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel hint="Texto que se ve al abrir la card.">
            Descripción (español)
          </FieldLabel>
          <textarea
            name="detailEs"
            defaultValue={item?.detail?.es ?? ""}
            rows={2}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Descripción (inglés)</FieldLabel>
          <textarea
            name="detailEn"
            defaultValue={item?.detail?.en ?? ""}
            rows={2}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block">
        <FieldLabel icon={Calendar}>Año</FieldLabel>
        <input
          name="year"
          defaultValue={item?.year ?? ""}
          placeholder="2026"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <FieldLabel
          icon={Link2}
          hint="Sitio, SoundCloud, Behance… donde quieras mandar al visitante."
        >
          Enlace externo
        </FieldLabel>
        <input
          name="href"
          defaultValue={item?.href ?? ""}
          placeholder="https://…"
          className={fieldClass}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel hint="Texto del botón del enlace.">
            Texto del enlace (español)
          </FieldLabel>
          <input
            name="hrefLabelEs"
            defaultValue={item?.hrefLabel?.es ?? ""}
            placeholder="Abrir en SoundCloud"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Texto del enlace (inglés)</FieldLabel>
          <input
            name="hrefLabelEn"
            defaultValue={item?.hrefLabel?.en ?? ""}
            placeholder="Open on SoundCloud"
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block">
        <FieldLabel
          icon={Tags}
          hint={
            section === "logos"
              ? "Separá con comas. Usá vector en SVG/PNG monocromo para el recolor del tema (--brand-vector)."
              : "Separá con comas. Ej: nsfw, vector"
          }
        >
          Etiquetas
        </FieldLabel>
        <input
          ref={tagsRef}
          name="tags"
          defaultValue={item?.tags?.join(", ") ?? ""}
          placeholder={section === "logos" ? "vector" : "nsfw, vector"}
          className={fieldClass}
        />
      </label>

      <ImageDropField
        name="relatedSrcPath"
        assetName="relatedAssetId"
        label={
          section === "eventos"
            ? "Portada de la ficha (16:9)"
            : "Imagen relacionada (opcional)"
        }
        hint={
          section === "eventos"
            ? "Se muestra arriba en la página del evento."
            : "Segunda imagen que aparece al abrir la card."
        }
        defaultValue={item?.relatedSrcPath ?? ""}
        defaultAssetId={item?.relatedAssetId ?? ""}
        folder={folder}
        library={library}
      />

      {section === "logos" ? (
        <LogoGalleryField
          folder={item ? `${folder}/${item.id}` : folder}
          defaultGalleryPaths={item?.galleryPaths ?? null}
          itemId={item?.id}
        />
      ) : (
        <GraphicGalleryField
          folder={folder}
          defaultPaths={gallerySrcList(item?.galleryPaths)}
          label={
            section === "eventos"
              ? "Recursos de la ficha (1×1)"
              : undefined
          }
          hint={
            section === "eventos"
              ? "Aparecen en la grilla de la página del evento."
              : undefined
          }
        />
      )}

      <label className="block">
        <FieldLabel
          hint="Vincula esta pieza a una marca/empresa para mostrar trabajo relacionado (sin clonar assets)."
        >
          Marca / proyecto
        </FieldLabel>
        <select
          name="brandId"
          defaultValue={item?.brandId ?? ""}
          className={selectClass}
        >
          <option value="">Sin marca</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.id})
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="block">
          <FieldLabel hint="Cover = recorta. Contain = muestra toda.">
            Cómo se ve la imagen
          </FieldLabel>
          <select
            name="fit"
            defaultValue={item?.fit ?? (section === "logos" ? "contain" : "")}
            className={selectClass}
          >
            <option value="">Automático</option>
            <option value="cover">Recortar (cover)</option>
            <option value="contain">Ver completa (contain)</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item?.published ?? true}
          />
          <Eye className="size-3.5 opacity-60" strokeWidth={1.75} />
          Visible en el sitio
        </label>
        <label className="inline-flex items-center gap-2 self-end pb-2">
          Orden
          <input
            type="number"
            name="sortOrder"
            defaultValue={item?.sortOrder ?? 0}
            className="w-20 border border-ink/20 px-2 py-1"
          />
        </label>
      </div>
    </>
  );
}

export function GraphicSectionClient({
  section,
  items,
  tagSlugs,
  saved,
  library = [],
  brands = [],
}: {
  section: GraphicSection;
  items: GraphicItemDTO[];
  tagSlugs: string[];
  saved?: string;
  library?: { id: string; path: string; originalName: string | null }[];
  brands?: BrandRef[];
}) {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">
        {SECTION_LABELS[section] ?? section}
      </h1>
      {saved ? (
        <p className="mt-2 text-sm text-green-700">Guardado.</p>
      ) : null}
      <p className="mt-2 text-sm text-ink/60">
        {section === "pending"
          ? "Clasificá cada pieza a su sección definitiva. La sugerencia es solo una guía."
          : "Tocá una pieza para editarla."}{" "}
        Etiquetas disponibles:{" "}
        {tagSlugs.length ? tagSlugs.join(", ") : "ninguna todavía"}.
      </p>

      <div className="mt-6">
        <CollapsibleEditor
          compact
          defaultOpen={false}
          summary={
            <div className="flex items-center gap-2 py-1 text-sm font-medium">
              <Plus className="size-4" strokeWidth={1.75} />
              Nueva pieza
            </div>
          }
        >
          <WithGraphicPreview>
            <form action={saveGraphicItem} className="space-y-4">
              <input type="hidden" name="section" value={section} />
              <GraphicFields
                section={section}
                showIdInput
                library={library}
                brands={brands}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
              >
                <Save className="size-3.5" strokeWidth={1.75} />
                Crear
              </button>
            </form>
          </WithGraphicPreview>
        </CollapsibleEditor>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <CollapsibleEditor
            key={item.id}
            summary={
              <GraphicItemPreview draft={itemToDraft(item)} locale="es" />
            }
            onDelete={
              <form action={deleteGraphicItem}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="section" value={section} />
                <button type="submit" className="underline">
                  Eliminar esta pieza
                </button>
              </form>
            }
          >
            <WithGraphicPreview initialDraft={itemToDraft(item)}>
              <form action={saveGraphicItem} className="space-y-4">
                <input type="hidden" name="section" value={section} />
                <input type="hidden" name="id" value={item.id} />
                <p className="text-xs text-ink/45">ID: {item.id}</p>
                <GraphicFields
                  item={item}
                  section={section}
                  library={library}
                  brands={brands}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
                >
                  <Save className="size-3.5" strokeWidth={1.75} />
                  Guardar cambios
                </button>
              </form>
            </WithGraphicPreview>
            {section === "pending" ? (
              <PendingClassifyForm item={item} />
            ) : null}
          </CollapsibleEditor>
        ))}
      </div>
    </div>
  );
}

function PendingClassifyForm({
  item,
}: {
  item: {
    id: string;
    srcPath: string;
    assetMeta?: {
      originalName?: string | null;
      mime?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
  };
}) {
  const previewUrl = useAdminMediaUrl(item.srcPath);
  return (
    <ClassifyGraphicForm
      itemId={item.id}
      srcPath={item.srcPath}
      previewUrl={previewUrl}
      originalName={item.assetMeta?.originalName}
      mime={item.assetMeta?.mime}
      width={item.assetMeta?.width}
      height={item.assetMeta?.height}
    />
  );
}
