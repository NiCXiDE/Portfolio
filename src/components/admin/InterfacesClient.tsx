"use client";

import { useState } from "react";
import { Eye, Hash, Link2, Plus, Save } from "lucide-react";
import { saveUiListItem, saveUiProject } from "@/app/admin/actions";
import {
  AdminEditSession,
  AdminTrackedForm,
  useAdminEditSession,
} from "@/components/admin/AdminEditSession";
import { useAdminMediaUrl } from "@/components/admin/AdminMediaProvider";
import { CollapsibleEditor } from "@/components/admin/CollapsibleEditor";
import { FieldLabel, fieldClass, selectClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { UiSlideGalleryField } from "@/components/admin/UiSlideGalleryField";
import {
  WithUiListPreview,
  WithUiProjectPreview,
} from "@/components/admin/WithPreview";
import { UiListPreview } from "@/components/admin/previews";
import { useQuietAdminAction } from "@/components/admin/useQuietAdminAction";
import type { Draft } from "@/components/admin/draft";
import type { BrandRef } from "@/lib/brands";
import { MentionTextarea } from "@/components/admin/MentionTextarea";
import {
  normalizeUiSlides,
  type UiSlide,
} from "@/lib/ui-slides";

export type UiProjectDTO = {
  id: string;
  category: string;
  title: { es: string; en: string };
  meta: { es: string; en: string };
  images: Array<string | UiSlide>;
  prototypeUrl: string | null;
  summary: { es: string; en: string } | null;
  client: string | null;
  period: { es: string; en: string } | null;
  duration: { es: string; en: string } | null;
  ctaKind: "prototype" | "visitor" | "live" | null;
  brandId: string | null;
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
  const slides = normalizeUiSlides(p.images);
  return {
    category: p.category,
    titleEs: p.title.es,
    titleEn: p.title.en,
    metaEs: p.meta.es,
    metaEn: p.meta.en,
    images: JSON.stringify(slides),
    prototypeUrl: p.prototypeUrl ?? "",
    summaryEs: p.summary?.es ?? "",
    summaryEn: p.summary?.en ?? "",
    client: p.client ?? "",
    periodEs: p.period?.es ?? "",
    periodEn: p.period?.en ?? "",
    durationEs: p.duration?.es ?? "",
    durationEn: p.duration?.en ?? "",
    ctaKind: p.ctaKind ?? "",
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

const CATEGORY_LABEL: Record<string, string> = {
  preventas: "Preventas",
  "sistemas-a-medida": "Sistemas a medida",
  "apps-mobile": "Apps / Mobile",
  "proyectos-personales": "Personales",
  "system-design": "System design",
};

function ProjectFields({
  item,
  showId,
  brands,
}: {
  item?: UiProjectDTO;
  showId?: boolean;
  brands: BrandRef[];
}) {
  const [images, setImages] = useState(() =>
    normalizeUiSlides(item?.images ?? []),
  );
  const [metaEs, setMetaEs] = useState(item?.meta.es ?? "");
  const [metaEn, setMetaEn] = useState(item?.meta.en ?? "");

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
          <option value="apps-mobile">Apps / Mobile</option>
          <option value="proyectos-personales">Personales</option>
          <option value="system-design">System design</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Título (español)</FieldLabel>
          <input
            name="titleEs"
            defaultValue={item?.title.es}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Título (inglés)</FieldLabel>
          <input
            name="titleEn"
            defaultValue={item?.title.en}
            className={fieldClass}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>Detalle (español)</FieldLabel>
          <MentionTextarea
            name="metaEs"
            value={metaEs}
            onChange={setMetaEs}
            brands={brands}
            rows={3}
          />
        </div>
        <div>
          <FieldLabel>Detalle (inglés)</FieldLabel>
          <MentionTextarea
            name="metaEn"
            value={metaEn}
            onChange={setMetaEn}
            brands={brands}
            rows={3}
          />
        </div>
      </div>
      <UiSlideGalleryField
        name="images"
        folder="assets/interfaces"
        value={images}
        onChange={setImages}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Resumen (español)</FieldLabel>
          <textarea
            name="summaryEs"
            defaultValue={item?.summary?.es ?? ""}
            rows={2}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Resumen (inglés)</FieldLabel>
          <textarea
            name="summaryEn"
            defaultValue={item?.summary?.en ?? ""}
            rows={2}
            className={fieldClass}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Cliente / entidad</FieldLabel>
          <input
            name="client"
            defaultValue={item?.client ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Marca</FieldLabel>
          <select
            name="brandId"
            defaultValue={item?.brandId ?? ""}
            className={selectClass}
          >
            <option value="">Sin marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Periodo (español)</FieldLabel>
          <input
            name="periodEs"
            defaultValue={item?.period?.es ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Periodo (inglés)</FieldLabel>
          <input
            name="periodEn"
            defaultValue={item?.period?.en ?? ""}
            className={fieldClass}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Duración (español)</FieldLabel>
          <input
            name="durationEs"
            defaultValue={item?.duration?.es ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Duración (inglés)</FieldLabel>
          <input
            name="durationEn"
            defaultValue={item?.duration?.en ?? ""}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block">
        <FieldLabel icon={Link2}>URL prototipo</FieldLabel>
        <input
          name="prototypeUrl"
          defaultValue={item?.prototypeUrl ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <FieldLabel>Texto del enlace</FieldLabel>
        <select
          name="ctaKind"
          defaultValue={item?.ctaKind ?? ""}
          className={selectClass}
        >
          <option value="">Automático</option>
          <option value="prototype">Ver prototipo</option>
          <option value="visitor">Ver como visitante</option>
          <option value="live">Ver en vivo</option>
        </select>
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
          <input
            name="titleEs"
            defaultValue={item?.title.es}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel>Título (inglés)</FieldLabel>
          <input
            name="titleEn"
            defaultValue={item?.title.en}
            className={fieldClass}
          />
        </label>
      </div>
      <ImageDropField
        name="logoPath"
        label="Logo"
        profile="logo"
        folder="assets/interfaces"
        defaultValue={item?.logoPath ?? ""}
      />
      <label className="block">
        <FieldLabel>Pie de texto (opcional)</FieldLabel>
        <input
          name="caption"
          defaultValue={item?.caption ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <FieldLabel hint="Si no hay logo, se puede mostrar este nombre tipográfico.">
          Wordmark (texto grande)
        </FieldLabel>
        <input
          name="wordmark"
          defaultValue={item?.wordmark ?? ""}
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

function ProjectRowSummary({ project }: { project: UiProjectDTO }) {
  const slides = normalizeUiSlides(project.images);
  const thumb = slides[0]?.src ?? "";
  const thumbUrl = useAdminMediaUrl(thumb);
  const title = project.title.es || project.title.en || project.id;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="size-12 shrink-0 overflow-hidden bg-sky-pale/60">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{title}</p>
        <p className="truncate text-xs text-ink/55">
          {[
            project.client,
            CATEGORY_LABEL[project.category] ?? project.category,
            project.published ? "Visible" : "Oculto",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  brands,
  open,
  onOpenChange,
}: {
  project: UiProjectDTO;
  brands: BrandRef[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const session = useAdminEditSession();
  const dirty = session?.isDirty(project.id) ?? false;

  return (
    <CollapsibleEditor
      dense
      dirty={dirty}
      open={open}
      onOpenChange={onOpenChange}
      summary={<ProjectRowSummary project={project} />}
    >
      <WithUiProjectPreview
        initialDraft={projectDraft(project)}
        brands={brands}
      >
        <AdminTrackedForm
          id={project.id}
          label={project.title.es || project.id}
          saveAction={saveUiProject}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={project.id} />
          <p className="text-xs text-ink/45">ID: {project.id}</p>
          <ProjectFields item={project} brands={brands} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 border border-ink/20 px-3 py-2 text-sm text-ink"
          >
            <Save className="size-3.5" /> Guardar este
          </button>
        </AdminTrackedForm>
      </WithUiProjectPreview>
    </CollapsibleEditor>
  );
}

export function InterfacesProjectsClient({
  projects,
  brands,
  saved,
}: {
  projects: UiProjectDTO[];
  brands: BrandRef[];
  saved?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { run: runCreate } = useQuietAdminAction(saveUiProject);

  return (
    <AdminEditSession pageLabel="Interfaces">
      <div>
        <h1 className="font-admin-title text-3xl">Proyectos</h1>
        {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}
        <p className="mt-2 text-sm text-ink/60">
          Filas compactas: abrí uno para editar. Guardá varios con Guardar todo.
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
            <WithUiProjectPreview brands={brands}>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void runCreate(new FormData(e.currentTarget));
                }}
              >
                <ProjectFields showId brands={brands} />
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

        <div className="mt-6 space-y-2">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              brands={brands}
              open={openId === p.id}
              onOpenChange={(next) => setOpenId(next ? p.id : null)}
            />
          ))}
        </div>
      </div>
    </AdminEditSession>
  );
}

export function InterfacesListClient({
  list,
  saved,
}: {
  list: UiListDTO[];
  saved?: string;
}) {
  const { run: runCreate } = useQuietAdminAction(saveUiListItem);

  return (
    <AdminEditSession pageLabel="Lista UI">
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
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void runCreate(new FormData(e.currentTarget));
                }}
              >
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
            <ListItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </AdminEditSession>
  );
}

function ListItemCard({ item }: { item: UiListDTO }) {
  const session = useAdminEditSession();
  const dirty = session?.isDirty(item.id) ?? false;

  return (
    <CollapsibleEditor
      dirty={dirty}
      summary={<UiListPreview draft={listDraft(item)} locale="es" />}
    >
      <WithUiListPreview initialDraft={listDraft(item)}>
        <AdminTrackedForm
          id={item.id}
          label={item.title.es || item.id}
          saveAction={saveUiListItem}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={item.id} />
          <p className="text-xs text-ink/45">ID: {item.id}</p>
          <ListFields item={item} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 border border-ink/20 px-3 py-2 text-sm text-ink"
          >
            <Save className="size-3.5" /> Guardar este
          </button>
        </AdminTrackedForm>
      </WithUiListPreview>
    </CollapsibleEditor>
  );
}
