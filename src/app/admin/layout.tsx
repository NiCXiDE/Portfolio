import { clearSessionCookie, getSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import {
  AdminMobileNav,
  AdminSidebar,
} from "@/components/admin/AdminSidebar";

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
  const showNav = Boolean(session) && !session?.mustChangePassword;

  return (
    <div className="fixed inset-0 bg-white text-ink">
      {showNav ? (
        <div className="flex h-full">
          <AdminSidebar
            username={session?.username ?? "admin"}
            logoutAction={logout}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
            <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3 md:hidden">
              <span className="font-bigger uppercase">Control</span>
              <form action={logout}>
                <button type="submit" className="text-sm underline">
                  Salir
                </button>
              </form>
            </header>
            <AdminMobileNav />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <main className="mx-auto flex h-full w-full max-w-md flex-col justify-center overflow-y-auto px-4 py-10">
          {children}
        </main>
      )}
    </div>
  );
}
