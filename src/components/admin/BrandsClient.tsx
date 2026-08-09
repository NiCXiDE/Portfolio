"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { deleteBrand, saveBrand } from "@/app/admin/actions";
import { FieldLabel, fieldClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { slugifyBrand } from "@/lib/brands";

export type BrandDTO = {
  id: string;
  name: string;
  logoPath: string | null;
  href: string | null;
  sortOrder: number;
  published: boolean;
};

export function BrandsClient({ brands }: { brands: BrandDTO[] }) {
  return (
    <div className="space-y-8">
      <section className="border border-ink/10 p-4">
        <h2 className="mb-3 text-lg font-bold">Nueva marca</h2>
        <BrandForm />
      </section>
      <div className="space-y-4">
        {brands.map((b) => (
          <section key={b.id} className="border border-ink/10 p-4">
            <BrandForm item={b} />
          </section>
        ))}
      </div>
    </div>
  );
}

function BrandForm({ item }: { item?: BrandDTO }) {
  const [name, setName] = useState(item?.name ?? "");
  const [id, setId] = useState(item?.id ?? "");
  const isNew = !item;

  return (
    <form action={saveBrand} className="space-y-3">
      {!isNew ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <FieldLabel hint="Se usa en @menciones, ej. @push">
            Identificador
          </FieldLabel>
          <input
            name={isNew ? "id" : undefined}
            value={id}
            onChange={(e) =>
              setId(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "-")
                  .replace(/-+/g, "-"),
              )
            }
            onBlur={() => {
              if (!id.trim() && name.trim()) setId(slugifyBrand(name));
            }}
            required={isNew}
            disabled={!isNew}
            className={fieldClass}
            placeholder="push"
          />
        </label>
        <label className="block">
          <FieldLabel>Nombre</FieldLabel>
          <input
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (isNew && !item) {
                setId((prev) =>
                  prev && prev !== slugifyBrand(name)
                    ? prev
                    : slugifyBrand(e.target.value),
                );
              }
            }}
            required
            className={fieldClass}
          />
        </label>
        <label className="block sm:w-24">
          <FieldLabel>Orden</FieldLabel>
          <input
            type="number"
            name="sortOrder"
            defaultValue={item?.sortOrder ?? 0}
            className={fieldClass}
          />
        </label>
      </div>
      <ImageDropField
        name="logoPath"
        label="Logo"
        folder="assets/inicio/brands"
        defaultValue={item?.logoPath ?? ""}
      />
      <label className="block">
        <FieldLabel>Sitio web</FieldLabel>
        <input
          name="href"
          defaultValue={item?.href ?? ""}
          placeholder="https://…"
          className={fieldClass}
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          defaultChecked={item?.published ?? true}
        />
        Visible / usable en menciones
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm text-sky-pale"
        >
          <Save className="size-3.5" strokeWidth={1.75} />
          {isNew ? "Crear marca" : "Guardar"}
        </button>
        {!isNew ? (
          <button
            formAction={deleteBrand}
            type="submit"
            name="id"
            value={item.id}
            className="inline-flex items-center gap-2 border border-alert-danger/40 px-3 py-2 text-sm text-ink hover:bg-[#fff5f5]"
            onClick={(e) => {
              if (!confirm(`¿Eliminar marca “${item.name}”?`)) {
                e.preventDefault();
              }
            }}
          >
            <Trash2 className="size-3.5" strokeWidth={1.75} />
            Eliminar
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-ink/45">
            <Plus className="size-3.5" />
            Luego podés citarla con @{id || "id"}
          </span>
        )}
      </div>
    </form>
  );
}
