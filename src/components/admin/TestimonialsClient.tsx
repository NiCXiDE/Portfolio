"use client";

import { EyeOff, Hash, Plus, Save, User } from "lucide-react";
import { deleteTestimonial, saveTestimonial } from "@/app/admin/actions";
import { CollapsibleEditor } from "@/components/admin/CollapsibleEditor";
import { FieldLabel, fieldClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { WithTestimonialPreview } from "@/components/admin/WithPreview";
import { TestimonialPreview } from "@/components/admin/previews";
import type { Draft } from "@/components/admin/draft";

export type TestimonialDTO = {
  id: string;
  name: string;
  imagePath: string;
  quote: { es: string; en: string };
  role: { es: string; en: string };
  companyName: string;
  companyLogoPath: string | null;
  companyHref: string | null;
  linkLabel: { es: string; en: string } | null;
  hidden: boolean;
  sortOrder: number;
};

function toDraft(item: TestimonialDTO): Draft {
  return {
    name: item.name,
    imagePath: item.imagePath,
    quoteEs: item.quote?.es ?? "",
    quoteEn: item.quote?.en ?? "",
    roleEs: item.role?.es ?? "",
    roleEn: item.role?.en ?? "",
    companyName: item.companyName,
    companyLogoPath: item.companyLogoPath ?? "",
    companyHref: item.companyHref ?? "",
    linkLabelEs: item.linkLabel?.es ?? "",
    linkLabelEn: item.linkLabel?.en ?? "",
    hidden: item.hidden,
    sortOrder: String(item.sortOrder),
  };
}

function Fields({
  item,
  showId,
}: {
  item?: TestimonialDTO;
  showId?: boolean;
}) {
  return (
    <>
      {showId ? (
        <label className="block">
          <FieldLabel icon={Hash} hint="Identificador único, sin espacios.">
            Identificador
          </FieldLabel>
          <input name="id" required placeholder="ej: cliente-juan" className={fieldClass} />
        </label>
      ) : null}
      <label className="block">
        <FieldLabel icon={User}>Nombre de la persona</FieldLabel>
        <input
          name="name"
          defaultValue={item?.name}
          required
          className={fieldClass}
        />
      </label>
      <ImageDropField
        name="imagePath"
        label="Foto"
        folder="assets/inicio/testimonials"
        defaultValue={item?.imagePath}
      />
      <label className="block">
        <FieldLabel>Cita (español)</FieldLabel>
        <textarea name="quoteEs" defaultValue={item?.quote?.es ?? ""} rows={3} className={fieldClass} />
      </label>
      <label className="block">
        <FieldLabel>Cita (inglés)</FieldLabel>
        <textarea name="quoteEn" defaultValue={item?.quote?.en ?? ""} rows={3} className={fieldClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Cargo (español)</FieldLabel>
          <input name="roleEs" defaultValue={item?.role?.es ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <FieldLabel>Cargo (inglés)</FieldLabel>
          <input name="roleEn" defaultValue={item?.role?.en ?? ""} className={fieldClass} />
        </label>
      </div>
      <label className="block">
        <FieldLabel>Empresa o marca</FieldLabel>
        <input name="companyName" defaultValue={item?.companyName} className={fieldClass} />
      </label>
      <ImageDropField
        name="companyLogoPath"
        label="Logo de la empresa (opcional)"
        hint="Si no hay logo, se muestra un enlace de texto."
        folder="assets/inicio/testimonials"
        defaultValue={item?.companyLogoPath ?? ""}
      />
      <label className="block">
        <FieldLabel hint="Web o red social de la empresa/persona.">
          Enlace externo
        </FieldLabel>
        <input
          name="companyHref"
          defaultValue={item?.companyHref ?? ""}
          placeholder="https://…"
          className={fieldClass}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel hint="Solo si no hay logo.">
            Texto del enlace (español)
          </FieldLabel>
          <input
            name="linkLabelEs"
            defaultValue={item?.linkLabel?.es ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <FieldLabel hint="Solo si no hay logo.">
            Texto del enlace (inglés)
          </FieldLabel>
          <input
            name="linkLabelEn"
            defaultValue={item?.linkLabel?.en ?? ""}
            className={fieldClass}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="hidden" defaultChecked={item?.hidden} />
          <EyeOff className="size-3.5 opacity-60" />
          Oculto en el sitio
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

export function TestimonialsClient({
  items,
  saved,
}: {
  items: TestimonialDTO[];
  saved?: string;
}) {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">Testimonios</h1>
      {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}
      <p className="mt-2 text-sm text-ink/60">
        Tocá un testimonio para editarlo.
      </p>

      <div className="mt-6">
        <CollapsibleEditor
          compact
          summary={
            <div className="flex items-center gap-2 py-1 text-sm font-medium">
              <Plus className="size-4" /> Nuevo testimonio
            </div>
          }
        >
          <WithTestimonialPreview>
            <form action={saveTestimonial} className="space-y-4">
              <Fields showId />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
              >
                <Save className="size-3.5" /> Crear
              </button>
            </form>
          </WithTestimonialPreview>
        </CollapsibleEditor>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <CollapsibleEditor
            key={item.id}
            summary={
              <TestimonialPreview draft={toDraft(item)} locale="es" />
            }
            onDelete={
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="underline">
                  Eliminar
                </button>
              </form>
            }
          >
            <WithTestimonialPreview initialDraft={toDraft(item)}>
              <form action={saveTestimonial} className="space-y-4">
                <input type="hidden" name="id" value={item.id} />
                <Fields item={item} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
                >
                  <Save className="size-3.5" /> Guardar cambios
                </button>
              </form>
            </WithTestimonialPreview>
          </CollapsibleEditor>
        ))}
      </div>
    </div>
  );
}
