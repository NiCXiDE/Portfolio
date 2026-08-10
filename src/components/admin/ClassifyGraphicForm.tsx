"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { classifyGraphicItem } from "@/app/admin/actions";
import { FieldLabel, selectClass } from "@/components/admin/FieldLabel";
import {
  CLASSIFIABLE_GRAPHIC_SECTIONS,
  suggestGraphicSection,
} from "@/lib/suggest-graphic-section";
import type { GraphicSection } from "@/db/entities";

const SECTION_LABELS: Record<Exclude<GraphicSection, "pending">, string> = {
  covers: "Portadas",
  logos: "Logos",
  personal: "Personales",
  illustration: "Ilustración",
  banners: "Banners",
};

type Props = {
  itemId: string;
  srcPath: string;
  originalName?: string | null;
  mime?: string | null;
  width?: number | null;
  height?: number | null;
};

export function ClassifyGraphicForm({
  itemId,
  srcPath,
  originalName,
  mime,
  width: widthProp,
  height: heightProp,
}: Props) {
  const [width, setWidth] = useState<number | null>(widthProp ?? null);
  const [height, setHeight] = useState<number | null>(heightProp ?? null);

  useEffect(() => {
    if (widthProp && heightProp) return;
    if (!srcPath || /\.svg$/i.test(srcPath)) return;
    const img = new Image();
    img.onload = () => {
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = srcPath;
  }, [srcPath, widthProp, heightProp]);

  const suggestion = useMemo(
    () =>
      suggestGraphicSection({
        path: srcPath,
        originalName: originalName ?? null,
        mime: mime ?? null,
        width,
        height,
      }),
    [srcPath, originalName, mime, width, height],
  );

  const [section, setSection] = useState(suggestion.section);
  useEffect(() => {
    setSection(suggestion.section);
  }, [suggestion.section]);

  return (
    <form
      action={classifyGraphicItem}
      className="mt-3 flex flex-wrap items-end gap-3 border border-dashed border-ink/20 bg-sky-pale/40 p-3"
    >
      <input type="hidden" name="id" value={itemId} />
      <div className="min-w-[10rem] flex-1">
        <FieldLabel
          hint={`${suggestion.reason} · confianza ${suggestion.confidence}`}
        >
          Clasificar a
        </FieldLabel>
        <select
          name="toSection"
          value={section}
          onChange={(e) =>
            setSection(e.target.value as typeof suggestion.section)
          }
          className={selectClass}
        >
          {CLASSIFIABLE_GRAPHIC_SECTIONS.map((s) => (
            <option key={s} value={s}>
              {SECTION_LABELS[s]}
              {s === suggestion.section ? " (sugerido)" : ""}
            </option>
          ))}
        </select>
      </div>
      <label className="inline-flex items-center gap-2 pb-2 text-sm">
        <input type="checkbox" name="published" defaultChecked />
        Publicar al clasificar
      </label>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 bg-ink px-3 py-2 text-sm text-sky-pale"
      >
        Mover
        <ArrowRight className="size-3.5" strokeWidth={1.75} />
      </button>
    </form>
  );
}
