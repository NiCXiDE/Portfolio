import { getDataSource } from "@/db/data-source";
import {
  GraphicItemEntity,
  InboxItemEntity,
  TestimonialEntity,
  UiProjectEntity,
} from "@/db/entities";
import { isR2Configured } from "@/lib/r2";
import { DashboardInbox } from "@/components/admin/DashboardInbox";
import { DashboardKpiGrid } from "@/components/admin/DashboardKpiGrid";
import { migrateGraphicPendingToInbox } from "@/lib/inbox";
import { mediaUrl } from "@/lib/media";
import Link from "next/link";

const THUMB_LIMIT = 32;

export default async function AdminDashboard() {
  await migrateGraphicPendingToInbox();
  const ds = await getDataSource();

  const [allGraphics, inboxRows, inboxCount, hiddenTestimonials, projects] =
    await Promise.all([
      ds.getRepository(GraphicItemEntity).find({
        order: { sortOrder: "ASC" },
      }),
      ds.getRepository(InboxItemEntity).find({
        order: { createdAt: "DESC" },
        take: THUMB_LIMIT,
      }),
      ds.getRepository(InboxItemEntity).count(),
      ds.getRepository(TestimonialEntity).find({
        where: { hidden: true },
        order: { sortOrder: "ASC" },
        take: THUMB_LIMIT,
      }),
      ds.getRepository(UiProjectEntity).find({
        order: { sortOrder: "ASC" },
      }),
    ]);

  const graphics = allGraphics.filter((g) => g.section !== "pending");
  const unpublishedUi = projects.filter((p) => !p.published);
  const graphicThumbs = graphics
    .slice(0, THUMB_LIMIT)
    .map((r) => mediaUrl(r.srcPath))
    .filter(Boolean);
  const projectThumbs = projects
    .slice(0, THUMB_LIMIT)
    .map((p) => (p.images[0] ? mediaUrl(p.images[0]) : ""))
    .filter(Boolean);

  const hiddenThumbs = [
    ...inboxRows.map((r) => mediaUrl(r.path)),
    ...hiddenTestimonials.map((t) => mediaUrl(t.imagePath)),
    ...unpublishedUi
      .map((p) => (p.images[0] ? mediaUrl(p.images[0]) : ""))
      .filter(Boolean),
  ]
    .filter(Boolean)
    .slice(0, THUMB_LIMIT);

  const hiddenCount =
    inboxCount + hiddenTestimonials.length + unpublishedUi.length;

  const cards = [
    {
      id: "graphics",
      label: "Piezas gráficas",
      count: graphics.length,
      href: "/admin/graphic",
      thumbs: graphicThumbs,
    },
    {
      id: "pending-hidden",
      label: "Ocultos",
      count: hiddenCount,
      href: "/admin/pending",
      thumbs: hiddenThumbs,
    },
    {
      id: "ui-projects",
      label: "Proyectos UI",
      count: projects.length,
      href: "/admin/interfaces/projects",
      thumbs: projectThumbs,
    },
  ];

  return (
    <div>
      <h1 className="font-admin-title text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-ink/70">
        Centro de control del contenido del portfolio.
      </p>

      <DashboardKpiGrid cards={cards} />

      <DashboardInbox
        pendingCount={inboxCount}
        hiddenExtras={hiddenTestimonials.length + unpublishedUi.length}
      />

      <div className="mt-8 space-y-2 text-sm">
        <p>
          R2 uploads:{" "}
          {isR2Configured() ? (
            <span className="text-green-700">configurado</span>
          ) : (
            <span className="text-amber-700">
              pendiente — completá variables en `.env`
            </span>
          )}
        </p>
        <p>
          Atajos:{" "}
          <Link href="/admin/pending" className="underline">
            ocultos
          </Link>
          {" · "}
          <Link href="/admin/media" className="underline">
            biblioteca de archivos
          </Link>
          {" · "}
          <Link href="/admin/settings" className="underline">
            footer / timings
          </Link>
        </p>
      </div>
    </div>
  );
}
