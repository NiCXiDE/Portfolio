"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Check, Trash2, Undo2, X } from "lucide-react";
import { undoAdminChangeAction } from "@/app/admin/actions";
import {
  parseToastSearchParams,
  stashAdminToast,
  subscribeAdminToast,
  takeStashedAdminToast,
  TOAST_UNDO_MS,
  type AdminToastFlash,
  type AdminToastVariant,
} from "@/lib/admin-toast";

type ToastState = AdminToastFlash & { id: number };

function showToast(
  flash: AdminToastFlash,
  setToast: (t: ToastState) => void,
  setVisible: (v: boolean) => void,
  seq: { current: number },
) {
  seq.current += 1;
  setToast({
    ...flash,
    variant: flash.variant ?? "success",
    id: seq.current,
  });
  setVisible(true);
}

function variantStyles(variant: AdminToastVariant = "success") {
  if (variant === "danger") {
    return {
      shell: "border-[color:var(--alert-danger)] bg-[#fff5f5]",
      iconWrap: "bg-[color:var(--alert-danger)] text-white",
      Icon: Trash2,
    };
  }
  if (variant === "warning") {
    return {
      shell: "border-[color:var(--alert-warning)] bg-[#fffcef]",
      iconWrap: "bg-[color:var(--alert-warning)] text-ink",
      Icon: AlertTriangle,
    };
  }
  return {
    shell: "border-[color:var(--alert-success)] bg-[#f3fff6]",
    iconWrap: "bg-[color:var(--alert-success)] text-ink",
    Icon: Check,
  };
}

export function AdminToastHost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [visible, setVisible] = useState(false);
  const [pending, startTransition] = useTransition();
  const seq = useRef(0);
  const hideTimer = useRef<number | null>(null);
  const lastQueryKey = useRef<string | null>(null);

  useEffect(() => {
    const fromQuery = parseToastSearchParams(searchParams);
    if (fromQuery) {
      const key = searchParams.toString();
      if (lastQueryKey.current !== key) {
        lastQueryKey.current = key;
        stashAdminToast(fromQuery);
        const next = new URLSearchParams(searchParams.toString());
        next.delete("toast");
        next.delete("auditId");
        next.delete("undo");
        next.delete("toastKind");
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      }
    }

    const stashed = takeStashedAdminToast();
    if (stashed) {
      showToast(stashed, setToast, setVisible, seq);
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    return subscribeAdminToast((flash) => {
      showToast(flash, setToast, setVisible, seq);
    });
  }, []);

  useEffect(() => {
    if (!toast || !visible) return;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => setToast(null), 300);
    }, TOAST_UNDO_MS);
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [toast?.id, visible]);

  function dismiss() {
    setVisible(false);
    window.setTimeout(() => setToast(null), 300);
  }

  function undo() {
    if (!toast?.auditId || !toast.undoable) return;
    startTransition(async () => {
      const result = await undoAdminChangeAction(toast.auditId!);
      if (result.ok) {
        showToast(
          { message: "Cambio deshecho", undoable: false, variant: "success" },
          setToast,
          setVisible,
          seq,
        );
        router.refresh();
      } else {
        showToast(
          { message: result.error, undoable: false, variant: "danger" },
          setToast,
          setVisible,
          seq,
        );
      }
    });
  }

  if (!toast) return null;

  const styles = variantStyles(toast.variant);
  const Icon = styles.Icon;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center p-4 sm:justify-end sm:p-6"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex w-full max-w-sm items-center gap-2.5 border px-3 py-2.5 text-ink shadow-[0_8px_28px_rgba(64,65,121,0.12)] transition-[opacity,transform] duration-300 ease-out sm:max-w-md ${styles.shell} ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }`}
      >
        <span
          className={`flex size-7 shrink-0 items-center justify-center ${styles.iconWrap}`}
        >
          <Icon className="size-3.5" strokeWidth={2} aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-sm font-medium leading-none">
          {toast.message}
        </p>
        {toast.undoable && toast.auditId ? (
          <button
            type="button"
            disabled={pending}
            onClick={undo}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ink-deep underline-offset-2 hover:underline disabled:opacity-50"
          >
            <Undo2 className="size-3.5" strokeWidth={1.75} />
            Deshacer
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={dismiss}
          className="flex size-7 shrink-0 items-center justify-center text-ink/45 transition-colors hover:text-ink"
        >
          <X className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

