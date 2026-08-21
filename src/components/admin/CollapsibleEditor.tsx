"use client";

import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

type Props = {
  /** Vista cuando está cerrado (solo preview) */
  summary: ReactNode;
  /** Formulario editable */
  children: ReactNode;
  /** Acción eliminar opcional */
  onDelete?: ReactNode;
  defaultOpen?: boolean;
  /** Controlled open (opcional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Botón “nuevo”: ancho al contenido, sin etiqueta EDITAR.
   */
  compact?: boolean;
  /** Fila densa (Interfaces): summary ocupa poco alto */
  dense?: boolean;
  /** Indicador de cambios pendientes en el summary */
  dirty?: boolean;
};

export function CollapsibleEditor({
  summary,
  children,
  onDelete,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  compact = false,
  dense = false,
  dirty = false,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : uncontrolledOpen;

  function setOpen(next: boolean) {
    if (!controlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div
      className={`border border-ink/10 ${compact && !open ? "inline-block w-fit max-w-full" : "w-full"}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className={`flex cursor-pointer items-center gap-3 bg-white text-left transition-colors hover:bg-ink/[0.03] ${
          dense ? "px-3 py-2" : "items-start p-3"
        } ${compact && !open ? "w-fit" : "w-full"}`}
      >
        <div className={`min-w-0 ${compact && !open ? "" : "flex-1"}`}>
          {summary}
        </div>
        {dirty ? (
          <span
            className="mt-0.5 size-2 shrink-0 rounded-full bg-amber-500"
            title="Cambios sin guardar"
            aria-label="Cambios sin guardar"
          />
        ) : null}
        {!compact ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.65rem] font-medium uppercase tracking-wide text-ink/55">
            {open ? (
              <>
                Cerrar
                <ChevronDown
                  className="size-3.5 rotate-180"
                  strokeWidth={1.75}
                />
              </>
            ) : (
              <>
                <Pencil className="size-3.5" strokeWidth={1.75} />
                Editar
              </>
            )}
          </span>
        ) : open ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.65rem] font-medium uppercase tracking-wide text-ink/55">
            Cerrar
            <ChevronDown className="size-3.5 rotate-180" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>

      {open ? (
        <div className="border-t border-ink/10 p-4">
          {children}
          {onDelete ? (
            <div className="mt-4 flex items-center gap-2 border-t border-ink/10 pt-3 text-sm text-red-700">
              <Trash2 className="size-3.5" strokeWidth={1.75} />
              {onDelete}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
