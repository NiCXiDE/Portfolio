import { redirect } from "next/navigation";
import {
  findAdminByUsername,
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
  });
  redirect(
    user.mustChangePassword ? "/admin/change-password" : "/admin",
  );
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="w-full">
      <h1 className="font-bigger text-3xl uppercase tracking-wide text-ink">
        Centro de control
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        Ingresá con tu usuario. La primera vez te pediremos una nueva
        contraseña.
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
    </div>
  );
}
