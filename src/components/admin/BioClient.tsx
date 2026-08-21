"use client";

import { Image as ImageIcon, Save } from "lucide-react";
import { saveBio } from "@/app/admin/actions";
import { FieldLabel, fieldClass } from "@/components/admin/FieldLabel";
import { ImageDropField } from "@/components/admin/ImageDropField";
import { WithBioPreview } from "@/components/admin/WithPreview";

export function BioClient({
  bio,
  saved,
}: {
  bio: {
    text: { es: string; en: string };
    photoPath: string;
    photoPreviewUrl: string;
    photoAlt: { es: string; en: string };
    signaturePath: string;
    signaturePreviewUrl: string;
    signatureAlt: { es: string; en: string };
    cvPath: string | null;
    cvPreviewUrl: string;
    cvPathEn: string | null;
    cvEnPreviewUrl: string;
  };
  saved?: string;
}) {
  return (
    <div>
      <h1 className="font-admin-title text-3xl">Bio / CV</h1>
      {saved ? (
        <p className="mt-2 text-sm text-green-700">Guardado.</p>
      ) : null}
      <p className="mt-2 text-sm text-ink/60">
        La vista previa a la derecha se actualiza mientras escribís.
      </p>
      <div className="mt-6">
        <WithBioPreview>
          <form action={saveBio} className="flex flex-col gap-4">
            <label className="block">
              <FieldLabel>Texto (español)</FieldLabel>
              <textarea
                name="textEs"
                defaultValue={bio.text.es}
                rows={6}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <FieldLabel>Texto (inglés)</FieldLabel>
              <textarea
                name="textEn"
                defaultValue={bio.text.en}
                rows={6}
                className={fieldClass}
              />
            </label>
            <ImageDropField
              name="photoPath"
              label="Foto"
              folder="assets/inicio"
              defaultValue={bio.photoPath}
              defaultPreviewUrl={bio.photoPreviewUrl}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <FieldLabel icon={ImageIcon}>
                  Descripción de la foto (español)
                </FieldLabel>
                <input
                  name="photoAltEs"
                  defaultValue={bio.photoAlt.es}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <FieldLabel>Descripción de la foto (inglés)</FieldLabel>
                <input
                  name="photoAltEn"
                  defaultValue={bio.photoAlt.en}
                  className={fieldClass}
                />
              </label>
            </div>
            <ImageDropField
              name="signaturePath"
              label="Firma"
              folder="assets/inicio"
              defaultValue={bio.signaturePath}
              defaultPreviewUrl={bio.signaturePreviewUrl}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <FieldLabel>Descripción de la firma (español)</FieldLabel>
                <input
                  name="signatureAltEs"
                  defaultValue={bio.signatureAlt.es}
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <FieldLabel>Descripción de la firma (inglés)</FieldLabel>
                <input
                  name="signatureAltEn"
                  defaultValue={bio.signatureAlt.en}
                  className={fieldClass}
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageDropField
                name="cvPath"
                label="CV en español (PDF)"
                hint="Currículum en español."
                folder="assets/cv"
                defaultValue={bio.cvPath ?? ""}
                defaultPreviewUrl={bio.cvPreviewUrl}
                accept="application/pdf,.pdf"
                kind="file"
              />
              <ImageDropField
                name="cvPathEn"
                label="Résumé in English (PDF)"
                hint="English résumé / CV."
                folder="assets/cv"
                defaultValue={bio.cvPathEn ?? ""}
                defaultPreviewUrl={bio.cvEnPreviewUrl}
                accept="application/pdf,.pdf"
                kind="file"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-fit items-center gap-1.5 bg-ink px-4 py-2 text-sm text-sky-pale"
            >
              <Save className="size-3.5" />
              Guardar
            </button>
          </form>
        </WithBioPreview>
      </div>
    </div>
  );
}
