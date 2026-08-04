export const LAYER_IDS = ["grafico", "inicio", "interfaces"] as const;

export type LayerId = (typeof LAYER_IDS)[number];

export const LAYER_ORDER: LayerId[] = ["grafico", "inicio", "interfaces"];

export function layerFromPathname(pathname: string): LayerId {
  if (pathname.includes("/grafico")) return "grafico";
  if (pathname.includes("/interfaces")) return "interfaces";
  return "inicio";
}

export function layerIndex(id: LayerId): number {
  return LAYER_ORDER.indexOf(id);
}

export function pathForLayer(locale: string, id: LayerId): string {
  if (id === "inicio") return `/${locale}`;
  return `/${locale}/${id}`;
}

export function neighborLayer(
  id: LayerId,
  direction: -1 | 1,
): LayerId | null {
  const next = layerIndex(id) + direction;
  if (next < 0 || next >= LAYER_ORDER.length) return null;
  return LAYER_ORDER[next];
}
