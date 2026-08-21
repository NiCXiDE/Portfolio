"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { pushAdminToast } from "@/lib/admin-toast";
import type { AdminMutationResult } from "@/lib/admin-mutation-result";

type QuietAction = (
  formData: FormData,
) => Promise<AdminMutationResult | void | { ok: false; error?: string }>;

/**
 * Envuelve una Server Action de admin para:
 * - marcar `__client=1` (skipRedirect + toast cliente);
 * - no navegar (mantiene scroll / acordeones);
 * - `router.refresh()` suave tras éxito.
 */
export function useQuietAdminAction(action: QuietAction) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = useCallback(
    async (formData: FormData) => {
      formData.set("__client", "1");
      const result = await action(formData);
      if (result && "ok" in result && result.ok === false) {
        pushAdminToast({
          message: result.error || "No se pudo guardar.",
          variant: "warning",
          undoable: false,
        });
        return result;
      }
      if (result && "ok" in result && result.ok === true) {
        pushAdminToast({
          message: result.message,
          auditId: result.auditId,
          undoable: result.undoable,
          variant: result.variant,
        });
        startTransition(() => {
          router.refresh();
        });
        return result;
      }
      // Redirect legacy path (no return) — no debería ocurrir con __client.
      startTransition(() => {
        router.refresh();
      });
      return result;
    },
    [action, router],
  );

  return { run, pending };
}
