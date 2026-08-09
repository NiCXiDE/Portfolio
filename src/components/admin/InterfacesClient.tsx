"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Hash, Link2, Plus, Save } from "lucide-react";
import { saveUiListItem, saveUiProject } from "@/app/admin/actions";
import { CollapsibleEditor } from "@/components/admin/CollapsibleEditor";
import { FieldLabel, fieldClass, selectClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import {
  WithUiListPreview,
  WithUiProjectPreview,
} from "@/components/admin/WithPreview";
import { UiListPreview, UiProjectPreview } from "@/components/admin/previews";
import type { Draft } from "@/components/admin/draft";

export type UiProjectDTO = {
  id: string;
  category: string;
  title: { es: string; en: string };
  meta: { es: string; en: string };
  images: string[];
  prototypeUrl: string | null;
  sortOrder: number;
  published: boolean;
};

export type UiListDTO = {
  id: string;
  title: { es: string; en: string };
  logoPath: string | null;
  caption: string | null;
  wordmark: string | null;
  sortOrder: number;
  published: boolean;
};

function projectDraft(p: UiProjectDTO): Draft {
  return {
    category: p.category,
    titleEs: p.title.es,
    titleEn: p.title.en,
    metaEs: p.meta.es,
    metaEn: p.meta.en,
    images: p.images.join("\n"),
    prototypeUrl: p.prototypeUrl ?? "",
    published: p.published,
    sortOrder: String(p.sortOrder),
  };
}

function listDraft(item: UiListDTO): Draft {
  return {
    titleEs: item.title.es,
    titleEn: item.title.en,
    logoPath: item.logoPath ?? "",
    caption: item.caption ?? "",
    wordmark: item.wordmark ?? "",
    published: item.published,
    sortOrder: String(item.sortOrder),
  };
}

function ProjectFields({
  item,
  showId,
}: {
  item?: UiProjectDTO;
  showId?: boolean;
}) {
  const [images, setImages] = useState(item?.images.join("\n") ?? "");
  const imagesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    imagesRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [images]);

  return (
    <>
      {showId ? (
        <label className="block">
          <FieldLabel icon={Hash}>Identificador</FieldLabel>
          <input name="id" required className={fieldClass} />
        </label>
      ) : null}
      <label className="block">
        <FieldLabel>Categoría</FieldLabel>
        <select
          name="category"
          defaultValue={item?.category ?? "sistemas-a-medida"}
          className={selectClass}
        >
          <option value="preventas">Preventas</option>
          <option value="sistemas-a-medida">Sistemas a medida</option>
          <option value="proyectos-personales">Proyectos personales</option>
        </select>
      </label>
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
          <input name="metaEs" defaultValue={item?.meta.es} className={fieldClass} />
        </label>
        <label className="block">
          <FieldLabel>Detalle (inglés)</FieldLabel>
          <input name="metaEn" defaultValue={item?.meta.en} className={fieldClass} />
        </label>
      </div>
      <div className="space-y-2">
        <FieldLabel hint="La primera imagen es la de la card. Cada subida se agrega sola al listado.">
          Imágenes del proyecto
        </FieldLabel>
        <ImageDropField
          label="Arrastrá para agregar una imagen"
          folder="assets/interfaces"
          onUploaded={(path) =>
            setImages((prev) => (prev.trim() ? `${prev.trim()}\n${path}` : path))
          }
        />
        <label className="block">
          <FieldLabel>Listado de imágenes</FieldLabel>
          <textarea
            ref={imagesRef}
            name="images"
            value={images}
            onChange={(e) => setImages(e.target.value)}
            rows={3}
            className={`${fieldClass} font-mono text-xs`}
            placeholder="/assets/interfaces/…"
          />
        </label>
      </div>
      <label className="block">
        <FieldLabel icon={Link2} hint="Link al Figma, Framer u otro prototipo.">
          Enlace al prototipo
        </FieldLabel>
        <input
          name="prototypeUrl"
          defaultValue={item?.prototypeUrl ?? ""}
          placeholder="https://…"
          className={fieldClass}
        />
      </label>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item?.published ?? true}
          />
          <Eye className="size-3.5 opacity-60" />
          Visible en el sitio
        </label>
        <label className="inline-flex items-center gap-2">
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

function ListFields({
  item,
  showId,
}: {
  item?: UiListDTO;
  showId?: boolean;
}) {
  return (
    <>
      {showId ? (
        <label className="block">
          <FieldLabel icon={Hash}>Identificador</FieldLabel>
          <input name="id" required className={fieldClass} />
        </label>
      ) : null}
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
      <ImageDropField
        name="logoPath"
        label="Logo"
        folder="assets/interfaces"
        defaultValue={item?.logoPath ?? ""}
      />
      <label className="block">
        <FieldLabel>Pie de texto (opcional)</FieldLabel>
        <input name="caption" defaultValue={item?.caption ?? ""} className={fieldClass} />
      </label>
      <label className="block">
        <FieldLabel hint="Si no hay logo, se puede mostrar este nombre tipográfico.">
          Wordmark (texto grande)
        </FieldLabel>
        <input name="wordmark" defaultValue={item?.wordmark ?? ""} className={fieldClass} />
      </label>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item?.published ?? true}
          />
          Visible en el sitio
        </label>
        <label className="inline-flex items-center gap-2">
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

export function InterfacesProjectsClient({
  projects,
  saved,
}: {
  projects: UiProjectDTO[];
  saved?: string;
}) {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">Proyectos</h1>
      {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}
      <p className="mt-2 text-sm text-ink/60">
        Tocá un proyecto para editarlo.
      </p>

      <div className="mt-6">
        <CollapsibleEditor
          compact
          summary={
            <div className="flex items-center gap-2 py-1 text-sm font-medium">
              <Plus className="size-4" /> Nuevo proyecto
            </div>
          }
        >
          <WithUiProjectPreview>
            <form action={saveUiProject} className="space-y-4">
              <ProjectFields showId />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
              >
                <Save className="size-3.5" /> Crear
              </button>
            </form>
          </WithUiProjectPreview>
        </CollapsibleEditor>
      </div>

      <div className="mt-8 space-y-4">
        {projects.map((p) => (
          <CollapsibleEditor
            key={p.id}
            summary={<UiProjectPreview draft={projectDraft(p)} locale="es" />}
          >
            <WithUiProjectPreview initialDraft={projectDraft(p)}>
              <form action={saveUiProject} className="space-y-4">
                <input type="hidden" name="id" value={p.id} />
                <p className="text-xs text-ink/45">ID: {p.id}</p>
                <ProjectFields item={p} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
                >
                  <Save className="size-3.5" /> Guardar cambios
                </button>
              </form>
            </WithUiProjectPreview>
          </CollapsibleEditor>
        ))}
      </div>
    </div>
  );
}

export function InterfacesListClient({
  list,
  saved,
}: {
  list: UiListDTO[];
  saved?: string;
}) {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">Lista simple</h1>
      {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}
      <p className="mt-2 text-sm text-ink/60">Logos / wordmarks en grilla.</p>

      <div className="mt-6">
        <CollapsibleEditor
          compact
          summary={
            <div className="flex items-center gap-2 py-1 text-sm font-medium">
              <Plus className="size-4" /> Nuevo ítem
            </div>
          }
        >
          <WithUiListPreview>
            <form action={saveUiListItem} className="space-y-4">
              <ListFields showId />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
              >
                <Save className="size-3.5" /> Crear
              </button>
            </form>
          </WithUiListPreview>
        </CollapsibleEditor>
      </div>

      <div className="mt-8 space-y-4">
        {list.map((item) => (
          <CollapsibleEditor
            key={item.id}
            summary={<UiListPreview draft={listDraft(item)} locale="es" />}
          >
            <WithUiListPreview initialDraft={listDraft(item)}>
              <form action={saveUiListItem} className="space-y-4">
                <input type="hidden" name="id" value={item.id} />
                <p className="text-xs text-ink/45">ID: {item.id}</p>
                <ListFields item={item} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
                >
                  <Save className="size-3.5" /> Guardar cambios
                </button>
              </form>
            </WithUiListPreview>
          </CollapsibleEditor>
        ))}
      </div>
    </div>
  );
}
