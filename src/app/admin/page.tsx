import { getDataSource } from "@/db/data-source";
import {
  GraphicItemEntity,
  InboxItemEntity,
  TestimonialEntity,
  UiProjectEntity,
} from "@/db/entities";
import { isR2Configured } from "@/lib/r2";
import { getSession, isGuestSession } from "@/lib/admin-auth";
import { DashboardInbox } from "@/components/admin/DashboardInbox";
import { DashboardKpiGrid } from "@/components/admin/DashboardKpiGrid";
import { migrateGraphicPendingToInbox } from "@/lib/inbox";
import { mediaUrl } from "@/lib/media";
import { normalizeUiSlides } from "@/lib/ui-slides";
import Link from "next/link";

const THUMB_LIMIT = 32;

export default async function AdminDashboard() {
  const session = await getSession();
  const guest = isGuestSession(session);

  if (!guest) {
    await migrateGraphicPendingToInbox();
  }

  const ds = await getDataSource();

  const [allGraphics, inboxRows, inboxCount, hiddenTestimonials, projects] =
    await Promise.all([
      ds.getRepository(GraphicItemEntity).find({
        order: { sortOrder: "ASC" },
      }),
      guest
        ? Promise.resolve([])
        : ds.getRepository(InboxItemEntity).find({
            order: { createdAt: "DESC" },
            take: THUMB_LIMIT,
          }),
      guest ? Promise.resolve(0) : ds.getRepository(InboxItemEntity).count(),
      guest
        ? Promise.resolve([])
        : ds.getRepository(TestimonialEntity).find({
            where: { hidden: true },
            order: { sortOrder: "ASC" },
            take: THUMB_LIMIT,
          }),
      ds.getRepository(UiProjectEntity).find({
        order: { sortOrder: "ASC" },
      }),
    ]);

  const graphics = allGraphics.filter((g) => {
    if (g.section === "pending") return false;
    if (guest && !g.published) return false;
    return true;
  });

  const visibleProjects = guest
    ? projects.filter((p) => p.published)
    : projects;
  const unpublishedUi = guest ? [] : projects.filter((p) => !p.published);

  const graphicThumbs = graphics
    .slice(0, THUMB_LIMIT)
    .map((r) => mediaUrl(r.srcPath))
    .filter(Boolean);
  const projectThumbs = visibleProjects
    .slice(0, THUMB_LIMIT)
    .map((p) => {
      const first = normalizeUiSlides(p.images)[0];
      return first ? mediaUrl(first.src) : "";
    })
    .filter(Boolean);

  const hiddenThumbs = guest
    ? []
    : [
        ...inboxRows.map((r) => mediaUrl(r.path)),
        ...hiddenTestimonials.map((t) => mediaUrl(t.imagePath)),
        ...unpublishedUi
          .map((p) => {
            const first = normalizeUiSlides(p.images)[0];
            return first ? mediaUrl(first.src) : "";
          })
          .filter(Boolean),
      ]
        .filter(Boolean)
        .slice(0, THUMB_LIMIT);

  const hiddenCount = guest
    ? 0
    : inboxCount + hiddenTestimonials.length + unpublishedUi.length;

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
      count: visibleProjects.length,
      href: "/admin/interfaces/projects",
      thumbs: projectThumbs,
    },
  ];

  return (
    <div>
      <h1 className="font-admin-title text-3xl" data-tour="dashboard-title">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        Centro de control del contenido del portfolio.
      </p>

      <div data-tour="dashboard-kpis">
        <DashboardKpiGrid cards={cards} />
      </div>

      <div data-tour="dashboard-inbox">
        <DashboardInbox
          pendingCount={guest ? 0 : inboxCount}
          hiddenExtras={
            guest ? 0 : hiddenTestimonials.length + unpublishedUi.length
          }
          readOnly={guest}
        />
      </div>

      <div className="mt-8 space-y-2 text-sm">
        {!guest ? (
          <p>
            R2 uploads:{" "}
            {isR2Configured() ? (
              <span className="text-green-700">configurado</span>
            ) : (
              <span className="text-amber-700">
                pendiente — almacenamiento no configurado
              </span>
            )}
          </p>
        ) : null}
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
