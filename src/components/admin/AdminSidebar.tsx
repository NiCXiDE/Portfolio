"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  List,
  LogOut,
  MessageSquareQuote,
  Settings,
  Tags,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const GRAPHIC_SECTIONS = [
  { href: "/admin/graphic/covers", label: "Portadas" },
  { href: "/admin/graphic/logos", label: "Logos" },
  { href: "/admin/graphic/personal", label: "Personales" },
  { href: "/admin/graphic/illustration", label: "Ilustración" },
  { href: "/admin/graphic/banners", label: "Banners" },
  { href: "/admin/graphic/pending", label: "Pendientes" },
];

const INTERFACE_SECTIONS = [
  { href: "/admin/interfaces#proyectos", label: "Proyectos" },
  { href: "/admin/interfaces#lista", label: "Lista simple" },
];

type Props = {
  username: string;
  logoutAction: () => Promise<void>;
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  indented,
}: {
  href: string;
  label: string;
  icon?: typeof LayoutDashboard;
  active: boolean;
  indented?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
        indented ? "pl-8" : ""
      } ${
        active
          ? "bg-white text-ink"
          : "text-ink/80 hover:bg-white/70 hover:text-ink"
      }`}
    >
      {Icon ? <Icon className="size-3.5 shrink-0 opacity-70" strokeWidth={1.75} /> : null}
      <span>{label}</span>
    </Link>
  );
}

function NavGroup({
  label,
  icon: Icon,
  open,
  onToggle,
  active,
  children,
}: {
  label: string;
  icon: typeof LayoutDashboard;
  open: boolean;
  onToggle: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
          active ? "bg-white/80 text-ink" : "text-ink/80 hover:bg-white/70"
        }`}
      >
        <Icon className="size-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={`size-3.5 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
        />
      </button>
      {open ? <div className="mt-0.5 space-y-0.5">{children}</div> : null}
    </div>
  );
}

export function AdminSidebar({ username, logoutAction }: Props) {
  const pathname = usePathname();
  const graphicActive = pathname.startsWith("/admin/graphic");
  const interfacesActive = pathname.startsWith("/admin/interfaces");
  const [graphicOpen, setGraphicOpen] = useState(graphicActive);
  const [interfacesOpen, setInterfacesOpen] = useState(interfacesActive);

  useEffect(() => {
    if (graphicActive) setGraphicOpen(true);
  }, [graphicActive]);
  useEffect(() => {
    if (interfacesActive) setInterfacesOpen(true);
  }, [interfacesActive]);

  return (
    <aside className="hidden h-dvh w-56 shrink-0 flex-col border-r border-ink/10 bg-sky-pale md:flex">
      <div className="shrink-0 px-4 pt-6">
        <p className="font-bigger text-lg uppercase tracking-wide text-ink">
          Control
        </p>
        <p className="mt-1 text-xs text-ink/60">{username}</p>
      </div>

      <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4">
        <NavLink
          href="/admin"
          label="Inicio"
          icon={LayoutDashboard}
          active={pathname === "/admin"}
        />
        <NavLink
          href="/admin/bio"
          label="Bio / CV"
          icon={User}
          active={pathname.startsWith("/admin/bio")}
        />
        <NavLink
          href="/admin/lists"
          label="Listas"
          icon={List}
          active={pathname.startsWith("/admin/lists")}
        />
        <NavLink
          href="/admin/testimonials"
          label="Testimonios"
          icon={MessageSquareQuote}
          active={pathname.startsWith("/admin/testimonials")}
        />

        <NavGroup
          label="Gráfico"
          icon={ImageIcon}
          open={graphicOpen}
          onToggle={() => setGraphicOpen((o) => !o)}
          active={graphicActive}
        >
          <NavLink
            href="/admin/graphic"
            label="Todas las secciones"
            icon={FolderOpen}
            active={pathname === "/admin/graphic"}
            indented
          />
          {GRAPHIC_SECTIONS.map((s) => (
            <NavLink
              key={s.href}
              href={s.href}
              label={s.label}
              active={pathname === s.href}
              indented
            />
          ))}
        </NavGroup>

        <NavLink
          href="/admin/manuals"
          label="Manuales"
          icon={FileText}
          active={pathname.startsWith("/admin/manuals")}
        />

        <NavGroup
          label="Interfaces"
          icon={LayoutGrid}
          open={interfacesOpen}
          onToggle={() => setInterfacesOpen((o) => !o)}
          active={interfacesActive}
        >
          {INTERFACE_SECTIONS.map((s) => (
            <NavLink
              key={s.href}
              href={s.href}
              label={s.label}
              active={interfacesActive}
              indented
            />
          ))}
        </NavGroup>

        <NavLink
          href="/admin/tags"
          label="Etiquetas"
          icon={Tags}
          active={pathname.startsWith("/admin/tags")}
        />
        <NavLink
          href="/admin/settings"
          label="Ajustes"
          icon={Settings}
          active={pathname.startsWith("/admin/settings")}
        />
        <NavLink
          href="/admin/media"
          label="Archivos"
          icon={Eye}
          active={pathname.startsWith("/admin/media")}
        />
      </nav>

      <div className="shrink-0 space-y-2 border-t border-ink/10 px-4 py-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-sm text-ink/70 underline-offset-2 hover:text-ink hover:underline"
          >
            <LogOut className="size-3.5" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </form>
        <Link
          href="/es"
          className="inline-flex items-center gap-1.5 text-xs text-ink/50 hover:text-ink"
        >
          <ExternalLink className="size-3" strokeWidth={1.75} />
          Ver sitio
        </Link>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Inicio" },
    { href: "/admin/bio", label: "Bio" },
    { href: "/admin/testimonials", label: "Testimonios" },
    { href: "/admin/graphic", label: "Gráfico" },
    { href: "/admin/graphic/covers", label: "Portadas" },
    { href: "/admin/graphic/logos", label: "Logos" },
    { href: "/admin/manuals", label: "Manuales" },
    { href: "/admin/interfaces", label: "Interfaces" },
    { href: "/admin/lists", label: "Listas" },
    { href: "/admin/tags", label: "Tags" },
    { href: "/admin/settings", label: "Ajustes" },
    { href: "/admin/media", label: "Archivos" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-ink/10 px-3 py-2 md:hidden">
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`shrink-0 rounded px-2 py-1 text-xs ${
            pathname === item.href
              ? "bg-ink text-sky-pale"
              : "bg-sky-pale text-ink"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
