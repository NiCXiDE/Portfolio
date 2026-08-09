"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type TextareaHTMLAttributes,
} from "react";
import { fieldClass } from "@/components/admin/FieldLabel";
import type { BrandRef } from "@/lib/brands";

type Props = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "value"
> & {
  name: string;
  value: string;
  onChange: (value: string) => void;
  brands: BrandRef[];
  hint?: string;
};

export function MentionTextarea({
  name,
  value,
  onChange,
  brands,
  className,
  ...rest
}: Props) {
  const listId = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [menuIndex, setMenuIndex] = useState(0);

  const matches = useMemo(() => {
    if (query == null) return [];
    const q = query.toLowerCase();
    return brands
      .filter(
        (b) =>
          b.id.includes(q) || b.name.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [brands, query]);

  useEffect(() => {
    setMenuIndex(0);
  }, [query]);

  function detectMention(text: string, caret: number) {
    const before = text.slice(0, caret);
    const m = before.match(/@([a-z0-9-]{0,64})$/i);
    if (!m) {
      setQuery(null);
      return;
    }
    setQuery(m[1]);
  }

  function insertBrand(brand: BrandRef) {
    const el = ref.current;
    if (!el) return;
    const caret = el.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const replaced = before.replace(/@([a-z0-9-]{0,64})$/i, `@${brand.id}`);
    const next = `${replaced}${after.startsWith(" ") ? after : ` ${after}`}`;
    onChange(next);
    setQuery(null);
    requestAnimationFrame(() => {
      const pos = replaced.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  return (
    <div className="relative">
      <textarea
        {...rest}
        ref={ref}
        name={name}
        value={value}
        className={className ?? fieldClass}
        onChange={(e) => {
          onChange(e.target.value);
          detectMention(e.target.value, e.target.selectionStart);
        }}
        onKeyUp={(e) => {
          detectMention(
            e.currentTarget.value,
            e.currentTarget.selectionStart,
          );
        }}
        onKeyDown={(e) => {
          if (query == null || !matches.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setMenuIndex((i) => (i + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setMenuIndex((i) => (i - 1 + matches.length) % matches.length);
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            insertBrand(matches[menuIndex]);
          } else if (e.key === "Escape") {
            setQuery(null);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => setQuery(null), 150);
        }}
      />
      {query != null && matches.length ? (
        <ul
          id={listId}
          className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-auto border border-ink/15 bg-white shadow-sm"
          role="listbox"
        >
          {matches.map((b, i) => (
            <li key={b.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === menuIndex}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                  i === menuIndex ? "bg-sky-pale" : "hover:bg-ink/5"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertBrand(b);
                }}
              >
                {b.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.logo}
                    alt=""
                    className="size-5 object-contain"
                  />
                ) : (
                  <span className="size-5 rounded bg-ink/10" />
                )}
                <span className="font-medium text-ink">{b.name}</span>
                <span className="text-xs text-ink/45">@{b.id}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-1 text-[0.65rem] text-ink/45">
        Escribí @ para citar una marca (ej. @push).
      </p>
    </div>
  );
}
