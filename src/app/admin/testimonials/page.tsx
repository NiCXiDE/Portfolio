import { getDataSource } from "@/db/data-source";
import { BrandEntity, TestimonialEntity } from "@/db/entities";
import { TestimonialsClient } from "@/components/admin/TestimonialsClient";
import { getSession, isGuestSession } from "@/lib/admin-auth";
import { mediaUrl } from "@/lib/media";

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const guest = isGuestSession(await getSession());
  const ds = await getDataSource();
  const [items, brands] = await Promise.all([
    ds.getRepository(TestimonialEntity).find({
      ...(guest ? { where: { hidden: false } } : {}),
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(BrandEntity).find({
      where: { published: true },
      order: { name: "ASC" },
    }),
  ]);

  return (
    <TestimonialsClient
      saved={saved}
      brands={brands.map((b) => ({
        id: b.id,
        name: b.name,
        logo: b.logoPath ? mediaUrl(b.logoPath) : null,
        logoPath: b.logoPath,
        href: b.href,
      }))}
      items={items.map((item) => ({
        id: item.id,
        name: item.name,
        imagePath: item.imagePath,
        quote: item.quote,
        role: item.role,
        companyName: item.companyName,
        companyLogoPath: item.companyLogoPath,
        companyHref: item.companyHref,
        companyBrandId: item.companyBrandId,
        linkLabel: item.linkLabel,
        hidden: item.hidden,
        sortOrder: item.sortOrder,
      }))}
    />
  );
}
