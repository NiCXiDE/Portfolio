"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { resolveMediaUrl } from "@/lib/media";

const AdminMediaBaseContext = createContext("");

/**
 * Expone solo la base pública de medios (CDN), nunca credenciales R2.
 * El valor se calcula en el server con `mediaBaseUrl()` y se pasa como prop.
 */
export function AdminMediaProvider({
  mediaBase,
  children,
}: {
  mediaBase: string;
  children: ReactNode;
}) {
  return (
    <AdminMediaBaseContext.Provider value={mediaBase}>
      {children}
    </AdminMediaBaseContext.Provider>
  );
}

export function useMediaBase(): string {
  return useContext(AdminMediaBaseContext);
}

/** Misma semántica que `mediaUrl()` del server, con la base del provider. */
export function useAdminMediaUrl(path: string | null | undefined): string {
  return resolveMediaUrl(path, useMediaBase());
}
