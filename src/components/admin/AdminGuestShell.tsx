"use client";

import { useCallback, useState } from "react";
import { AdminGuestProvider } from "@/components/admin/AdminGuestContext";
import { GuestModeBanner } from "@/components/admin/GuestModeBanner";
import { VisitorTour } from "@/components/admin/VisitorTour";

export function AdminGuestShell({
  isGuest,
  exitGuestAction,
  children,
}: {
  isGuest: boolean;
  exitGuestAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [tourNonce, setTourNonce] = useState(0);
  const restartTour = useCallback(() => {
    try {
      localStorage.removeItem("portfolio-admin-visitor-tour-done");
    } catch {
      /* ignore */
    }
    setTourNonce((n) => n + 1);
  }, []);

  return (
    <AdminGuestProvider isGuest={isGuest}>
      <div className="flex h-full min-h-0 flex-col">
        {isGuest ? (
          <>
            <GuestModeBanner
              onRestartTour={restartTour}
              exitGuestAction={exitGuestAction}
            />
            <VisitorTour key={tourNonce} enabled />
          </>
        ) : null}
        <div
          data-guest-readonly={isGuest ? "true" : undefined}
          className="admin-guest-shell flex min-h-0 flex-1 flex-col"
        >
          {children}
        </div>
      </div>
    </AdminGuestProvider>
  );
}
