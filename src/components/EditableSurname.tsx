"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT = "Ayala";
const MAX_CHARS = 50;
/** ~80 WPM → ~400 chars/min → ~150ms per character */
const MS_PER_CHAR = 150;

export function EditableSurname() {
  const ref = useRef<HTMLSpanElement>(null);
  const idleTimer = useRef<number | null>(null);
  const typeTimer = useRef<number | null>(null);
  const typing = useRef(false);
  /** Espejo del texto para el ancho flexible del layout / selección */
  const [layoutText, setLayoutText] = useState("");

  const clearTimers = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    if (typeTimer.current) window.clearTimeout(typeTimer.current);
    idleTimer.current = null;
    typeTimer.current = null;
  };

  const syncLayout = (text: string) => {
    setLayoutText(text);
  };

  const typewrite = (text: string) => {
    const el = ref.current;
    if (!el) return;
    typing.current = true;
    clearTimers();
    el.textContent = "";
    syncLayout("");
    window.getSelection()?.removeAllRanges();

    let i = 0;
    const step = () => {
      if (!ref.current) return;
      i += 1;
      const next = text.slice(0, i);
      ref.current.textContent = next;
      syncLayout(next);
      if (i < text.length) {
        typeTimer.current = window.setTimeout(step, MS_PER_CHAR);
      } else {
        typing.current = false;
      }
    };
    typeTimer.current = window.setTimeout(step, MS_PER_CHAR);
  };

  const resetWithTypewriter = () => {
    const el = ref.current;
    if (!el) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection?.removeAllRanges();
    selection?.addRange(range);

    window.setTimeout(() => {
      selection?.removeAllRanges();
      typewrite(DEFAULT);
    }, 280);
  };

  const scheduleReset = () => {
    if (typing.current) return;
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      const text = (ref.current?.textContent ?? "").replace(/\n/g, "").trim();
      if (text !== DEFAULT) resetWithTypewriter();
    }, 2000);
  };

  const sanitize = (raw: string) =>
    raw.replace(/[\r\n]+/g, "").slice(0, MAX_CHARS);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Al cargar: typewriter, no aparición instantánea
    typewrite(DEFAULT);

    const onFocus = () => {
      if (typing.current) return;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection?.removeAllRanges();
      selection?.addRange(range);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        return;
      }
      if (
        (el.textContent?.length ?? 0) >= MAX_CHARS &&
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
      }
    };

    el.addEventListener("focus", onFocus);
    el.addEventListener("keydown", onKeyDown);
    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("keydown", onKeyDown);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  return (
    <div className="relative shrink-0">
      {/* Ghost: mismo texto que se escribe → el contenedor / selección crece con el contenido */}
      <span
        className="name-hero-text invisible block select-none whitespace-nowrap border border-transparent px-1.5 pb-1.5 pt-1 sm:px-2.5 sm:pb-2 sm:pt-1.5"
        aria-hidden
      >
        {layoutText || "\u00A0"}
      </span>
      <div className="surname-box absolute left-0 top-0 inline-flex min-w-full items-end whitespace-nowrap border border-blue-select px-1.5 pb-1.5 pt-1 sm:px-2.5 sm:pb-2 sm:pt-1.5">
        <span
          ref={ref}
          role="textbox"
          tabIndex={0}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          aria-label="Apellido editable"
          className="surname-edit name-hero-text block whitespace-nowrap text-ink outline-none"
          onInput={(e) => {
            if (typing.current) return;
            const el = e.currentTarget;
            const cleaned = sanitize(el.textContent ?? "");
            if (cleaned !== el.textContent) {
              el.textContent = cleaned;
              const range = document.createRange();
              range.selectNodeContents(el);
              range.collapse(false);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
            syncLayout(cleaned);
            scheduleReset();
          }}
          onKeyUp={() => {
            if (typing.current) return;
            scheduleReset();
          }}
          onBlur={() => {
            if (typing.current) return;
            if (!(ref.current?.textContent ?? "").trim()) {
              typewrite(DEFAULT);
            }
          }}
        />
        <span
          className="surname-handle pointer-events-none absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 border border-blue-select bg-white sm:size-3"
          aria-hidden
        />
        <span
          className="surname-handle pointer-events-none absolute bottom-0 left-0 size-2.5 -translate-x-1/2 translate-y-1/2 border border-blue-select bg-white sm:size-3"
          aria-hidden
        />
        <span
          className="surname-handle pointer-events-none absolute right-0 top-0 size-2.5 translate-x-1/2 -translate-y-1/2 border border-blue-select bg-white sm:size-3"
          aria-hidden
        />
        <span
          className="surname-handle pointer-events-none absolute bottom-0 right-0 size-2.5 translate-x-1/2 translate-y-1/2 border border-blue-select bg-white sm:size-3"
          aria-hidden
        />
        <span
          className="surname-baseline pointer-events-none absolute bottom-[22%] left-2 right-2 h-px bg-blue-select/80"
          aria-hidden
        />
      </div>
    </div>
  );
}
