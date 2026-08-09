"use client";

import { Fragment, type ReactNode, useMemo } from "react";
import {
  BRAND_MENTION_RE,
  type BrandRef,
} from "@/lib/brands";

export function renderMentionedText(
  text: string,
  brandsById: Record<string, BrandRef>,
): ReactNode {
  if (!text) return null;
  const nodes: ReactNode[] = [];
  let last = 0;
  const re = new RegExp(BRAND_MENTION_RE.source, "gi");
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(
        <Fragment key={`t-${key++}`}>{text.slice(last, match.index)}</Fragment>,
      );
    }
    const id = match[1].toLowerCase();
    const brand = brandsById[id];
    if (brand) {
      const label = brand.name;
      if (brand.href) {
        nodes.push(
          <a
            key={`m-${key++}`}
            href={brand.href}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ink underline decoration-ink/30 underline-offset-2 transition-opacity hover:opacity-70"
          >
            {label}
          </a>,
        );
      } else {
        nodes.push(
          <span key={`m-${key++}`} className="font-semibold text-ink">
            {label}
          </span>,
        );
      }
    } else {
      nodes.push(
        <span key={`m-${key++}`} className="text-ink/50">
          {match[0]}
        </span>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    nodes.push(<Fragment key={`t-${key++}`}>{text.slice(last)}</Fragment>);
  }
  return nodes;
}

export function MentionedText({
  text,
  brands,
}: {
  text: string;
  brands: BrandRef[];
}) {
  const brandsById = useMemo(
    () => Object.fromEntries(brands.map((b) => [b.id, b])),
    [brands],
  );
  return <>{renderMentionedText(text, brandsById)}</>;
}
