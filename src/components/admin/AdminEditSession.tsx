"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { RotateCcw, Save, Undo2 } from "lucide-react";
import { pushAdminToast } from "@/lib/admin-toast";
import type { AdminMutationResult } from "@/lib/admin-mutation-result";
import { useQuietAdminAction } from "@/components/admin/useQuietAdminAction";

type Snapshot = Record<string, string>;

type FormEntry = {
  id: string;
  label: string;
  form: HTMLFormElement;
  baseline: Snapshot;
  current: Snapshot;
  saveAction: (
    fd: FormData,
  ) => Promise<AdminMutationResult | void | { ok: false; error?: string }>;
};

type UndoFrame = {
  formId: string;
  before: Snapshot;
};

type SessionApi = {
  registerForm: (input: {
    id: string;
    label: string;
    form: HTMLFormElement | null;
    saveAction: FormEntry["saveAction"];
  }) => void;
  unregisterForm: (id: string) => void;
  noteChange: (formId: string) => void;
  dirtyCount: number;
  dirtyIds: Set<string>;
  isDirty: (id: string) => boolean;
};

const AdminEditSessionContext = createContext<SessionApi | null>(null);

function readSnapshot(form: HTMLFormElement): Snapshot {
  const data = new FormData(form);
  const snap: Snapshot = {};
  for (const [key, value] of data.entries()) {
    if (key === "__client") continue;
    if (typeof value === "string") {
      // Checkboxes: FormData only includes checked ones; normalize below.
      snap[key] = value;
    }
  }
  // Explicit unchecked checkboxes → "" so discard/compare works.
  for (const el of Array.from(form.elements)) {
    if (
      el instanceof HTMLInputElement &&
      el.type === "checkbox" &&
      el.name &&
      !(el.name in snap)
    ) {
      snap[el.name] = "";
    }
  }
  return snap;
}

function snapshotsEqual(a: Snapshot, b: Snapshot): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a[k] ?? "") !== (b[k] ?? "")) return false;
  }
  return true;
}

function applySnapshot(form: HTMLFormElement, snap: Snapshot) {
  for (const el of Array.from(form.elements)) {
    if (!(el instanceof HTMLElement) || !("name" in el)) continue;
    const name = (el as HTMLInputElement).name;
    if (!name || !(name in snap)) continue;
    const value = snap[name] ?? "";
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox") {
        el.checked = value === "on" || value === "true" || value === "1";
      } else if (el.type === "file") {
        continue;
      } else {
        el.value = value;
      }
    } else if (el instanceof HTMLTextAreaElement) {
      el.value = value;
    } else if (el instanceof HTMLSelectElement) {
      el.value = value;
    }
  }
  form.dispatchEvent(new Event("input", { bubbles: true }));
  form.dispatchEvent(new Event("change", { bubbles: true }));
}

export function AdminEditSession({
  children,
  /** Etiqueta corta de la pantalla (p.ej. "Testimonios"). */
  pageLabel,
}: {
  children: ReactNode;
  pageLabel: string;
}) {
  const entriesRef = useRef(new Map<string, FormEntry>());
  const undoRef = useRef<UndoFrame[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [undoLen, setUndoLen] = useState(0);
  const [saving, setSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const recomputeDirty = useCallback(() => {
    const next = new Set<string>();
    for (const [id, entry] of entriesRef.current) {
      entry.current = readSnapshot(entry.form);
      if (!snapshotsEqual(entry.baseline, entry.current)) next.add(id);
    }
    setDirtyIds(next);
  }, []);

  const registerForm = useCallback(
    (input: {
      id: string;
      label: string;
      form: HTMLFormElement | null;
      saveAction: FormEntry["saveAction"];
    }) => {
      if (!input.form) {
        entriesRef.current.delete(input.id);
        recomputeDirty();
        return;
      }
      const baseline = readSnapshot(input.form);
      entriesRef.current.set(input.id, {
        id: input.id,
        label: input.label,
        form: input.form,
        baseline,
        current: baseline,
        saveAction: input.saveAction,
      });
      recomputeDirty();
    },
    [recomputeDirty],
  );

  const unregisterForm = useCallback(
    (id: string) => {
      entriesRef.current.delete(id);
      recomputeDirty();
    },
    [recomputeDirty],
  );

  const noteChange = useCallback(
    (formId: string) => {
      const entry = entriesRef.current.get(formId);
      if (!entry) return;
      const before = entry.current;
      const after = readSnapshot(entry.form);
      if (snapshotsEqual(before, after)) return;
      undoRef.current.push({ formId, before });
      if (undoRef.current.length > 80) undoRef.current.shift();
      setUndoLen(undoRef.current.length);
      entry.current = after;
      recomputeDirty();
    },
    [recomputeDirty],
  );

  const dirtyCount = dirtyIds.size;

  useEffect(() => {
    if (dirtyCount === 0) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirtyCount]);

  // Soft warn when clicking admin nav links with pending changes.
  useEffect(() => {
    if (dirtyCount === 0) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const a = t.closest("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/admin")) return;
      if (href === pathname || href.startsWith(`${pathname}?`)) return;
      if (
        !window.confirm(
          `Hay ${dirtyCount} cambio${dirtyCount === 1 ? "" : "s"} sin guardar en ${pageLabel}. ¿Salir igual?`,
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirtyCount, pageLabel, pathname]);

  async function saveAll() {
    const dirty = [...dirtyIds]
      .map((id) => entriesRef.current.get(id))
      .filter(Boolean) as FormEntry[];
    if (!dirty.length) return;
    setSaving(true);
    let okCount = 0;
    let lastToast: AdminMutationResult | null = null;
    try {
      for (const entry of dirty) {
        const fd = new FormData(entry.form);
        fd.set("__client", "1");
        const result = await entry.saveAction(fd);
        if (result && typeof result === "object" && "ok" in result) {
          if (result.ok === true) {
            okCount += 1;
            lastToast = result;
            entry.baseline = readSnapshot(entry.form);
            entry.current = entry.baseline;
          } else {
            const errMsg =
              "error" in result && typeof result.error === "string"
                ? result.error
                : `No se pudo guardar “${entry.label}”.`;
            pushAdminToast({
              message: errMsg,
              variant: "warning",
              undoable: false,
            });
            recomputeDirty();
            setSaving(false);
            return;
          }
        }
      }
      undoRef.current = [];
      setUndoLen(0);
      recomputeDirty();
      pushAdminToast({
        message:
          okCount === 1
            ? lastToast?.message || "Cambios guardados"
            : `${okCount} cambios guardados en ${pageLabel}`,
        auditId: lastToast?.auditId,
        undoable: Boolean(lastToast?.undoable && okCount === 1),
        variant: "success",
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function undoLast() {
    const frame = undoRef.current.pop();
    setUndoLen(undoRef.current.length);
    if (!frame) return;
    const entry = entriesRef.current.get(frame.formId);
    if (!entry) return;
    applySnapshot(entry.form, frame.before);
    entry.current = frame.before;
    recomputeDirty();
  }

  function discardAll() {
    if (
      dirtyCount > 0 &&
      !window.confirm(
        `¿Descartar ${dirtyCount} cambio${dirtyCount === 1 ? "" : "s"} en ${pageLabel}?`,
      )
    ) {
      return;
    }
    for (const entry of entriesRef.current.values()) {
      applySnapshot(entry.form, entry.baseline);
      entry.current = entry.baseline;
    }
    undoRef.current = [];
    setUndoLen(0);
    recomputeDirty();
  }

  const api = useMemo<SessionApi>(
    () => ({
      registerForm,
      unregisterForm,
      noteChange,
      dirtyCount,
      dirtyIds,
      isDirty: (id) => dirtyIds.has(id),
    }),
    [registerForm, unregisterForm, noteChange, dirtyCount, dirtyIds],
  );

  return (
    <AdminEditSessionContext.Provider value={api}>
      <div className={dirtyCount > 0 ? "pb-24" : undefined}>{children}</div>
      {dirtyCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 md:left-[13rem]">
          <div className="pointer-events-auto flex max-w-3xl flex-wrap items-center gap-2 border border-ink/15 bg-white px-3 py-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
            <span className="text-sm font-medium text-ink">
              {dirtyCount} cambio{dirtyCount === 1 ? "" : "s"} sin guardar
            </span>
            <button
              type="button"
              disabled={undoLen === 0 || saving}
              onClick={undoLast}
              className="inline-flex items-center gap-1 border border-ink/15 px-2 py-1 text-xs disabled:opacity-40"
            >
              <Undo2 className="size-3.5" /> Deshacer
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={discardAll}
              className="inline-flex items-center gap-1 border border-ink/15 px-2 py-1 text-xs disabled:opacity-40"
            >
              <RotateCcw className="size-3.5" /> Descartar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveAll()}
              className="inline-flex items-center gap-1 bg-ink px-3 py-1.5 text-xs text-sky-pale disabled:opacity-40"
            >
              <Save className="size-3.5" />
              {saving ? "Guardando…" : "Guardar todo"}
            </button>
          </div>
        </div>
      ) : null}
    </AdminEditSessionContext.Provider>
  );
}

export function useAdminEditSession(): SessionApi | null {
  return useContext(AdminEditSessionContext);
}

/**
 * Registra un form en la sesión de edición (dirty / undo / save all).
 * Usar en forms de ítems persistidos (no create-only si preferís).
 */
export function AdminTrackedForm({
  id,
  label,
  saveAction,
  children,
  className,
  onSubmitExtra,
}: {
  id: string;
  label: string;
  saveAction: FormEntry["saveAction"];
  children: ReactNode;
  className?: string;
  onSubmitExtra?: () => void;
}) {
  const session = useAdminEditSession();
  const formRef = useRef<HTMLFormElement>(null);
  const { run, pending } = useQuietAdminAction(saveAction);

  useEffect(() => {
    if (!session) return;
    session.registerForm({
      id,
      label,
      form: formRef.current,
      saveAction,
    });
    return () => session.unregisterForm(id);
  }, [session, id, label, saveAction]);

  function onInput() {
    session?.noteChange(id);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await run(fd);
    onSubmitExtra?.();
    // Re-baseline after successful quiet save
    if (session && formRef.current) {
      session.registerForm({
        id,
        label,
        form: formRef.current,
        saveAction,
      });
    }
  }

  const dirty = session?.isDirty(id) ?? false;

  return (
    <form
      ref={formRef}
      className={className}
      data-admin-form={id}
      data-dirty={dirty ? "1" : "0"}
      onInput={onInput}
      onChange={onInput}
      onSubmit={(e) => void onSubmit(e)}
    >
      {children}
      {pending ? (
        <p className="text-xs text-ink/50">Guardando…</p>
      ) : null}
    </form>
  );
}
