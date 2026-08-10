import { redirect } from "next/navigation";
import {
  findAdminByUsername,
  setGuestSessionCookie,
  setSessionCookie,
  verifyPassword,
} from "@/lib/admin-auth";

async function loginAction(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    redirect("/admin/login?error=1");
  }
  const user = await findAdminByUsername(username);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/admin/login?error=1");
  }
  await setSessionCookie({
    userId: user.id,
    username: user.username,
    mustChangePassword: user.mustChangePassword,
    role: "admin",
  });
  redirect(
    user.mustChangePassword ? "/admin/change-password" : "/admin",
  );
}

async function guestLoginAction() {
  "use server";
  await setGuestSessionCookie();
  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="w-full">
      <h1 className="font-admin-title text-3xl text-ink">
        Centro de control
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        Ingresá con tu usuario, o explorá una versión de solo lectura como
        visitante.
      </p>
      {error ? (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          Usuario o contraseña incorrectos.
        </p>
      ) : null}
      <form action={loginAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Usuario</span>
          <input
            name="username"
            defaultValue="admin"
            autoComplete="username"
            className="border border-ink/20 bg-white px-3 py-2 outline-none focus:border-ink"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Contraseña</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="border border-ink/20 bg-white px-3 py-2 outline-none focus:border-ink"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-2 bg-ink px-4 py-2.5 text-sm font-medium text-sky-pale transition-opacity hover:opacity-90"
        >
          Entrar
        </button>
      </form>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <p className="text-sm text-ink/65">
          ¿Querés ver cómo está organizado el CMS sin editar nada?
        </p>
        <form action={guestLoginAction} className="mt-3">
          <button
            type="submit"
            className="w-full border border-ink/25 bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-sky-pale/60"
          >
            Ingresar como visitante
          </button>
        </form>
      </div>
    </div>
  );
}
