"use client";

import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { deleteBrand, saveBrand } from "@/app/admin/actions";
import {
  AdminEditSession,
  AdminTrackedForm,
} from "@/components/admin/AdminEditSession";
import { FieldLabel, fieldClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { useQuietAdminAction } from "@/components/admin/useQuietAdminAction";
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
    <AdminEditSession pageLabel="Marcas">
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
    </AdminEditSession>
  );
}

function BrandForm({ item }: { item?: BrandDTO }) {
  const [name, setName] = useState(item?.name ?? "");
  const [id, setId] = useState(item?.id ?? "");
  const isNew = !item;
  const { run: runCreate } = useQuietAdminAction(saveBrand);
  const { run: runDelete } = useQuietAdminAction(deleteBrand);

  const fields = (
    <>
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
        assetName="logoAssetId"
        label="Logo"
        profile="logo"
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
    </>
  );

  if (isNew) {
    return (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void runCreate(new FormData(e.currentTarget));
        }}
      >
        {fields}
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm text-sky-pale"
        >
          <Save className="size-3.5" strokeWidth={1.75} />
          Crear marca
        </button>
      </form>
    );
  }

  return (
    <AdminTrackedForm
      id={item.id}
      label={item.name}
      saveAction={saveBrand}
      className="space-y-3"
    >
      {fields}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 border border-ink/20 px-3 py-2 text-sm text-ink"
        >
          <Save className="size-3.5" strokeWidth={1.75} />
          Guardar este
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 border border-alert-danger/40 px-3 py-2 text-sm text-ink hover:bg-[#fff5f5]"
          onClick={() => {
            if (!confirm(`¿Eliminar marca “${item.name}”?`)) return;
            const fd = new FormData();
            fd.set("id", item.id);
            void runDelete(fd);
          }}
        >
          <Trash2 className="size-3.5" strokeWidth={1.75} />
          Eliminar
        </button>
      </div>
    </AdminTrackedForm>
  );
}
