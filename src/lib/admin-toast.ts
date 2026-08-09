export const TOAST_UNDO_MS = 8000;
export const ADMIN_TOAST_STORAGE_KEY = "portfolio_admin_toast";

export type AdminToastVariant = "success" | "warning" | "danger";

export type AdminToastFlash = {
  message: string;
  auditId?: string;
  undoable?: boolean;
  variant?: AdminToastVariant;
};

/** Append toast params to an admin redirect path. */
export function withToastQuery(path: string, flash: AdminToastFlash): string {
  const hasProtocol = /^https?:\/\//i.test(path);
  const url = new URL(path, hasProtocol ? undefined : "http://local.invalid");
  url.searchParams.set("toast", flash.message);
  if (flash.auditId) url.searchParams.set("auditId", flash.auditId);
  if (flash.undoable) url.searchParams.set("undo", "1");
  if (flash.variant && flash.variant !== "success") {
    url.searchParams.set("toastKind", flash.variant);
  }
  if (hasProtocol) return url.toString();
  return `${url.pathname}${url.search}${url.hash}`;
}

export function parseToastSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): AdminToastFlash | null {
  const get = (key: string) => {
    if (params instanceof URLSearchParams) return params.get(key);
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const message = get("toast");
  if (!message) return null;
  const auditId = get("auditId") || undefined;
  const undoable = get("undo") === "1" && Boolean(auditId);
  const kind = get("toastKind");
  const variant: AdminToastVariant =
    kind === "danger" || kind === "warning" ? kind : "success";
  return { message, auditId, undoable, variant };
}

type ToastListener = (flash: AdminToastFlash) => void;
const listeners = new Set<ToastListener>();

/** Client-side toast (e.g. borrado local antes de guardar). */
export function pushAdminToast(flash: AdminToastFlash) {
  listeners.forEach((fn) => fn(flash));
}

export function subscribeAdminToast(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function stashAdminToast(flash: AdminToastFlash) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ADMIN_TOAST_STORAGE_KEY, JSON.stringify(flash));
  } catch {
    /* ignore */
  }
}

export function takeStashedAdminToast(): AdminToastFlash | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_TOAST_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(ADMIN_TOAST_STORAGE_KEY);
    return JSON.parse(raw) as AdminToastFlash;
  } catch {
    return null;
  }
}
