"use client";

import { useEffect, useRef, useState } from "react";
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { uploadLocalAsset } from "@/app/admin/upload-local";
import { FieldLabel } from "@/components/admin/FieldLabel";
import type { UiSlide, UiSlideAspect } from "@/lib/ui-slides";

type Props = {
  name?: string;
  folder: string;
  value: UiSlide[];
  onChange: (slides: UiSlide[]) => void;
};

export function UiSlideGalleryField({
  name = "images",
  folder,
  value,
  onChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    hiddenRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [value]);

  async function addFiles(files: FileList | File[] | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const next = [...value];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", folder);
        const res = await uploadLocalAsset(fd);
        if (!res.ok) {
          setError(res.error);
          break;
        }
        next.push({ src: res.path, aspect: "landscape" });
      }
      onChange(next);
    } catch {
      setError("No se pudo subir.");
    } finally {
      setBusy(false);
    }
  }

  function setAspect(index: number, aspect: UiSlideAspect) {
    onChange(
      value.map((slide, i) => (i === index ? { ...slide, aspect } : slide)),
    );
  }

  return (
    <div className="space-y-2">
      <FieldLabel hint="Landscape = web 16:9. Portrait = mobile/totem. La primera landscape suele ser la card.">
        Pantallas del proyecto
      </FieldLabel>
      <textarea
        ref={hiddenRef}
        name={name}
        value={JSON.stringify(value)}
        readOnly
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-[5.5rem] flex-col items-center justify-center gap-2 border border-dashed px-3 py-4 text-center transition-colors ${
          dragging
            ? "border-ink bg-sky-pale"
            : "border-ink/25 bg-white hover:border-ink/40"
        }`}
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin text-ink/50" />
        ) : (
          <>
            <ImagePlus className="size-6 text-ink/35" strokeWidth={1.5} />
            <p className="text-xs text-ink/60">
              Arrastrá pantallas o elegí archivos
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="bg-ink px-2.5 py-1.5 text-xs text-sky-pale disabled:opacity-50"
            >
              Subir
            </button>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {value.map((slide, index) => (
            <li
              key={`${slide.src}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex == null || dragIndex === index) return;
                const copy = [...value];
                const [row] = copy.splice(dragIndex, 1);
                copy.splice(index, 0, row);
                onChange(copy);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`group relative overflow-hidden border border-ink/10 bg-sky-pale/40 ${
                dragIndex === index ? "opacity-50" : ""
              }`}
            >
              <div
                className={`relative mx-auto w-full overflow-hidden bg-ink/5 ${
                  slide.aspect === "portrait"
                    ? "aspect-[9/16] max-h-48"
                    : "aspect-video"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.src}
                  alt=""
                  className="size-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-ink/10 px-2 py-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] text-ink/50">
                  <GripVertical className="size-3" />
                  {index + 1}
                </span>
                <select
                  value={slide.aspect}
                  onChange={(e) =>
                    setAspect(index, e.target.value as UiSlideAspect)
                  }
                  className="rounded border border-ink/15 bg-white px-1.5 py-0.5 text-[11px]"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
                <button
                  type="button"
                  aria-label="Quitar imagen"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="flex size-6 items-center justify-center text-ink/70 hover:text-ink"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
