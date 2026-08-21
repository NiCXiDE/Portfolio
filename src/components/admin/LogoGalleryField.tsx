"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { inferFrameFromDimensions } from "@/lib/graphic-gallery";
import type { GraphicFrame, GraphicGalleryLabel } from "@/lib/graphic-gallery";
import {
  useAdminMediaUrl,
  useMediaBase,
} from "@/components/admin/AdminMediaProvider";
import { ImageGalleryField } from "@/components/admin/ImageGalleryField";
import { resolveMediaUrl } from "@/lib/media";

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
      typeof frameRaw === "string" ? (frameRaw as GraphicFrame) : undefined;
    const labelObj = obj ? (obj as Record<string, unknown>).label : undefined;
    let label: GraphicGalleryLabel | undefined;
    if (
      labelObj &&
      typeof labelObj === "object" &&
      typeof (labelObj as { es?: unknown }).es === "string" &&
      typeof (labelObj as { en?: unknown }).en === "string"
    ) {
      label = {
        es: (labelObj as { es: string }).es,
        en: (labelObj as { en: string }).en,
      };
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

  useEffect(() => {
    setItems((prev) =>
      paths.map((src) => prev.find((p) => p.src === src) ?? { src }),
    );
  }, [paths]);

  const inferredFor = useRef<Set<string>>(new Set());
  const mediaBase = useMediaBase();

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
          img.src = resolveMediaUrl(item.src, mediaBase);
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
  }, [items, mediaBase]);

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

      <input type="hidden" name="galleryItemsJson" value={galleryItemsJson} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <LogoGalleryItemEditor
            key={`${item.src}-${index}`}
            item={item}
            onFrameChange={(frame) => {
              setItems((prev) =>
                prev.map((p) => (p.src === item.src ? { ...p, frame } : p)),
              );
            }}
            onLabelChange={(locale, value) => {
              setItems((prev) =>
                prev.map((p) => {
                  if (p.src !== item.src) return p;
                  const label = p.label ?? { es: "", en: "" };
                  return {
                    ...p,
                    label: { ...label, [locale]: value },
                  };
                }),
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LogoGalleryItemEditor({
  item,
  onFrameChange,
  onLabelChange,
}: {
  item: {
    src: string;
    frame?: GraphicFrame;
    label?: GraphicGalleryLabel;
  };
  onFrameChange: (frame: GraphicFrame) => void;
  onLabelChange: (locale: "es" | "en", value: string) => void;
}) {
  const previewUrl = useAdminMediaUrl(item.src);
  return (
    <div className="rounded border border-ink/10 bg-white p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt=""
        className="mb-2 aspect-[4/3] w-full object-cover"
      />

      <label className="block text-xs font-medium text-ink/70">
        Proporción
        <select
          className="mt-1 w-full rounded border border-ink/20 px-2 py-1"
          value={item.frame ?? "landscape"}
          onChange={(e) => {
            onFrameChange(e.target.value as GraphicFrame);
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
            onBlur={(e) => onLabelChange("es", e.target.value)}
          />
        </label>
        <label className="block text-xs font-medium text-ink/70">
          Etiqueta (en)
          <input
            type="text"
            className="mt-1 w-full rounded border border-ink/20 px-2 py-1"
            defaultValue={item.label?.en ?? ""}
            placeholder="Optional"
            onBlur={(e) => onLabelChange("en", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
