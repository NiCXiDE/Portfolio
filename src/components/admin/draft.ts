import type { Locale } from "@/i18n/config";

export type Draft = Record<string, string | boolean>;

export function formDataToDraft(form: HTMLFormElement): Draft {
  const draft: Draft = {};

  for (const el of Array.from(form.elements)) {
    if (
      !(
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      )
    ) {
      continue;
    }
    const name = el.name;
    if (!name) continue;

    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      draft[name] = el.checked;
      continue;
    }

    if (el instanceof HTMLInputElement && el.type === "file") {
      const file = el.files?.[0];
      if (file) {
        draft[name] = URL.createObjectURL(file);
      }
      continue;
    }

    draft[name] = el.value;
  }

  return draft;
}

export function draftStr(draft: Draft, key: string, fallback = ""): string {
  const v = draft[key];
  if (typeof v === "boolean") return v ? "1" : "";
  return v ?? fallback;
}

export function draftBool(draft: Draft, key: string): boolean {
  const v = draft[key];
  return v === true || v === "on" || v === "true" || v === "1";
}

export function draftLoc(
  draft: Draft,
  esKey: string,
  enKey: string,
  locale: Locale,
): string {
  const es = draftStr(draft, esKey);
  const en = draftStr(draft, enKey);
  return locale === "en" ? en || es : es || en;
}

export function mediaSrc(path: string): string | null {
  const p = path.trim();
  if (!p) return null;
  if (/^https?:\/\//i.test(p) || p.startsWith("/")) return p;
  return `/${p}`;
}
