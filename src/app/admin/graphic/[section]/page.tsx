import { notFound, redirect } from "next/navigation";
import { getDataSource } from "@/db/data-source";
import {
  BrandEntity,
  GraphicItemEntity,
  MediaAssetEntity,
  TagEntity,
  type GraphicSection,
} from "@/db/entities";
import { GraphicSectionClient } from "@/components/admin/GraphicSectionClient";
import { getSession, isGuestSession } from "@/lib/admin-auth";
import { mediaUrl } from "@/lib/media";

const VALID: GraphicSection[] = [
  "covers",
  "logos",
  "personal",
  "pending",
  "illustration",
  "banners",
  "eventos",
];

export default async function AdminGraphicSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { section: raw } = await params;
  const { saved } = await searchParams;
  if (!VALID.includes(raw as GraphicSection)) notFound();
  const section = raw as GraphicSection;

  if (section === "pending") {
    redirect("/admin/pending");
  }

  const guest = isGuestSession(await getSession());
  const ds = await getDataSource();
  const [items, tags, assets, brands] = await Promise.all([
    ds.getRepository(GraphicItemEntity).find({
      where: guest ? { section, published: true } : { section },
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(TagEntity).find({ order: { sortOrder: "ASC" } }),
    ds.getRepository(MediaAssetEntity).find(),
    ds.getRepository(BrandEntity).find({
      where: { published: true },
      order: { name: "ASC" },
    }),
  ]);

  const assetsById = Object.fromEntries(assets.map((a) => [a.id, a]));
  const assetsByPath = Object.fromEntries(assets.map((a) => [a.path, a]));

  return (
    <GraphicSectionClient
      section={section}
      saved={saved}
      tagSlugs={tags.map((t) => t.slug)}
      library={assets.map((a) => ({
        id: a.id,
        path: a.path,
        originalName: a.originalName,
      }))}
      brands={brands.map((b) => ({
        id: b.id,
        name: b.name,
        logo: b.logoPath ? mediaUrl(b.logoPath) : null,
        logoPath: b.logoPath,
        href: b.href,
      }))}
      items={items.map((item) => {
        const asset =
          (item.srcAssetId ? assetsById[item.srcAssetId] : null) ??
          assetsByPath[item.srcPath] ??
          null;
        return {
          id: item.id,
          srcPath: item.srcPath,
          srcAssetId: item.srcAssetId,
          alt: item.alt,
          title: item.title,
          year: item.year,
          detail: item.detail,
          href: item.href,
          hrefLabel: item.hrefLabel,
          tags: item.tags,
          fit: item.fit,
          relatedSrcPath: item.relatedSrcPath,
          relatedAssetId: item.relatedAssetId,
          galleryPaths: item.galleryPaths,
          brandId: item.brandId ?? null,
          sortOrder: item.sortOrder,
          published: item.published,
          assetMeta: asset
            ? {
                originalName: asset.originalName,
                mime: asset.mime,
                width: asset.width,
                height: asset.height,
              }
            : null,
        };
      })}
    />
  );
}
