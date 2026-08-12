"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { uploadLocalAsset } from "@/app/admin/upload-local";
import { FieldLabel } from "@/components/admin/FieldLabel";

type Props = {
  name?: string;
  folder: string;
  value: string[];
  onChange: (paths: string[]) => void;
  label?: string;
  hint?: string;
};

export function ImageGalleryField({
  name = "images",
  folder,
  value,
  onChange,
  label = "Imágenes del proyecto",
  hint = "La primera es la de la card. Arrastrá miniaturas para reordenar.",
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
        next.push(res.path);
      }
      onChange(next);
    } catch {
      setError("No se pudo subir.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <textarea
        ref={hiddenRef}
        name={name}
        value={value.join("\n")}
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
              Arrastrá imágenes o elegí archivos
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
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((src, index) => (
            <li
              key={`${src}-${index}`}
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
              className={`group relative aspect-[4/3] overflow-hidden border border-ink/10 bg-sky-pale/40 ${
                dragIndex === index ? "opacity-50" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="size-full object-cover"
              />
              <span className="absolute left-1 top-1 bg-ink/80 px-1.5 py-0.5 text-[10px] text-sky-pale">
                {index === 0 ? "Card" : index + 1}
              </span>
              <span className="absolute bottom-1 left-1 text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="size-3.5 drop-shadow" />
              </span>
              <button
                type="button"
                aria-label="Quitar imagen"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 flex size-6 items-center justify-center bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

export function PreviewImageCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const valid = images.filter(Boolean);

  useEffect(() => {
    setIndex(0);
  }, [images.join("|")]);

  useEffect(() => {
    if (valid.length < 2) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % valid.length);
    }, 3200);
    return () => window.clearInterval(t);
  }, [valid.length]);

  if (!valid.length) {
    return <div className="size-full bg-sky-pale" />;
  }

  const current = valid[index % valid.length];

  return (
    <div
      className="relative size-full cursor-pointer"
      onClick={() => setIndex((i) => (i + 1) % valid.length)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIndex((i) => (i + 1) % valid.length);
        }
      }}
      aria-label="Cambiar imagen de preview"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current} alt={alt} className="size-full object-cover" />
      {valid.length > 1 ? (
        <>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {valid.map((_, i) => (
              <span
                key={i}
                className={`size-1.5 rounded-full ${
                  i === index % valid.length ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Anterior"
            className="absolute left-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center bg-ink/50 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i - 1 + valid.length) % valid.length);
            }}
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center bg-ink/50 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i + 1) % valid.length);
            }}
          >
            <ArrowRight className="size-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
