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
import { NewCategoryCard } from "@/components/admin/NewCategoryCard";

const SECTIONS: {
  id: GraphicSection | "pending-hub";
  label: string;
  hint: string;
  href: string;
  icon: typeof ImageIcon;
}[] = [
  {
    id: "covers",
    label: "Portadas",
    hint: "Covers de discos / releases",
    href: "/admin/graphic/covers",
    icon: ImageIcon,
  },
  {
    id: "logos",
    label: "Logos",
    hint: "Identidades y wordmarks",
    href: "/admin/graphic/logos",
    icon: Sparkles,
  },
  {
    id: "personal",
    label: "Personales",
    hint: "Trabajos personales",
    href: "/admin/graphic/personal",
    icon: Palette,
  },
  {
    id: "illustration",
    label: "Ilustración",
    hint: "Piezas ilustradas",
    href: "/admin/graphic/illustration",
    icon: Layers,
  },
  {
    id: "banners",
    label: "Banners",
    hint: "Banners y piezas largas",
    href: "/admin/graphic/banners",
    icon: RectangleHorizontal,
  },
  {
    id: "pending-hub",
    label: "Pendientes",
    hint: "Bandeja unificada (gráfico + UI)",
    href: "/admin/pending",
    icon: Clock,
  },
];

export default function AdminGraphicIndex() {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">Gráfico</h1>
      <p className="mt-2 text-sm text-ink/70">
        Elegí una sección. Los pendientes viven en una bandeja única para todo
        el admin.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.id}>
              <Link
                href={s.href}
                className="flex flex-col items-center gap-3 bg-sky-pale px-4 py-6 text-center transition-opacity hover:opacity-80"
              >
                <Icon
                  className="size-10 shrink-0 opacity-60"
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
        <NewCategoryCard scope="graphic" />
      </ul>
    </div>
  );
}
