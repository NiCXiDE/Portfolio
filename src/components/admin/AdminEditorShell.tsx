"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n/config";
import { formDataToDraft, type Draft } from "@/components/admin/draft";

type Props = {
  children: ReactNode;
  /** Extra keys to seed into draft before first input (e.g. hidden fields already present) */
  initialDraft?: Draft;
  showLocaleToggle?: boolean;
  renderPreview: (draft: Draft, locale: Locale) => ReactNode;
  className?: string;
};

export function AdminEditorShell({
  children,
  initialDraft = {},
  showLocaleToggle = true,
  renderPreview,
  className = "",
}: Props) {
  const formWrapRef = useRef<HTMLDivElement>(null);
  const seedRef = useRef(initialDraft);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [locale, setLocale] = useState<Locale>("es");
  const [previewOpen, setPreviewOpen] = useState(true);

  const sync = useCallback(() => {
    const root = formWrapRef.current;
    if (!root) return;
    const form = root.querySelector("form");
    if (!form) return;
    setDraft({ ...seedRef.current, ...formDataToDraft(form) });
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  return (
    <div
      className={`grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] ${className}`}
    >
      <div
        ref={formWrapRef}
        onInput={sync}
        onChange={sync}
        className="min-w-0"
      >
        {children}
      </div>

      <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
        <div className="border border-ink/10 bg-sky-pale/60">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-3 py-2">
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-wide text-ink lg:pointer-events-none"
              onClick={() => setPreviewOpen((o) => !o)}
            >
              Vista previa {previewOpen ? "" : "(mostrar)"}
            </button>
            {showLocaleToggle ? (
              <div className="flex gap-1 text-xs">
                {(["es", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocale(l)}
                    className={`px-2 py-0.5 uppercase ${
                      locale === l
                        ? "bg-ink text-sky-pale"
                        : "bg-white/70 text-ink/70"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div
            className={`p-3 ${previewOpen ? "block" : "hidden lg:block"}`}
          >
            {renderPreview(draft, locale)}
          </div>
        </div>
      </aside>
    </div>
  );
}
