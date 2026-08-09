import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { NewCategoryCard } from "@/components/admin/NewCategoryCard";

const SECTIONS = [
  {
    href: "/admin/interfaces/projects",
    label: "Proyectos",
    hint: "Cards con galería y prototipo",
    icon: LayoutGrid,
  },
  {
    href: "/admin/interfaces/list",
    label: "Lista simple",
    hint: "Logos / wordmarks en grilla",
    icon: List,
  },
] as const;

export default function AdminInterfacesIndex() {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">Interfaces</h1>
      <p className="mt-2 text-sm text-ink/70">
        Elegí un tipo de contenido o creá una categoría nueva.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.href}>
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
        <NewCategoryCard scope="interfaces" />
      </ul>
    </div>
  );
}
