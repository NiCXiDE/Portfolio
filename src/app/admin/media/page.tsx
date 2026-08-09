import { isR2Configured, listR2Prefix } from "@/lib/r2";
import { uploadMedia } from "@/app/admin/actions";
import { ImageDropField } from "@/components/admin/ImageDropField";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; path?: string }>;
}) {
  const { saved, error, path } = await searchParams;
  const configured = isR2Configured();
  let objects: { key: string; size: number; path: string }[] = [];
  let listError: string | null = null;

  if (configured) {
    try {
      objects = await listR2Prefix("assets/", 50);
    } catch (e) {
      listError = e instanceof Error ? e.message : "Error listando R2";
    }
  }

  return (
    <div>
      <h1 className="font-admin-title text-3xl">Archivos</h1>
      <p className="mt-2 text-sm text-ink/70">
        En cada sección del admin podés arrastrar imágenes directo al form.
        Acá también podés subir a la carpeta local{" "}
        <code className="text-xs">public/assets/uploads</code>.
      </p>

      <div className="mt-8 max-w-md border border-ink/10 p-4">
        <ImageDropField
          label="Subir a assets/uploads"
          folder="assets/uploads"
          hint="Se guarda en el disco local del proyecto."
        />
      </div>

      <h2 className="mt-12 text-lg font-bold">Cloudflare R2 (opcional)</h2>
      {!configured ? (
        <p className="mt-2 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
          R2 no configurado. Completá las variables `R2_*` en `.env` cuando
          quieras publicar assets en la nube.
        </p>
      ) : (
        <p className="mt-2 text-sm text-green-700">R2 conectado.</p>
      )}
      {error === "r2" ? (
        <p className="mt-2 text-sm text-red-700">R2 no disponible.</p>
      ) : null}
      {error === "file" ? (
        <p className="mt-2 text-sm text-red-700">Elegí un archivo.</p>
      ) : null}
      {saved && path ? (
        <p className="mt-2 text-sm text-green-700">
          Subido a R2: <code>{path}</code>
        </p>
      ) : null}

      <form action={uploadMedia} className="mt-6 space-y-3">
        <label className="block text-sm">
          Prefijo key
          <input
            name="keyPrefix"
            defaultValue="assets/uploads"
            className="mt-1 w-full border border-ink/20 px-3 py-2"
            disabled={!configured}
          />
        </label>
        <input
          type="file"
          name="file"
          required
          disabled={!configured}
          className="block w-full text-sm"
        />
        <button
          type="submit"
          disabled={!configured}
          className="bg-ink px-4 py-2 text-sm text-sky-pale disabled:opacity-40"
        >
          Subir a R2
        </button>
      </form>

      {listError ? (
        <p className="mt-6 text-sm text-red-700">{listError}</p>
      ) : null}
      {objects.length > 0 ? (
        <ul className="mt-8 space-y-1 font-mono text-xs">
          {objects.map((o) => (
            <li key={o.key}>
              {o.path}{" "}
              <span className="text-ink/40">({o.size} B)</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
