"use client";

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
import { CollapsibleEditor } from "@/components/admin/CollapsibleEditor";
import { FieldLabel, fieldClass, selectClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { WithGraphicPreview } from "@/components/admin/WithPreview";
import { GraphicItemPreview } from "@/components/admin/previews";
import type { Draft } from "@/components/admin/draft";
import type { GraphicSection } from "@/db/entities";

export type GraphicItemDTO = {
  id: string;
  srcPath: string;
  alt: string;
  title: { es: string; en: string } | null;
  year: string | null;
  detail: { es: string; en: string } | null;
  href: string | null;
  hrefLabel: { es: string; en: string } | null;
  tags: string[] | null;
  fit: "cover" | "contain" | null;
  relatedSrcPath: string | null;
  sortOrder: number;
  published: boolean;
};

const SECTION_LABELS: Record<GraphicSection, string> = {
  covers: "Portadas",
  logos: "Logos",
  personal: "Personales",
  pending: "Pendientes",
  illustration: "Ilustración",
  banners: "Banners",
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
    fit: item.fit ?? "",
    published: item.published,
    sortOrder: String(item.sortOrder),
  };
}

function GraphicFields({
  item,
  section,
  showIdInput,
}: {
  item?: GraphicItemDTO;
  section: GraphicSection;
  showIdInput?: boolean;
}) {
  const folder = `assets/grafico/${section}`;

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
        label="Imagen principal"
        hint="Arrastrá la imagen. No hace falta escribir la ruta."
        defaultValue={item?.srcPath}
        folder={folder}
      />

      <label className="block">
        <FieldLabel
          icon={Type}
          hint="Se usa si la imagen no carga o para lectores de pantalla."
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
          hint="Separá con comas. Ej: nsfw, vector"
        >
          Etiquetas
        </FieldLabel>
        <input
          name="tags"
          defaultValue={item?.tags?.join(", ") ?? ""}
          placeholder="nsfw, vector"
          className={fieldClass}
        />
      </label>

      <ImageDropField
        name="relatedSrcPath"
        label="Imagen relacionada (opcional)"
        hint="Segunda imagen que aparece al abrir la card."
        defaultValue={item?.relatedSrcPath ?? ""}
        folder={folder}
      />

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="block">
          <FieldLabel hint="Cover = recorta. Contain = muestra toda.">
            Cómo se ve la imagen
          </FieldLabel>
          <select
            name="fit"
            defaultValue={item?.fit ?? ""}
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
}: {
  section: GraphicSection;
  items: GraphicItemDTO[];
  tagSlugs: string[];
  saved?: string;
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
        Tocá una pieza para editarla. Etiquetas disponibles:{" "}
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
              <GraphicFields section={section} showIdInput />
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
                <GraphicFields item={item} section={section} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
                >
                  <Save className="size-3.5" strokeWidth={1.75} />
                  Guardar cambios
                </button>
              </form>
            </WithGraphicPreview>
          </CollapsibleEditor>
        ))}
      </div>
    </div>
  );
}
