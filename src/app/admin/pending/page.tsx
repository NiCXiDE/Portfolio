import { getDataSource } from "@/db/data-source";
import { TestimonialEntity, UiProjectEntity } from "@/db/entities";
import { PendingInboxClient } from "@/components/admin/PendingInboxClient";
import {
  listInboxItems,
  migrateGraphicPendingToInbox,
} from "@/lib/inbox";
import { mediaUrl } from "@/lib/media";
import { t } from "@/lib/content";

export default async function AdminPendingPage() {
  await migrateGraphicPendingToInbox();
  const ds = await getDataSource();
  const [items, hiddenTestimonials, draftProjects] = await Promise.all([
    listInboxItems(),
    ds.getRepository(TestimonialEntity).find({
      where: { hidden: true },
      order: { sortOrder: "ASC" },
    }),
    ds.getRepository(UiProjectEntity).find({
      where: { published: false },
      order: { sortOrder: "ASC" },
    }),
  ]);

  const hiddenItems = [
    ...hiddenTestimonials.map((row) => ({
      id: row.id,
      kind: "testimonial" as const,
      label: row.name,
      image: mediaUrl(row.imagePath),
      href: "/admin/testimonials",
    })),
    ...draftProjects.map((row) => ({
      id: row.id,
      kind: "ui_project" as const,
      label: t(row.title, "es") || row.id,
      image: row.images[0] ? mediaUrl(row.images[0]) : null,
      href: "/admin/interfaces/projects",
    })),
  ];

  return (
    <PendingInboxClient
      items={items.map((item) => ({
        id: item.id,
        path: item.path,
        originalName: item.originalName,
        mime: item.mime,
        width: item.width,
        height: item.height,
      }))}
      hiddenItems={hiddenItems}
    />
  );
}
