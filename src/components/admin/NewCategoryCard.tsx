"use client";

import { FolderPlus, Plus, Save } from "lucide-react";
import { useState } from "react";
import { FieldLabel, fieldClass } from "@/components/admin/FieldLabel";

/**
 * Alta básica de categoría (Gráfico / Interfaces).
 * Persistencia y reglas finas se afinan después.
 */
export function NewCategoryCard({
  scope,
}: {
  scope: "graphic" | "interfaces";
}) {
  const [open, setOpen] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  return (
    <li className="sm:col-span-2">
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSavedNote(false);
          }}
          className="flex w-full flex-col items-center gap-3 border border-dashed border-ink/25 bg-white px-4 py-6 text-center transition-colors hover:border-ink/40 hover:bg-sky-pale/40"
        >
          <FolderPlus className="size-10 text-ink/45" strokeWidth={1.5} />
          <span>
            <span className="block font-medium text-ink">Nueva categoría</span>
            <span className="mt-1 block text-xs text-ink/50">
              {scope === "graphic"
                ? "Agregar una sección al portfolio gráfico"
                : "Agregar un tipo en interfaces"}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ink/60">
            <Plus className="size-3.5" /> Empezar
          </span>
        </button>
      ) : (
        <form
          className="space-y-3 border border-ink/10 bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSavedNote(true);
          }}
        >
          <p className="text-sm font-medium text-ink">Nueva categoría</p>
          <p className="text-xs text-ink/55">
            Formulario básico por ahora: después definimos qué guarda cada alta.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Nombre (español)</FieldLabel>
              <input name="labelEs" required className={fieldClass} />
            </label>
            <label className="block">
              <FieldLabel>Nombre (inglés)</FieldLabel>
              <input name="labelEn" className={fieldClass} />
            </label>
          </div>
          <label className="block">
            <FieldLabel hint="Sin espacios; se usa en la URL.">
              Identificador
            </FieldLabel>
            <input
              name="slug"
              required
              placeholder="ej: branding"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <FieldLabel>Descripción corta (opcional)</FieldLabel>
            <input name="hint" className={fieldClass} />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
            >
              <Save className="size-3.5" /> Guardar borrador
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-ink/60 underline-offset-2 hover:underline"
            >
              Cancelar
            </button>
          </div>
          {savedNote ? (
            <p className="text-xs text-ink/60">
              Listo como borrador local. La persistencia real la afinamos en el
              siguiente paso.
            </p>
          ) : null}
        </form>
      )}
    </li>
  );
}
