"use client";

import { FileText, Hash, Plus, Save } from "lucide-react";
import { saveManual } from "@/app/admin/actions";
import { CollapsibleEditor } from "@/components/admin/CollapsibleEditor";
import { FieldLabel, fieldClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { WithManualPreview } from "@/components/admin/WithPreview";
import { ManualPreview } from "@/components/admin/previews";
import type { Draft } from "@/components/admin/draft";

export type ManualDTO = {
  id: string;
  coverPath: string;
  pdfPath: string;
  title: { es: string; en: string };
  year: string | null;
  meta: { es: string; en: string } | null;
  sortOrder: number;
  published: boolean;
};

function toDraft(item: ManualDTO): Draft {
  return {
    coverPath: item.coverPath,
    pdfPath: item.pdfPath,
    titleEs: item.title.es,
    titleEn: item.title.en,
    metaEs: item.meta?.es ?? "",
    metaEn: item.meta?.en ?? "",
    year: item.year ?? "",
    published: item.published,
    sortOrder: String(item.sortOrder),
  };
}

function Fields({ item, showId }: { item?: ManualDTO; showId?: boolean }) {
  return (
    <>
      {showId ? (
        <label className="block">
          <FieldLabel icon={Hash}>Identificador</FieldLabel>
          <input name="id" required className={fieldClass} />
        </label>
      ) : null}
      <ImageDropField
        name="coverPath"
        label="Portada"
        folder="assets/manuals"
        defaultValue={item?.coverPath}
      />
      <ImageDropField
        name="pdfPath"
        label="Archivo PDF"
        hint="Arrastrá el manual en PDF."
        folder="assets/manuals"
        defaultValue={item?.pdfPath}
        accept="application/pdf,.pdf"
        kind="file"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Título (español)</FieldLabel>
          <input name="titleEs" defaultValue={item?.title.es} className={fieldClass} />
        </label>
        <label className="block">
          <FieldLabel>Título (inglés)</FieldLabel>
          <input name="titleEn" defaultValue={item?.title.en} className={fieldClass} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Detalle (español)</FieldLabel>
          <input name="metaEs" defaultValue={item?.meta?.es ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <FieldLabel>Detalle (inglés)</FieldLabel>
          <input name="metaEn" defaultValue={item?.meta?.en ?? ""} className={fieldClass} />
        </label>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="block">
          <FieldLabel>Año</FieldLabel>
          <input name="year" defaultValue={item?.year ?? ""} className={fieldClass} />
        </label>
        <label className="inline-flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item?.published ?? true}
          />
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

export function ManualsClient({
  items,
  saved,
}: {
  items: ManualDTO[];
  saved?: string;
}) {
  return (
    <div>
      <h1 className="font-bigger text-3xl uppercase">Manuales</h1>
      {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}
      <p className="mt-2 text-sm text-ink/60">Tocá un manual para editarlo.</p>

      <div className="mt-6">
        <CollapsibleEditor
          summary={
            <div className="flex items-center gap-2 py-1 text-sm font-medium">
              <Plus className="size-4" /> <FileText className="size-4 opacity-50" /> Nuevo
              manual
            </div>
          }
        >
          <WithManualPreview>
            <form action={saveManual} className="space-y-4">
              <Fields showId />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
              >
                <Save className="size-3.5" /> Crear
              </button>
            </form>
          </WithManualPreview>
        </CollapsibleEditor>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <CollapsibleEditor
            key={item.id}
            summary={<ManualPreview draft={toDraft(item)} locale="es" />}
          >
            <WithManualPreview initialDraft={toDraft(item)}>
              <form action={saveManual} className="space-y-4">
                <input type="hidden" name="id" value={item.id} />
                <p className="text-xs text-ink/45">ID: {item.id}</p>
                <Fields item={item} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
                >
                  <Save className="size-3.5" /> Guardar cambios
                </button>
              </form>
            </WithManualPreview>
          </CollapsibleEditor>
        ))}
      </div>
    </div>
  );
}
