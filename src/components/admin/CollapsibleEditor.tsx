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
  /**
   * Botón “nuevo”: ancho al contenido, sin etiqueta EDITAR.
   */
  compact?: boolean;
};

export function CollapsibleEditor({
  summary,
  children,
  onDelete,
  defaultOpen = false,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`border border-ink/10 ${compact && !open ? "inline-block w-fit max-w-full" : "w-full"}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={`flex cursor-pointer items-start gap-3 bg-white p-3 text-left transition-colors hover:bg-ink/[0.03] ${
          compact && !open ? "w-fit" : "w-full"
        }`}
      >
        <div className={`min-w-0 ${compact && !open ? "" : "flex-1"}`}>
          {summary}
        </div>
        {!compact ? (
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-[0.65rem] font-medium uppercase tracking-wide text-ink/55">
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
          <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-[0.65rem] font-medium uppercase tracking-wide text-ink/55">
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
