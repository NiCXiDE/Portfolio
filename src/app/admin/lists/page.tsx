import { getDataSource } from "@/db/data-source";
import { NamedListItemEntity, SiteSettingsEntity } from "@/db/entities";
import { ListsClient } from "@/components/admin/ListsClient";
import {
  normalizeHomeLayout,
  type HomeLayoutConfig,
} from "@/lib/home-layout";

function mapItem(i: {
  id: number;
  label: string;
  logoPath: string | null;
  createdAt?: Date | string | null;
}) {
  return {
    id: i.id,
    label: i.label,
    logoPath: i.logoPath,
    createdAt:
      i.createdAt instanceof Date
        ? i.createdAt.toISOString()
        : i.createdAt
          ? String(i.createdAt)
          : null,
  };
}

export default async function AdminListsPage() {
  const ds = await getDataSource();
  const [items, settings] = await Promise.all([
    ds.getRepository(NamedListItemEntity).find({
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(SiteSettingsEntity).findOneByOrFail({ id: "main" }),
  ]);

  const layout = normalizeHomeLayout(
    settings.homeLayout as HomeLayoutConfig | null,
  );

  const byKind = {
    company: items.filter((i) => i.kind === "company").map(mapItem),
    past_project: items.filter((i) => i.kind === "past_project").map(mapItem),
    current_project: items
      .filter((i) => i.kind === "current_project")
      .map(mapItem),
  };

  return (
    <div>
      <h1 className="font-admin-title text-3xl">Listas (scroll infinito)</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Marquees con texto, logos o ambos. Reordená por arrastre, ordená por
        fecha o alfabeto, y revisá ítems incompletos antes de guardar.
      </p>
      <div className="mt-8">
        <ListsClient initialLayout={layout} lists={byKind} />
      </div>
    </div>
  );
}
