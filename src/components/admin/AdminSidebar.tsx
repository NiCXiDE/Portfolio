"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  Eye,
  FileText,
  History,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  List,
  LogOut,
  MessageSquareQuote,
  Settings,
  Tags,
  User,
  Building2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const GRAPHIC_SECTIONS = [
  { href: "/admin/graphic/covers", label: "Portadas" },
  { href: "/admin/graphic/logos", label: "Logos" },
  { href: "/admin/graphic/personal", label: "Personales" },
  { href: "/admin/graphic/illustration", label: "Ilustración" },
  { href: "/admin/graphic/banners", label: "Banners" },
];

const INTERFACE_SECTIONS = [
  { href: "/admin/interfaces/projects", label: "Proyectos" },
  { href: "/admin/interfaces/list", label: "Lista simple" },
];

type Props = {
  username: string;
  logoutAction: () => Promise<void>;
  isGuest?: boolean;
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
          ? "bg-white text-ink shadow-sm"
          : "text-ink/80 hover:bg-white/70 hover:text-ink"
      }`}
    >
      {Icon ? (
        <Icon className="size-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
      ) : null}
      <span>{label}</span>
    </Link>
  );
}

function NavGroup({
  href,
  label,
  icon: Icon,
  open,
  onOpenChange,
  active,
  hubActive,
  children,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: boolean;
  /** Estás en el índice “todas las secciones” de este grupo */
  hubActive: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  function toggle() {
    const next = !open;
    onOpenChange(next);
    if (next) router.push(href);
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? `Cerrar ${label}` : `Abrir ${label}`}
        onClick={toggle}
        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
          hubActive
            ? "bg-white text-ink shadow-sm"
            : active
              ? "bg-white/70 text-ink"
              : "text-ink/80 hover:bg-white/70 hover:text-ink"
        }`}
      >
        <Icon className="size-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-ink/50 transition-transform duration-300 ease-out ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.75}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="submenu"
            initial={
              reduceMotion ? false : { height: 0, opacity: 0, y: -4 }
            }
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { height: 0, opacity: 0, y: -4 }
            }
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 space-y-0.5 pb-0.5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function AdminSidebar({
  username,
  logoutAction,
  isGuest = false,
}: Props) {
  const pathname = usePathname();
  const graphicActive = pathname.startsWith("/admin/graphic");
  const interfacesActive = pathname.startsWith("/admin/interfaces");
  const graphicHub = pathname === "/admin/graphic";
  const interfacesHub = pathname === "/admin/interfaces";
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
        <p className="font-admin-title text-lg text-ink">Control</p>
        <p className="mt-1 text-xs text-ink/60">{username}</p>
        {isGuest ? (
          <p className="mt-2 inline-block bg-violet-600 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            Visitante
          </p>
        ) : null}
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
          label="Listas / marquees"
          icon={List}
          active={pathname.startsWith("/admin/lists")}
        />
        <NavLink
          href="/admin/brands"
          label="Marcas"
          icon={Building2}
          active={pathname.startsWith("/admin/brands")}
        />
        <div data-tour="nav-ocultos">
          <NavLink
            href="/admin/pending"
            label="Ocultos"
            icon={Inbox}
            active={pathname.startsWith("/admin/pending")}
          />
        </div>
        <div data-tour="nav-testimonials">
          <NavLink
            href="/admin/testimonials"
            label="Testimonios"
            icon={MessageSquareQuote}
            active={pathname.startsWith("/admin/testimonials")}
          />
        </div>

        <div data-tour="nav-graphic">
          <NavGroup
            href="/admin/graphic"
            label="Gráfico"
            icon={ImageIcon}
            open={graphicOpen}
            onOpenChange={setGraphicOpen}
            active={graphicActive}
            hubActive={graphicHub}
          >
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
        </div>

        <NavLink
          href="/admin/manuals"
          label="Manuales"
          icon={FileText}
          active={pathname.startsWith("/admin/manuals")}
        />

        <div data-tour="nav-interfaces">
          <NavGroup
            href="/admin/interfaces"
            label="Interfaces"
            icon={LayoutGrid}
            open={interfacesOpen}
            onOpenChange={setInterfacesOpen}
            active={interfacesActive}
            hubActive={interfacesHub}
          >
            {INTERFACE_SECTIONS.map((s) => (
              <NavLink
                key={s.href}
                href={s.href}
                label={s.label}
                active={pathname === s.href}
                indented
              />
            ))}
          </NavGroup>
        </div>

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
        {!isGuest ? (
          <NavLink
            href="/admin/audit"
            label="Auditoría"
            icon={History}
            active={pathname.startsWith("/admin/audit")}
          />
        ) : null}
        <NavLink
          href="/admin/media"
          label="Archivos"
          icon={Eye}
          active={pathname.startsWith("/admin/media")}
        />
      </nav>

      <div className="shrink-0 space-y-2 border-t border-ink/10 px-4 py-4">
        <form action={logoutAction} data-guest-allow="">
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

export function AdminMobileNav({ isGuest = false }: { isGuest?: boolean }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Inicio" },
    { href: "/admin/bio", label: "Bio" },
    { href: "/admin/brands", label: "Marcas" },
    { href: "/admin/pending", label: "Ocultos" },
    { href: "/admin/testimonials", label: "Testimonios" },
    { href: "/admin/graphic", label: "Gráfico" },
    { href: "/admin/graphic/covers", label: "Portadas" },
    { href: "/admin/graphic/logos", label: "Logos" },
    { href: "/admin/manuals", label: "Manuales" },
    { href: "/admin/interfaces", label: "Interfaces" },
    { href: "/admin/interfaces/projects", label: "Proyectos UI" },
    { href: "/admin/interfaces/list", label: "Lista UI" },
    { href: "/admin/lists", label: "Listas / marquees" },
    { href: "/admin/tags", label: "Tags" },
    { href: "/admin/settings", label: "Ajustes" },
    ...(isGuest
      ? []
      : [{ href: "/admin/audit", label: "Auditoría" }]),
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
