import { clearSessionCookie, getSession, isGuestSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  AdminMobileNav,
  AdminSidebar,
} from "@/components/admin/AdminSidebar";
import { AdminToastHost } from "@/components/admin/AdminToastHost";
import { AdminGuestShell } from "@/components/admin/AdminGuestShell";

async function logout() {
  "use server";
  await clearSessionCookie();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const guest = isGuestSession(session);
  const showNav =
    Boolean(session) && (!session?.mustChangePassword || guest);

  return (
    <div className="fixed inset-0 bg-background text-ink admin-panel">
      {showNav ? (
        <AdminGuestShell isGuest={guest} exitGuestAction={logout}>
          <div className="flex h-full min-h-0 flex-1">
            <AdminSidebar
              username={session?.username ?? "admin"}
              isGuest={guest}
              logoutAction={logout}
            />
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
              <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3 md:hidden">
                <span className="font-admin-title">Control</span>
                <form action={logout} data-guest-allow="">
                  <button type="submit" className="text-sm underline">
                    Salir
                  </button>
                </form>
              </header>
              <AdminMobileNav isGuest={guest} />
              <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
                {children}
              </main>
            </div>
          </div>
          <Suspense fallback={null}>
            <AdminToastHost />
          </Suspense>
        </AdminGuestShell>
      ) : (
        <main className="mx-auto flex h-full w-full max-w-md flex-col justify-center overflow-y-auto px-4 py-10">
          {children}
        </main>
      )}
    </div>
  );
}
