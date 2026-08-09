"use client";

import { useState } from "react";
import { EyeOff, Hash, Plus, Save, User } from "lucide-react";
import { deleteTestimonial, saveTestimonial } from "@/app/admin/actions";
import { CollapsibleEditor } from "@/components/admin/CollapsibleEditor";
import { FieldLabel, fieldClass, selectClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { MentionTextarea } from "@/components/admin/MentionTextarea";
import { WithTestimonialPreview } from "@/components/admin/WithPreview";
import { TestimonialPreview } from "@/components/admin/previews";
import type { Draft } from "@/components/admin/draft";
import type { BrandRef } from "@/lib/brands";

export type TestimonialDTO = {
  id: string;
  name: string;
  imagePath: string;
  quote: { es: string; en: string };
  role: { es: string; en: string };
  companyName: string;
  companyLogoPath: string | null;
  companyHref: string | null;
  companyBrandId: string | null;
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
    companyBrandId: item.companyBrandId ?? "",
    linkLabelEs: item.linkLabel?.es ?? "",
    linkLabelEn: item.linkLabel?.en ?? "",
    hidden: item.hidden,
    sortOrder: String(item.sortOrder),
  };
}

function Fields({
  item,
  showId,
  brands,
}: {
  item?: TestimonialDTO;
  showId?: boolean;
  brands: BrandRef[];
}) {
  const [quoteEs, setQuoteEs] = useState(item?.quote?.es ?? "");
  const [quoteEn, setQuoteEn] = useState(item?.quote?.en ?? "");
  const [roleEs, setRoleEs] = useState(item?.role?.es ?? "");
  const [roleEn, setRoleEn] = useState(item?.role?.en ?? "");
  const [brandId, setBrandId] = useState(item?.companyBrandId ?? "");
  const [companyName, setCompanyName] = useState(item?.companyName ?? "");
  const [companyHref, setCompanyHref] = useState(item?.companyHref ?? "");
  const [companyLogoPath, setCompanyLogoPath] = useState(
    item?.companyLogoPath ?? "",
  );

  function applyBrand(id: string) {
    setBrandId(id);
    const brand = brands.find((b) => b.id === id);
    if (!brand) return;
    setCompanyName(brand.name);
    setCompanyHref(brand.href ?? "");
    if (brand.logoPath) setCompanyLogoPath(brand.logoPath);
    else if (brand.logo) setCompanyLogoPath(brand.logo);
  }

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
      <div>
        <FieldLabel>Cita (español)</FieldLabel>
        <MentionTextarea
          name="quoteEs"
          value={quoteEs}
          onChange={setQuoteEs}
          brands={brands}
          rows={3}
        />
      </div>
      <div>
        <FieldLabel>Cita (inglés)</FieldLabel>
        <MentionTextarea
          name="quoteEn"
          value={quoteEn}
          onChange={setQuoteEn}
          brands={brands}
          rows={3}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>Cargo (español)</FieldLabel>
          <MentionTextarea
            name="roleEs"
            value={roleEs}
            onChange={setRoleEs}
            brands={brands}
            rows={2}
          />
        </div>
        <div>
          <FieldLabel>Cargo (inglés)</FieldLabel>
          <MentionTextarea
            name="roleEn"
            value={roleEn}
            onChange={setRoleEn}
            brands={brands}
            rows={2}
          />
        </div>
      </div>
      <label className="block">
        <FieldLabel hint="Vinculá una marca del catálogo para reutilizar nombre, logo y web.">
          Marca vinculada
        </FieldLabel>
        <select
          name="companyBrandId"
          value={brandId}
          onChange={(e) => applyBrand(e.target.value)}
          className={selectClass}
        >
          <option value="">Sin marca (manual)</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} (@{b.id})
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <FieldLabel hint="Se rellena desde la marca; podés sobrescribir.">
          Empresa o marca
        </FieldLabel>
        <input
          name="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={fieldClass}
        />
      </label>
      <ImageDropField
        name="companyLogoPath"
        label="Logo de la empresa (opcional)"
        hint="Si hay marca vinculada, usá su logo salvo que subas otro."
        folder="assets/inicio/testimonials"
        defaultValue={companyLogoPath}
        key={companyLogoPath || "empty-logo"}
      />
      <label className="block">
        <FieldLabel hint="Web o red social de la empresa/persona.">
          Enlace externo
        </FieldLabel>
        <input
          name="companyHref"
          value={companyHref}
          onChange={(e) => setCompanyHref(e.target.value)}
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
  brands,
  saved,
}: {
  items: TestimonialDTO[];
  brands: BrandRef[];
  saved?: string;
}) {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">Testimonios</h1>
      {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}
      <p className="mt-2 text-sm text-ink/60">
        Tocá un testimonio para editarlo. Vinculá marcas del catálogo o citá con @.
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
              <Fields showId brands={brands} />
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
                <Fields item={item} brands={brands} />
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
