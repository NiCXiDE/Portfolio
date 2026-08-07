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
};

export function CollapsibleEditor({
  summary,
  children,
  onDelete,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-ink/10">
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
        className="flex w-full cursor-pointer items-start gap-3 bg-sky-pale/40 p-3 text-left transition-colors hover:bg-sky-pale/70"
      >
        <div className="min-w-0 flex-1">{summary}</div>
        <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-[0.65rem] font-medium uppercase tracking-wide text-ink/55">
          {open ? (
            <>
              Cerrar
              <ChevronDown className="size-3.5 rotate-180" strokeWidth={1.75} />
            </>
          ) : (
            <>
              <Pencil className="size-3.5" strokeWidth={1.75} />
              Editar
            </>
          )}
        </span>
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
