"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { inferFrameFromDimensions } from "@/lib/graphic-gallery";
import type { GraphicFrame, GraphicGalleryLabel } from "@/lib/graphic-gallery";
import { ImageGalleryField } from "@/components/admin/ImageGalleryField";

const FRAMES: { id: GraphicFrame; label: string }[] = [
  { id: "landscape", label: "Landscape (16:9)" },
  { id: "square", label: "Square (1:1)" },
  { id: "four-three", label: "4:3" },
  { id: "five-four", label: "5:4" },
  { id: "portrait", label: "Portrait (3:4)" },
  { id: "banner", label: "Banner (1:2)" },
];

function extractSrc(entry: unknown): string | null {
  if (!entry) return null;
  if (typeof entry === "string") return entry;
  if (typeof entry === "object") {
    const obj = entry as Record<string, unknown>;
    const srcVal = obj.src ?? obj.path;
    if (typeof srcVal === "string") return srcVal;
  }
  return null;
}

function normalizeDefaultGallery(defaultGalleryPaths: unknown[] | null) {
  const out: {
    src: string;
    frame?: GraphicFrame;
    label?: GraphicGalleryLabel;
  }[] = [];
  for (const entry of defaultGalleryPaths ?? []) {
    const src = extractSrc(entry);
    if (!src) continue;
    const obj = typeof entry === "object" && entry !== null ? entry : null;
    const frameRaw = obj ? (obj as Record<string, unknown>).frame : undefined;
    const frame =
      typeof frameRaw === "string"
        ? (frameRaw as GraphicFrame)
        : undefined;
    const labelObj = obj ? (obj as Record<string, unknown>).label : undefined;
    let label: GraphicGalleryLabel | undefined;
    if (
      labelObj &&
      typeof labelObj === "object" &&
      typeof (labelObj as any).es === "string" &&
      typeof (labelObj as any).en === "string"
    ) {
      label = { es: (labelObj as any).es, en: (labelObj as any).en };
    }
    out.push({ src, frame, label });
  }
  return out;
}

export function LogoGalleryField({
  folder,
  defaultGalleryPaths,
  itemId,
}: {
  folder: string;
  defaultGalleryPaths: unknown[] | null;
  itemId?: string;
}) {
  const initialItems = useMemo(
    () => normalizeDefaultGallery(defaultGalleryPaths),
    [defaultGalleryPaths],
  );

  const [paths, setPaths] = useState<string[]>(initialItems.map((x) => x.src));
  const [items, setItems] = useState(initialItems);

  // Keep `items` ordered to match `paths`.
  useEffect(() => {
    setItems((prev) =>
      paths.map((src) => prev.find((p) => p.src === src) ?? { src }),
    );
  }, [paths]);

  const inferredFor = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function infer() {
      for (const item of items) {
        if (cancelled) return;
        if (item.frame) continue;
        if (inferredFor.current.has(item.src)) continue;
        inferredFor.current.add(item.src);

        const frame = await new Promise<GraphicFrame>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve(
              inferFrameFromDimensions(img.naturalWidth, img.naturalHeight),
            );
          };
          img.onerror = () => resolve("landscape");
          img.src = item.src;
        });

        if (cancelled) return;
        setItems((prev) =>
          prev.map((p) => (p.src === item.src ? { ...p, frame } : p)),
        );
      }
    }
    void infer();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const galleryItemsJson = useMemo(() => JSON.stringify(items), [items]);

  return (
    <div className="space-y-4">
      <ImageGalleryField
        name="galleryPaths"
        folder={folder}
        value={paths}
        onChange={setPaths}
        label={`Recursos de la ficha${itemId ? ` (${itemId})` : ""}`}
        hint="La grilla muestra la imagen principal. Estas piezas aparecen en la ficha pública del logo (/grafico/logos/[id])."
      />

      <input
        type="hidden"
        name="galleryItemsJson"
        value={galleryItemsJson}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={`${item.src}-${index}`}
            className="rounded border border-ink/10 bg-white p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt=""
              className="mb-2 aspect-[4/3] w-full object-cover"
            />

            <label className="block text-xs font-medium text-ink/70">
              Proporción
              <select
                className="mt-1 w-full rounded border border-ink/20 px-2 py-1"
                value={item.frame ?? "landscape"}
                onChange={(e) => {
                  const frame = e.target.value as GraphicFrame;
                  setItems((prev) =>
                    prev.map((p) =>
                      p.src === item.src ? { ...p, frame } : p,
                    ),
                  );
                }}
              >
                {FRAMES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <label className="block text-xs font-medium text-ink/70">
                Etiqueta (es)
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-ink/20 px-2 py-1"
                  defaultValue={item.label?.es ?? ""}
                  placeholder="Opcional"
                  onBlur={(e) => {
                    const es = e.target.value;
                    setItems((prev) =>
                      prev.map((p) => {
                        if (p.src !== item.src) return p;
                        const en = p.label?.en ?? "";
                        return { ...p, label: { es, en } };
                      }),
                    );
                  }}
                />
              </label>
              <label className="block text-xs font-medium text-ink/70">
                Etiqueta (en)
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-ink/20 px-2 py-1"
                  defaultValue={item.label?.en ?? ""}
                  placeholder="Optional"
                  onBlur={(e) => {
                    const en = e.target.value;
                    setItems((prev) =>
                      prev.map((p) => {
                        if (p.src !== item.src) return p;
                        const es = p.label?.es ?? "";
                        return { ...p, label: { es, en } };
                      }),
                    );
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

