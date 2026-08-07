import { getDataSource } from "@/db/data-source";
import { NamedListItemEntity, type NamedListKind } from "@/db/entities";
import { saveNamedList } from "@/app/admin/actions";
import { WithNamedListPreview } from "@/components/admin/WithPreview";

const KINDS: { kind: NamedListKind; title: string }[] = [
  { kind: "company", title: "Empresas / instituciones" },
  { kind: "past_project", title: "Proyectos pasados" },
  { kind: "current_project", title: "Proyectos actuales" },
];

export default async function AdminListsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const items = await ds.getRepository(NamedListItemEntity).find({
    order: { sortOrder: "ASC" },
  });

  return (
    <div>
      <h1 className="font-bigger text-3xl uppercase">Listas (TagCloud)</h1>
      {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}
      <p className="mt-2 text-sm text-ink/70">
        Una etiqueta por línea. El orden de las líneas es el orden en el sitio.
      </p>
      <div className="mt-8 space-y-10">
        {KINDS.map(({ kind, title }) => {
          const lines = items
            .filter((i) => i.kind === kind)
            .map((i) => i.label)
            .join("\n");
          return (
            <div key={kind}>
              <h2 className="mb-3 text-lg font-bold">{title}</h2>
              <WithNamedListPreview>
                <form action={saveNamedList} className="space-y-3">
                  <input type="hidden" name="kind" value={kind} />
                  <textarea
                    name="items"
                    defaultValue={lines}
                    rows={8}
                    className="w-full border border-ink/20 px-3 py-2 font-mono text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-ink px-4 py-2 text-sm text-sky-pale"
                  >
                    Guardar {title}
                  </button>
                </form>
              </WithNamedListPreview>
            </div>
          );
        })}
      </div>
    </div>
  );
}
