import { getDataSource } from "@/db/data-source";
import { UiListItemEntity } from "@/db/entities";
import { InterfacesListClient } from "@/components/admin/InterfacesClient";

export default async function AdminInterfacesListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const list = await ds.getRepository(UiListItemEntity).find({
    order: { sortOrder: "ASC" },
  });

  return (
    <InterfacesListClient
      saved={saved}
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
