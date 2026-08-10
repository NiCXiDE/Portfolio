import { getDataSource } from "@/db/data-source";
import {
  AdminAuditLogEntity,
  type AdminAuditLogRow,
} from "@/db/entities";
import { undoAdminChange } from "@/app/admin/actions";
import {
  ACTION_LABELS,
  ENTITY_LABELS,
  isLatestAudit,
} from "@/lib/audit";
import { getSession, isGuestSession } from "@/lib/admin-auth";
import { Undo2 } from "lucide-react";

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (isGuestSession(session)) {
    return (
      <div>
        <h1 className="font-admin-title text-3xl">Auditoría</h1>
        <p className="mt-2 text-sm text-ink/70">
          El historial de cambios no está disponible en modo visitante.
        </p>
      </div>
    );
  }

  const { page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw ?? 1) || 1);
  const pageSize = 40;
  const ds = await getDataSource();
  const repo = ds.getRepository(AdminAuditLogEntity);

  const [total, logs] = await Promise.all([
    repo.count(),
    repo.find({
      order: { createdAt: "DESC" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const latestFlags = await Promise.all(
    logs.map(async (log) => ({
      id: log.id,
      canUndo: await isLatestAudit(log),
    })),
  );
  const canUndoById = new Map(latestFlags.map((f) => [f.id, f.canUndo]));

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className="font-admin-title text-3xl">Auditoría</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Historial de cambios del panel. Pensado para varias personas
        administrando el sitio: quién tocó qué y cuándo, con opción de
        deshacer el último cambio de cada ítem.
      </p>

      <p className="mt-4 text-xs text-ink/50">
        {total} evento{total === 1 ? "" : "s"}
      </p>

      <div className="mt-6 space-y-3">
        {logs.length === 0 ? (
          <p className="border border-ink/10 bg-white p-6 text-sm text-ink/55">
            Todavía no hay cambios registrados.
          </p>
        ) : (
          logs.map((log) => (
            <AuditRow
              key={log.id}
              log={log}
              canUndo={Boolean(canUndoById.get(log.id))}
            />
          ))
        )}
      </div>

      {pages > 1 ? (
        <div className="mt-8 flex items-center gap-3 text-sm">
          {page > 1 ? (
            <a
              href={`/admin/audit?page=${page - 1}`}
              className="underline underline-offset-2"
            >
              Anterior
            </a>
          ) : null}
          <span className="text-ink/55">
            Página {page} / {pages}
          </span>
          {page < pages ? (
            <a
              href={`/admin/audit?page=${page + 1}`}
              className="underline underline-offset-2"
            >
              Siguiente
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AuditRow({
  log,
  canUndo,
}: {
  log: AdminAuditLogRow;
  canUndo: boolean;
}) {
  const undone = Boolean(log.undoneAt);

  return (
    <article
      className={`border border-ink/10 bg-white p-4 ${
        undone ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-ink">{log.summary}</p>
          <p className="text-xs text-ink/55">
            <span className="font-medium text-ink/70">{log.username}</span>
            {" · "}
            {ACTION_LABELS[log.action]} {ENTITY_LABELS[log.entityType]}
            {" · "}
            <span className="font-mono">{log.entityId}</span>
            {" · "}
            {formatWhen(new Date(log.createdAt))}
            {undone ? " · deshecho" : null}
          </p>
        </div>
        {canUndo ? (
          <form action={undoAdminChange}>
            <input type="hidden" name="auditId" value={log.id} />
            <input type="hidden" name="redirectTo" value="/admin/audit" />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 border border-ink/20 px-2.5 py-1.5 text-xs text-ink hover:bg-sky-pale"
            >
              <Undo2 className="size-3.5" strokeWidth={1.75} />
              Deshacer
            </button>
          </form>
        ) : null}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-ink/50 hover:text-ink">
          Ver snapshot
        </summary>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <pre className="overflow-auto bg-sky-pale/60 p-2 text-[10px] leading-relaxed text-ink/80">
            {JSON.stringify(log.beforeJson, null, 2) ?? "null"}
          </pre>
          <pre className="overflow-auto bg-sky-pale/60 p-2 text-[10px] leading-relaxed text-ink/80">
            {JSON.stringify(log.afterJson, null, 2) ?? "null"}
          </pre>
        </div>
      </details>
    </article>
  );
}
