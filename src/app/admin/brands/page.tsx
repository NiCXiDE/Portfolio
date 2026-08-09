import { getDataSource } from "@/db/data-source";
import { BrandEntity } from "@/db/entities";
import { BrandsClient } from "@/components/admin/BrandsClient";

export default async function AdminBrandsPage() {
  const ds = await getDataSource();
  const brands = await ds.getRepository(BrandEntity).find({
    order: { sortOrder: "ASC", name: "ASC" },
  });

  return (
    <div>
      <h1 className="font-admin-title text-3xl">Marcas / empresas</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Fuente única de nombre, logo y web. Reutilizalas en listas, testimonios
        y menciones <span className="font-mono">@id</span> en textos.
      </p>
      <div className="mt-8">
        <BrandsClient
          brands={brands.map((b) => ({
            id: b.id,
            name: b.name,
            logoPath: b.logoPath,
            href: b.href,
            sortOrder: b.sortOrder,
            published: b.published,
          }))}
        />
      </div>
    </div>
  );
}
