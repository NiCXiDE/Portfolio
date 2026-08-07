import { getDataSource } from "@/db/data-source";
import { TestimonialEntity } from "@/db/entities";
import { TestimonialsClient } from "@/components/admin/TestimonialsClient";

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const items = await ds.getRepository(TestimonialEntity).find({
    order: { sortOrder: "ASC" },
  });

  return (
    <TestimonialsClient
      saved={saved}
      items={items.map((item) => ({
        id: item.id,
        name: item.name,
        imagePath: item.imagePath,
        quote: item.quote,
        role: item.role,
        companyName: item.companyName,
        companyLogoPath: item.companyLogoPath,
        companyHref: item.companyHref,
        linkLabel: item.linkLabel,
        hidden: item.hidden,
        sortOrder: item.sortOrder,
      }))}
    />
  );
}
