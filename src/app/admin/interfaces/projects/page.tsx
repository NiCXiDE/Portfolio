import { getDataSource } from "@/db/data-source";
import { BrandEntity, UiProjectEntity } from "@/db/entities";
import { InterfacesProjectsClient } from "@/components/admin/InterfacesClient";
import { getSession, isGuestSession } from "@/lib/admin-auth";
import { mediaUrl } from "@/lib/media";

export default async function AdminInterfacesProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const guest = isGuestSession(await getSession());
  const ds = await getDataSource();
  const [projects, brands] = await Promise.all([
    ds.getRepository(UiProjectEntity).find({
      ...(guest ? { where: { published: true } } : {}),
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(BrandEntity).find({
      where: { published: true },
      order: { name: "ASC" },
    }),
  ]);

  return (
    <InterfacesProjectsClient
      saved={saved}
      brands={brands.map((b) => ({
        id: b.id,
        name: b.name,
        logo: b.logoPath ? mediaUrl(b.logoPath) : null,
        logoPath: b.logoPath,
        href: b.href,
      }))}
      projects={projects.map((p) => ({
        id: p.id,
        category: p.category,
        title: p.title,
        meta: p.meta,
        images: p.images,
        prototypeUrl: p.prototypeUrl,
        summary: p.summary,
        client: p.client,
        period: p.period,
        duration: p.duration,
        ctaKind: p.ctaKind,
        sortOrder: p.sortOrder,
        published: p.published,
      }))}
    />
  );
}
