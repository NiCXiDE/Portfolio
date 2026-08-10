"use client";

import { Eye } from "lucide-react";
import { useIsAdminGuest } from "@/components/admin/AdminGuestContext";

export function GuestModeBanner({
  onRestartTour,
  exitGuestAction,
}: {
  onRestartTour?: () => void;
  exitGuestAction: () => Promise<void>;
}) {
  const isGuest = useIsAdminGuest();
  if (!isGuest) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-violet-300/50 bg-violet-600 px-4 py-2 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm">
        <p className="inline-flex items-center gap-2 font-medium">
          <Eye className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
          Modo visitante · solo lectura — no se puede editar ni publicar.
        </p>
        <div className="flex items-center gap-3 text-xs">
          {onRestartTour ? (
            <button
              type="button"
              onClick={onRestartTour}
              className="underline underline-offset-2 opacity-90 hover:opacity-100"
            >
              Ver guía
            </button>
          ) : null}
          <form action={exitGuestAction} data-guest-allow="">
            <button
              type="submit"
              className="underline underline-offset-2 opacity-90 hover:opacity-100"
            >
              Entrar como admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
