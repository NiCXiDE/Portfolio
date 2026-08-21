"use client";

import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { uploadLocalAsset } from "@/app/admin/upload-local";
import {
  useAdminMediaUrl,
  useMediaBase,
} from "@/components/admin/AdminMediaProvider";
import { FieldLabel } from "@/components/admin/FieldLabel";
import { resolveMediaUrl } from "@/lib/media";
import { uploadErrorMessage, type UploadErrorCode } from "@/lib/upload-errors";
import {
  preflightUploadFile,
  uploadRuleHint,
  type UploadProfile,
} from "@/lib/upload-rules";

type LibraryItem = {
  id: string;
  path: string;
  originalName: string | null;
  /** Si viene del server ya resuelto; si no, se resuelve con la base del admin */
  previewUrl?: string;
};

type Props = {
  /** Si se omite, no envía el path en el form (solo callback) */
  name?: string;
  /** Campo oculto para media_assets.id */
  assetName?: string;
  label: string;
  hint?: string;
  /** Storage path `/assets/...` (valor que se guarda) */
  defaultValue?: string;
  /** URL resuelta en server con `mediaUrl(defaultValue)` para preview inicial */
  defaultPreviewUrl?: string;
  defaultAssetId?: string;
  /** Carpeta / prefijo en R2, p.ej. assets/grafico/covers */
  folder: string;
  accept?: string;
  /** Perfil de reglas (formatos / recomendado / máx.) */
  profile?: UploadProfile;
  /** Si es PDF u otro no-imagen */
  kind?: "image" | "file";
  onUploaded?: (path: string, assetId: string, previewUrl: string) => void;
  /** Piezas recientes de la biblioteca para reutilizar */
  library?: LibraryItem[];
};

function LibraryThumb({ item }: { item: LibraryItem }) {
  const resolved = useAdminMediaUrl(item.path);
  const src = item.previewUrl || resolved;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="aspect-square w-full object-contain bg-sky-pale/50"
    />
  );
}

export function ImageDropField({
  name,
  assetName,
  label,
  hint,
  defaultValue = "",
  defaultPreviewUrl,
  defaultAssetId = "",
  folder,
  accept,
  profile: profileProp,
  kind = "image",
  onUploaded,
  library = [],
}: Props) {
  const profile: UploadProfile =
    profileProp ?? (kind === "file" ? "pdf" : "image");
  const rules = useMemo(() => uploadRuleHint(profile), [profile]);
  const resolvedAccept = accept ?? rules.accept;

  const mediaBase = useMediaBase();
  const inputRef = useRef<HTMLInputElement>(null);
  const assetRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(defaultValue);
  const [previewUrl, setPreviewUrl] = useState(
    () => defaultPreviewUrl || resolveMediaUrl(defaultValue, mediaBase),
  );
  const [assetId, setAssetId] = useState(defaultAssetId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    // Notifica al AdminEditorShell (delegation onInput)
    inputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [path, assetId]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const preflight = preflightUploadFile(file, profile);
      if (preflight) {
        setError(uploadErrorMessage(preflight));
        return;
      }

      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      if (
        kind === "image" &&
        file.type.startsWith("image/") &&
        !file.type.includes("svg")
      ) {
        const size = await new Promise<{ w: number; h: number } | null>(
          (resolve) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
              resolve({ w: img.naturalWidth, h: img.naturalHeight });
              URL.revokeObjectURL(url);
            };
            img.onerror = () => {
              resolve(null);
              URL.revokeObjectURL(url);
            };
            img.src = url;
          },
        );
        if (size) {
          fd.set("width", String(size.w));
          fd.set("height", String(size.h));
        }
      }
      const res = await uploadLocalAsset(fd);
      if (!res.ok) {
        setError(
          res.error ||
            uploadErrorMessage(
              (res.code as UploadErrorCode) || "UNKNOWN_UPLOAD_ERROR",
            ),
        );
        return;
      }
      setPath(res.path);
      setPreviewUrl(res.previewUrl);
      setAssetId(res.assetId);
      onUploaded?.(res.path, res.assetId, res.previewUrl);
    } catch {
      setError(uploadErrorMessage("UNKNOWN_UPLOAD_ERROR"));
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files?.[0]);
  }

  function selectLibraryItem(item: LibraryItem) {
    const nextPreview =
      item.previewUrl || resolveMediaUrl(item.path, mediaBase);
    setPath(item.path);
    setPreviewUrl(nextPreview);
    setAssetId(item.id);
    setShowLibrary(false);
    onUploaded?.(item.path, item.id, nextPreview);
  }

  const combinedHint = hint;

  return (
    <div className="space-y-1.5">
      <FieldLabel hint={combinedHint || undefined}>{label}</FieldLabel>
      <p className="text-[0.7rem] leading-snug text-ink/55">{rules.summary}</p>
      {rules.note ? (
        <p className="text-[0.7rem] leading-snug text-ink/45">{rules.note}</p>
      ) : null}

      {name ? (
        <input ref={inputRef} type="hidden" name={name} value={path} />
      ) : (
        <input ref={inputRef} type="hidden" value={path} readOnly aria-hidden />
      )}
      {assetName ? (
        <input ref={assetRef} type="hidden" name={assetName} value={assetId} />
      ) : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[7.5rem] flex-col items-center justify-center gap-2 border border-dashed px-3 py-4 text-center transition-colors ${
          dragging
            ? "border-ink bg-sky-pale"
            : "border-ink/25 bg-white hover:border-ink/40"
        }`}
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin text-ink/50" />
        ) : path && kind === "image" && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="max-h-32 max-w-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : path ? (
          <p className="max-w-full truncate font-mono text-xs text-ink/70">
            {kind === "file" && previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
                onClick={(e) => e.stopPropagation()}
              >
                {path}
              </a>
            ) : (
              path
            )}
          </p>
        ) : (
          <>
            <ImagePlus className="size-6 text-ink/35" strokeWidth={1.5} />
            <p className="text-xs text-ink/60">
              Arrastrá acá o elegí un archivo
            </p>
          </>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 bg-ink px-2.5 py-1.5 text-xs text-sky-pale disabled:opacity-50"
          >
            <Upload className="size-3.5" strokeWidth={1.75} />
            {path ? "Reemplazar" : "Subir"}
          </button>
          {library.length ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowLibrary((v) => !v)}
              className="text-xs text-ink/60 underline hover:text-ink"
            >
              Biblioteca
            </button>
          ) : null}
          {path ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setPath("");
                setPreviewUrl("");
                setAssetId("");
              }}
              className="inline-flex items-center gap-1 text-xs text-ink/60 hover:text-ink"
            >
              <X className="size-3.5" strokeWidth={1.75} />
              Quitar
            </button>
          ) : null}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={resolvedAccept}
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {showLibrary && library.length ? (
        <ul className="grid max-h-48 grid-cols-4 gap-1 overflow-auto border border-ink/10 p-1">
          {library.slice(0, 24).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="block w-full border border-transparent p-0.5 hover:border-ink"
                title={item.originalName || item.path}
                onClick={() => selectLibraryItem(item)}
              >
                <LibraryThumb item={item} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {path ? (
        <p className="truncate font-mono text-[0.65rem] text-ink/40" title={path}>
          {path}
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
