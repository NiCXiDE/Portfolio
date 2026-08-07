import Link from "next/link";
import { getDataSource } from "@/db/data-source";
import {
  GraphicItemEntity,
  TestimonialEntity,
  UiProjectEntity,
} from "@/db/entities";
import { isR2Configured } from "@/lib/r2";

export default async function AdminDashboard() {
  const ds = await getDataSource();
  const [graphics, pending, hiddenTestimonials, projects] = await Promise.all([
    ds.getRepository(GraphicItemEntity).count(),
    ds.getRepository(GraphicItemEntity).count({
      where: { section: "pending" },
    }),
    ds.getRepository(TestimonialEntity).count({ where: { hidden: true } }),
    ds.getRepository(UiProjectEntity).count(),
  ]);

  const cards = [
    { label: "Piezas gráficas", value: graphics },
    { label: "Pendientes (ocultos público)", value: pending },
    { label: "Testimonios ocultos", value: hiddenTestimonials },
    { label: "Proyectos UI", value: projects },
  ];

  return (
    <div>
      <h1 className="font-bigger text-3xl uppercase tracking-wide">Dashboard</h1>
      <p className="mt-2 text-sm text-ink/70">
        Centro de control del contenido del portfolio.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.label} className="bg-sky-pale px-4 py-5">
            <p className="text-xs uppercase tracking-wide text-ink/50">
              {c.label}
            </p>
            <p className="mt-1 text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
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
          <Link href="/admin/graphic/pending" className="underline">
            pendientes
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
