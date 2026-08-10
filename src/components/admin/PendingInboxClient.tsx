"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, EyeOff, Trash2 } from "lucide-react";
import {
  classifyInboxItem,
  deleteInboxItem,
} from "@/app/admin/actions";
import { FieldLabel, selectClass } from "@/components/admin/FieldLabel";
import {
  CLASSIFIABLE_GRAPHIC_SECTIONS,
  suggestGraphicSection,
  suggestInboxKind,
} from "@/lib/suggest-graphic-section";
import type { GraphicSection } from "@/db/entities";

const SECTION_LABELS: Record<Exclude<GraphicSection, "pending">, string> = {
  covers: "Portadas",
  logos: "Logos",
  personal: "Personales",
  illustration: "Ilustración",
  banners: "Banners",
};

export type InboxDTO = {
  id: string;
  path: string;
  originalName: string | null;
  mime: string | null;
  width: number | null;
  height: number | null;
};

export type HiddenItemDTO = {
  id: string;
  kind: "testimonial" | "ui_project";
  label: string;
  image: string | null;
  href: string;
};

function InboxClassifyCard({ item }: { item: InboxDTO }) {
  const [width, setWidth] = useState<number | null>(item.width);
  const [height, setHeight] = useState<number | null>(item.height);
  const [destination, setDestination] = useState<"graphic" | "ui">(() =>
    suggestInboxKind({
      path: item.path,
      originalName: item.originalName,
    }),
  );

  useEffect(() => {
    if (width && height) return;
    if (!item.path || /\.svg$/i.test(item.path)) return;
    const img = new Image();
    img.onload = () => {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = item.path;
  }, [item.path, width, height]);

  const graphicSuggestion = useMemo(
    () =>
      suggestGraphicSection({
        path: item.path,
        originalName: item.originalName,
        mime: item.mime,
        width,
        height,
      }),
    [item.path, item.originalName, item.mime, width, height],
  );

  const [section, setSection] = useState(graphicSuggestion.section);
  useEffect(() => {
    setSection(graphicSuggestion.section);
  }, [graphicSuggestion.section]);

  return (
    <article className="border border-ink/10 bg-white p-4">
      <div className="flex flex-wrap gap-4">
        <div className="relative aspect-square w-28 shrink-0 overflow-hidden border border-ink/10 bg-sky-pale/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.path}
            alt=""
            className="size-full object-contain p-1"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="truncate text-sm font-medium text-ink">
              {item.originalName || item.path.split("/").pop()}
            </p>
            <p className="truncate font-mono text-[10px] text-ink/40">
              {item.path}
            </p>
          </div>

          <form action={classifyInboxItem} className="space-y-3">
            <input type="hidden" name="id" value={item.id} />
            <div>
              <FieldLabel>Destino</FieldLabel>
              <select
                name="destination"
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value as "graphic" | "ui")
                }
                className={selectClass}
              >
                <option value="graphic">Gráfico</option>
                <option value="ui">Interfaces (proyecto UI)</option>
              </select>
            </div>

            {destination === "graphic" ? (
              <div>
                <FieldLabel
                  hint={`${graphicSuggestion.reason} · confianza ${graphicSuggestion.confidence}`}
                >
                  Sección gráfica
                </FieldLabel>
                <select
                  name="toSection"
                  value={section}
                  onChange={(e) =>
                    setSection(e.target.value as typeof section)
                  }
                  className={selectClass}
                >
                  {CLASSIFIABLE_GRAPHIC_SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {SECTION_LABELS[s]}
                      {s === graphicSuggestion.section ? " (sugerido)" : ""}
                    </option>
                  ))}
                </select>
                <label className="mt-2 inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" name="published" defaultChecked />
                  Publicar al clasificar
                </label>
              </div>
            ) : (
              <p className="text-xs text-ink/55">
                Se crea un proyecto UI en borrador (no publicado) con esta
                imagen. Podés editar título y categoría después.
              </p>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
            >
              Clasificar
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </button>
          </form>

          <form action={deleteInboxItem}>
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs text-ink/50 underline hover:text-ink"
              onClick={(e) => {
                if (!confirm("¿Eliminar de la bandeja?")) e.preventDefault();
              }}
            >
              <Trash2 className="size-3" strokeWidth={1.75} />
              Descartar
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

export function PendingInboxClient({
  items,
  hiddenItems = [],
  readOnly = false,
}: {
  items: InboxDTO[];
  hiddenItems?: HiddenItemDTO[];
  readOnly?: boolean;
}) {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">Ocultos</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        {readOnly
          ? "En modo visitante esta bandeja no muestra pendientes ni contenido oculto."
          : "Todo lo que no se muestra en el sitio: cola por clasificar, testimonios ocultos y proyectos UI en borrador. Lo pendiente siempre está oculto; lo oculto no siempre está pendiente."}
      </p>

      {readOnly ? (
        <p className="mt-8 text-sm text-ink/55">
          No hay elementos visibles en esta visita.
        </p>
      ) : (
        <>
          <h2 className="mt-8 text-lg font-bold">Cola por clasificar</h2>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-ink/55">
              No hay nada en cola. Usá la bandeja del dashboard para agregar
              imágenes.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <InboxClassifyCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <h2 className="mt-10 flex items-center gap-2 text-lg font-bold">
            <EyeOff className="size-4 opacity-60" strokeWidth={1.75} />
            Ocultos en el sitio
          </h2>
          {hiddenItems.length === 0 ? (
            <p className="mt-3 text-sm text-ink/55">
              No hay testimonios ocultos ni proyectos UI en borrador.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {hiddenItems.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 border border-ink/10 bg-white p-3 transition-opacity hover:opacity-80"
                  >
                    <span className="relative aspect-square w-14 shrink-0 overflow-hidden bg-sky-pale/50">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">
                        {item.label}
                      </span>
                      <span className="text-xs text-ink/50">
                        {item.kind === "testimonial"
                          ? "Testimonio oculto"
                          : "Proyecto UI sin publicar"}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-ink/40" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
