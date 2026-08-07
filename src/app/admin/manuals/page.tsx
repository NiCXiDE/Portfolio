import { getDataSource } from "@/db/data-source";
import { BrandManualEntity } from "@/db/entities";
import { ManualsClient } from "@/components/admin/ManualsClient";

export default async function AdminManualsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const items = await ds.getRepository(BrandManualEntity).find({
    order: { sortOrder: "ASC" },
  });

  return (
    <ManualsClient
      saved={saved}
      items={items.map((item) => ({
        id: item.id,
        coverPath: item.coverPath,
        pdfPath: item.pdfPath,
        title: item.title,
        year: item.year,
        meta: item.meta,
        sortOrder: item.sortOrder,
        published: item.published,
      }))}
    />
  );
}
