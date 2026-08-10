import { redirect } from "next/navigation";
import {
  getSession,
  setSessionCookie,
  updateAdminPassword,
} from "@/lib/admin-auth";

async function changePasswordAction(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 10) {
    redirect("/admin/change-password?error=short");
  }
  if (password !== confirm) {
    redirect("/admin/change-password?error=mismatch");
  }

  await updateAdminPassword(session.userId, password);
  await setSessionCookie({
    ...session,
    role: "admin",
    mustChangePassword: false,
  });
  redirect("/admin");
}

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const msg =
    error === "short"
      ? "La contraseña debe tener al menos 10 caracteres."
      : error === "mismatch"
        ? "Las contraseñas no coinciden."
        : null;

  return (
    <div className="w-full">
      <h1 className="font-admin-title text-3xl">
        Nueva contraseña
      </h1>
      <p className="mt-2 text-sm text-ink/70">
        Por seguridad, definí una contraseña nueva y confirmala.
      </p>
      {msg ? (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {msg}
        </p>
      ) : null}
      <form action={changePasswordAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nueva contraseña</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className="border border-ink/20 px-3 py-2 outline-none focus:border-ink"
            required
            minLength={10}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Repetir contraseña</span>
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            className="border border-ink/20 px-3 py-2 outline-none focus:border-ink"
            required
            minLength={10}
          />
        </label>
        <button
          type="submit"
          className="mt-2 bg-ink px-4 py-2.5 text-sm font-medium text-sky-pale"
        >
          Guardar y continuar
        </button>
      </form>
    </div>
  );
}
