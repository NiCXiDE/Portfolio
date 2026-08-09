import { getDataSource } from "@/db/data-source";
import { UiProjectEntity } from "@/db/entities";
import { InterfacesProjectsClient } from "@/components/admin/InterfacesClient";

export default async function AdminInterfacesProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const projects = await ds.getRepository(UiProjectEntity).find({
    order: { sortOrder: "ASC" },
  });

  return (
    <InterfacesProjectsClient
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
    />
  );
}
