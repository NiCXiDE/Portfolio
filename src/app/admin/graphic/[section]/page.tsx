import { notFound } from "next/navigation";
import { getDataSource } from "@/db/data-source";
import {
  GraphicItemEntity,
  TagEntity,
  type GraphicSection,
} from "@/db/entities";
import { GraphicSectionClient } from "@/components/admin/GraphicSectionClient";

const VALID: GraphicSection[] = [
  "covers",
  "logos",
  "personal",
  "pending",
  "illustration",
  "banners",
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

  const ds = await getDataSource();
  const [items, tags] = await Promise.all([
    ds.getRepository(GraphicItemEntity).find({
      where: { section },
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(TagEntity).find({ order: { sortOrder: "ASC" } }),
  ]);

  return (
    <GraphicSectionClient
      section={section}
      saved={saved}
      tagSlugs={tags.map((t) => t.slug)}
      items={items.map((item) => ({
        id: item.id,
        srcPath: item.srcPath,
        alt: item.alt,
        title: item.title,
        year: item.year,
        detail: item.detail,
        href: item.href,
        hrefLabel: item.hrefLabel,
        tags: item.tags,
        fit: item.fit,
        relatedSrcPath: item.relatedSrcPath,
        sortOrder: item.sortOrder,
        published: item.published,
      }))}
    />
  );
}
