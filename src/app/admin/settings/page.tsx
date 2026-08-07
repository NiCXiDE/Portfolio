import { getDataSource } from "@/db/data-source";
import { SiteSettingsEntity, SocialLinkEntity } from "@/db/entities";
import { saveSettings, saveSocial } from "@/app/admin/actions";
import {
  WithSettingsPreview,
  WithSocialPreview,
} from "@/components/admin/WithPreview";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const ds = await getDataSource();
  const [settings, socials] = await Promise.all([
    ds.getRepository(SiteSettingsEntity).findOneByOrFail({ id: "main" }),
    ds.getRepository(SocialLinkEntity).find({ order: { sortOrder: "ASC" } }),
  ]);

  return (
    <div>
      <h1 className="font-bigger text-3xl uppercase">Ajustes</h1>
      {saved ? <p className="mt-2 text-sm text-green-700">Guardado.</p> : null}

      <div className="mt-6">
        <WithSettingsPreview>
          <form action={saveSettings} className="space-y-4">
            <h2 className="text-lg font-bold">Contacto / footer</h2>
            <input
              name="email"
              defaultValue={settings.email}
              className="w-full border border-ink/20 px-3 py-2 text-sm"
            />
            <input
              name="phone"
              defaultValue={settings.phone}
              className="w-full border border-ink/20 px-3 py-2 text-sm"
            />
            <textarea
              name="noteEs"
              defaultValue={settings.noteEs}
              rows={2}
              className="w-full border border-ink/20 px-3 py-2 text-sm"
            />
            <textarea
              name="noteEn"
              defaultValue={settings.noteEn}
              rows={2}
              className="w-full border border-ink/20 px-3 py-2 text-sm"
            />
            <input
              name="poweredBy"
              defaultValue={settings.poweredBy}
              className="w-full border border-ink/20 px-3 py-2 text-sm"
            />
            <h2 className="pt-4 text-lg font-bold">Timings / ver más</h2>
            <label className="block text-sm">
              Carousel interval (ms)
              <input
                type="number"
                name="carouselIntervalMs"
                defaultValue={settings.carouselIntervalMs}
                className="mt-1 w-full border border-ink/20 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Límite preview gráfico
              <input
                type="number"
                name="graphicPreviewLimit"
                defaultValue={settings.graphicPreviewLimit}
                className="mt-1 w-full border border-ink/20 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Límite preview interfaces
              <input
                type="number"
                name="interfacesPreviewLimit"
                defaultValue={settings.interfacesPreviewLimit}
                className="mt-1 w-full border border-ink/20 px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="bg-ink px-4 py-2 text-sm text-sky-pale"
            >
              Guardar ajustes
            </button>
          </form>
        </WithSettingsPreview>
      </div>

      <h2 className="mt-12 text-lg font-bold">Redes sociales</h2>
      <div className="mt-4 space-y-4">
        {socials.map((s) => (
          <div key={s.id} className="border border-ink/10 p-4">
            <WithSocialPreview>
              <form action={saveSocial} className="space-y-2">
                <input type="hidden" name="id" value={s.id} />
                <p className="text-xs text-ink/50">{s.id}</p>
                <input
                  name="network"
                  defaultValue={s.network}
                  className="w-full border border-ink/20 px-3 py-2 text-sm"
                />
                <input
                  name="label"
                  defaultValue={s.label}
                  className="w-full border border-ink/20 px-3 py-2 text-sm"
                />
                <input
                  name="href"
                  defaultValue={s.href}
                  className="w-full border border-ink/20 px-3 py-2 text-sm"
                />
                <input
                  name="iconPath"
                  defaultValue={s.iconPath ?? ""}
                  className="w-full border border-ink/20 px-3 py-2 text-sm"
                />
                <div className="flex gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="published"
                      defaultChecked={s.published}
                    />
                    Visible
                  </label>
                  <label className="inline-flex items-center gap-2">
                    Orden
                    <input
                      type="number"
                      name="sortOrder"
                      defaultValue={s.sortOrder}
                      className="w-20 border border-ink/20 px-2 py-1"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-ink px-3 py-2 text-sm text-sky-pale"
                >
                  Guardar red
                </button>
              </form>
            </WithSocialPreview>
          </div>
        ))}
      </div>

      <details className="mt-6 border border-ink/15">
        <summary className="cursor-pointer px-3 py-2">+ Nueva red</summary>
        <div className="p-4">
          <WithSocialPreview>
            <form action={saveSocial} className="space-y-2">
              <input
                name="id"
                placeholder="id (behance)"
                required
                className="w-full border border-ink/20 px-3 py-2 text-sm"
              />
              <input
                name="network"
                placeholder="network"
                className="w-full border border-ink/20 px-3 py-2 text-sm"
              />
              <input
                name="label"
                placeholder="label"
                className="w-full border border-ink/20 px-3 py-2 text-sm"
              />
              <input
                name="href"
                placeholder="https://..."
                className="w-full border border-ink/20 px-3 py-2 text-sm"
              />
              <input
                name="iconPath"
                placeholder="/assets/shared/…"
                className="w-full border border-ink/20 px-3 py-2 text-sm"
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked />
                Visible
              </label>
              <input type="hidden" name="sortOrder" value={socials.length} />
              <button
                type="submit"
                className="bg-ink px-3 py-2 text-sm text-sky-pale"
              >
                Crear
              </button>
            </form>
          </WithSocialPreview>
        </div>
      </details>
    </div>
  );
}
