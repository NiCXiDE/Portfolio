import { getDataSource } from "@/db/data-source";
import { TagEntity } from "@/db/entities";
import { deleteTag, saveTag } from "@/app/admin/actions";
import { WithTagPreview } from "@/components/admin/WithPreview";

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const tags = await ds.getRepository(TagEntity).find({
    order: { sortOrder: "ASC" },
  });

  return (
    <div>
      <h1 className="font-admin-title text-3xl">Etiquetas</h1>
      {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}
      <p className="mt-2 text-sm text-ink/70">
        Marcá NSFW para aplicar blur en el portfolio.
      </p>

      <div className="mt-6 border border-ink/15 p-4">
        <WithTagPreview>
          <form action={saveTag} className="grid gap-3 sm:grid-cols-2">
            <input
              name="slug"
              placeholder="slug (ej. nsfw)"
              required
              className="border border-ink/20 px-3 py-2 text-sm sm:col-span-2"
            />
            <input
              name="labelEs"
              placeholder="Label ES"
              className="border border-ink/20 px-3 py-2 text-sm"
            />
            <input
              name="labelEn"
              placeholder="Label EN"
              className="border border-ink/20 px-3 py-2 text-sm"
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="isNsfw" />
              NSFW
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              Orden
              <input
                type="number"
                name="sortOrder"
                defaultValue={tags.length}
                className="w-20 border border-ink/20 px-2 py-1"
              />
            </label>
            <button
              type="submit"
              className="bg-ink px-3 py-2 text-sm text-sky-pale sm:col-span-2 sm:w-fit"
            >
              Crear / actualizar
            </button>
          </form>
        </WithTagPreview>
      </div>

      <ul className="mt-8 space-y-3">
        {tags.map((tag) => (
          <li
            key={tag.slug}
            className="border border-ink/10 px-3 py-3"
          >
            <WithTagPreview
              initialDraft={{
                slug: tag.slug,
                labelEs: tag.labelEs,
                labelEn: tag.labelEn,
                isNsfw: tag.isNsfw,
              }}
            >
              <form action={saveTag} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="slug" value={tag.slug} />
                <p className="text-xs text-ink/50 sm:col-span-2">{tag.slug}</p>
                <input
                  name="labelEs"
                  defaultValue={tag.labelEs}
                  placeholder="Label ES"
                  className="border border-ink/20 px-3 py-2 text-sm"
                />
                <input
                  name="labelEn"
                  defaultValue={tag.labelEn}
                  placeholder="Label EN"
                  className="border border-ink/20 px-3 py-2 text-sm"
                />
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isNsfw"
                    defaultChecked={tag.isNsfw}
                  />
                  NSFW
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  Orden
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={tag.sortOrder}
                    className="w-20 border border-ink/20 px-2 py-1"
                  />
                </label>
                <button
                  type="submit"
                  className="bg-ink px-3 py-2 text-sm text-sky-pale sm:w-fit"
                >
                  Guardar
                </button>
              </form>
            </WithTagPreview>
            <form action={deleteTag} className="mt-2">
              <input type="hidden" name="slug" value={tag.slug} />
              <button type="submit" className="text-sm text-red-700 underline">
                Eliminar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
