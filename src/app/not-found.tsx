import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `404 — ${SITE_NAME}`,
  description: "Página no encontrada.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-6 py-16 text-ink">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <p className="text-5xl font-bold tracking-tight text-ink/30 md:text-7xl">
          404
        </p>
        <h1 className="text-xl font-bold md:text-2xl">Página no encontrada</h1>
        <p className="text-sm leading-relaxed text-ink/75 md:text-base">
          Ese enlace no existe o se movió. Podés volver al portfolio por acá:
        </p>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm underline underline-offset-4 md:text-base">
        <Link href="/es" className="transition-opacity hover:opacity-70">
          Inicio
        </Link>
        <Link href="/es/grafico" className="transition-opacity hover:opacity-70">
          Gráfico
        </Link>
        <Link
          href="/es/interfaces"
          className="transition-opacity hover:opacity-70"
        >
          Interfaces
        </Link>
        <Link
          href="/es#contacto"
          className="transition-opacity hover:opacity-70"
        >
          Contacto
        </Link>
      </nav>
      <p className="text-xs text-ink/50">
        <Link href="/en" className="underline underline-offset-2 hover:opacity-70">
          English home
        </Link>
      </p>
    </main>
  );
}
