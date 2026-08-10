"use client";

import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadLocalAsset } from "@/app/admin/upload-local";
import { enqueueInboxItem } from "@/app/admin/actions";
import { pushAdminToast } from "@/lib/admin-toast";

async function readImageSize(
  file: File,
): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/") || file.type.includes("svg")) {
    return null;
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function DashboardInbox({
  pendingCount,
  hiddenExtras = 0,
  readOnly = false,
}: {
  pendingCount: number;
  /** Testimonios ocultos + UI sin publicar, etc. */
  hiddenExtras?: number;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | File[] | null) {
    if (readOnly || !files?.length) return;
    setBusy(true);
    setError(null);
    let okCount = 0;
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const size = await readImageSize(file);
        const fd = new FormData();
        fd.set("file", file);
        fd.set("folder", "assets/grafico/pending");
        if (size) {
          fd.set("width", String(size.width));
          fd.set("height", String(size.height));
        }
        const up = await uploadLocalAsset(fd);
        if (!up.ok) {
          setError(up.error);
          break;
        }
        const enqueueFd = new FormData();
        enqueueFd.set("path", up.path);
        enqueueFd.set("assetId", up.assetId);
        enqueueFd.set("originalName", file.name);
        const res = await enqueueInboxItem(enqueueFd);
        if (!res.ok) {
          setError(res.error);
          break;
        }
        okCount += 1;
      }
      if (okCount) {
        pushAdminToast({
          message:
            okCount === 1
              ? "1 pieza en pendientes"
              : `${okCount} piezas en pendientes`,
        });
        router.refresh();
      }
    } catch {
      setError("No se pudo subir.");
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void handleFiles(e.dataTransfer.files);
  }

  return (
    <section className="mt-8 border border-ink/10 p-4">
      <h2 className="text-lg font-bold">Bandeja gráfica</h2>
      <p className="mt-1 text-sm text-ink/65">
        {readOnly
          ? "En modo visitante la bandeja es solo informativa: no se pueden subir ni clasificar archivos."
          : `Soltá piezas acá para encolarlas en la bandeja (después las clasificás). Ahora hay ${pendingCount} en cola${
              hiddenExtras > 0
                ? ` y ${hiddenExtras} oculto${hiddenExtras === 1 ? "" : "s"} en el sitio`
                : ""
            }.`}
      </p>
      {readOnly ? (
        <div className="mt-4 flex min-h-[8rem] flex-col items-center justify-center gap-2 border border-dashed border-ink/20 bg-sky-pale/30 px-4 py-6 text-center text-sm text-ink/50">
          Vista de solo lectura
        </div>
      ) : (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-4 flex min-h-[8rem] flex-col items-center justify-center gap-2 border border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? "border-ink bg-sky-pale"
            : "border-ink/25 bg-white hover:border-ink/40"
        }`}
      >
        {busy ? (
          <Loader2 className="size-6 animate-spin text-ink/45" />
        ) : (
          <>
            <ImagePlus className="size-7 text-ink/35" strokeWidth={1.5} />
            <p className="text-sm text-ink/60">
              Arrastrá una o varias imágenes
            </p>
            <label className="cursor-pointer bg-ink px-3 py-1.5 text-xs text-sky-pale">
              Elegir archivos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  void handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </>
        )}
      </div>
      )}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
