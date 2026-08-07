import { getDataSource } from "@/db/data-source";
import { UiListItemEntity, UiProjectEntity } from "@/db/entities";
import { InterfacesClient } from "@/components/admin/InterfacesClient";

export default async function AdminInterfacesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const [projects, list] = await Promise.all([
    ds.getRepository(UiProjectEntity).find({ order: { sortOrder: "ASC" } }),
    ds.getRepository(UiListItemEntity).find({ order: { sortOrder: "ASC" } }),
  ]);

  return (
    <InterfacesClient
      saved={saved}
      projects={projects.map((p) => ({
        id: p.id,
        category: p.category,
        title: p.title,
        meta: p.meta,
        images: p.images,
        prototypeUrl: p.prototypeUrl,
        sortOrder: p.sortOrder,
        published: p.published,
      }))}
      list={list.map((item) => ({
        id: item.id,
        title: item.title,
        logoPath: item.logoPath,
        caption: item.caption,
        wordmark: item.wordmark,
        sortOrder: item.sortOrder,
        published: item.published,
      }))}
    />
  );
}
