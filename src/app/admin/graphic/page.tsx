import Link from "next/link";
import {
  Image as ImageIcon,
  Layers,
  Palette,
  RectangleHorizontal,
  Sparkles,
  Clock,
} from "lucide-react";
import type { GraphicSection } from "@/db/entities";

const SECTIONS: {
  id: GraphicSection;
  label: string;
  hint: string;
  icon: typeof ImageIcon;
}[] = [
  {
    id: "covers",
    label: "Portadas",
    hint: "Covers de discos / releases",
    icon: ImageIcon,
  },
  {
    id: "logos",
    label: "Logos",
    hint: "Identidades y wordmarks",
    icon: Sparkles,
  },
  {
    id: "personal",
    label: "Personales",
    hint: "Trabajos personales",
    icon: Palette,
  },
  {
    id: "illustration",
    label: "Ilustración",
    hint: "Piezas ilustradas",
    icon: Layers,
  },
  {
    id: "banners",
    label: "Banners",
    hint: "Banners y piezas largas",
    icon: RectangleHorizontal,
  },
  {
    id: "pending",
    label: "Pendientes",
    hint: "Solo visibles en el admin",
    icon: Clock,
  },
];

export default function AdminGraphicIndex() {
  return (
    <div>
      <h1 className="font-bigger text-3xl uppercase">Gráfico</h1>
      <p className="mt-2 text-sm text-ink/70">
        Elegí una sección. Las pendientes no aparecen en el sitio público.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.id}>
              <Link
                href={`/admin/graphic/${s.id}`}
                className="flex items-start gap-3 bg-sky-pale px-4 py-5 transition-opacity hover:opacity-80"
              >
                <Icon
                  className="mt-0.5 size-5 shrink-0 opacity-60"
                  strokeWidth={1.5}
                />
                <span>
                  <span className="block font-medium">{s.label}</span>
                  <span className="mt-1 block text-xs text-ink/50">
                    {s.hint}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
