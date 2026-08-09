"use client";

import type { ReactNode } from "react";
import { AdminEditorShell } from "@/components/admin/AdminEditorShell";
import type { Draft } from "@/components/admin/draft";
import {
  BioPreview,
  GraphicItemPreview,
  ManualPreview,
  NamedListPreview,
  SettingsContactPreview,
  SocialPreview,
  TagPreview,
  TestimonialPreview,
  UiListPreview,
  UiProjectPreview,
} from "@/components/admin/previews";
import type { BrandRef } from "@/lib/brands";

type WrapProps = {
  children: ReactNode;
  initialDraft?: Draft;
  showLocaleToggle?: boolean;
};

type UiProjectWrapProps = WrapProps & {
  brands?: BrandRef[];
};

export function WithGraphicPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      renderPreview={(draft, locale) => (
        <GraphicItemPreview draft={draft} locale={locale} />
      )}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithTestimonialPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      renderPreview={(draft, locale) => (
        <TestimonialPreview draft={draft} locale={locale} />
      )}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithBioPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      renderPreview={(draft, locale) => (
        <BioPreview draft={draft} locale={locale} />
      )}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithManualPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      renderPreview={(draft, locale) => (
        <ManualPreview draft={draft} locale={locale} />
      )}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithUiProjectPreview({
  children,
  initialDraft,
  brands = [],
}: UiProjectWrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      renderPreview={(draft, locale) => (
        <UiProjectPreview draft={draft} locale={locale} brands={brands} />
      )}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithUiListPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      renderPreview={(draft, locale) => (
        <UiListPreview draft={draft} locale={locale} />
      )}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithNamedListPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      showLocaleToggle={false}
      renderPreview={(draft) => <NamedListPreview draft={draft} />}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithTagPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      renderPreview={(draft, locale) => (
        <TagPreview draft={draft} locale={locale} />
      )}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithSettingsPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      renderPreview={(draft, locale) => (
        <SettingsContactPreview draft={draft} locale={locale} />
      )}
    >
      {children}
    </AdminEditorShell>
  );
}

export function WithSocialPreview({ children, initialDraft }: WrapProps) {
  return (
    <AdminEditorShell
      initialDraft={initialDraft}
      showLocaleToggle={false}
      renderPreview={(draft) => <SocialPreview draft={draft} />}
    >
      {children}
    </AdminEditorShell>
  );
}
