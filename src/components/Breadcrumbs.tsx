import Link from "next/link";

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({
  items,
  ariaLabel,
}: {
  items: Crumb[];
  ariaLabel: string;
}) {
  if (items.length < 2) return null;

  return (
    <nav aria-label={ariaLabel} className="text-sm text-ink/70">
      <ol
        className="flex flex-wrap items-center gap-x-1.5 gap-y-1"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li
              key={`${item.label}-${i}`}
              className="inline-flex items-center gap-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {i > 0 ? <span aria-hidden>/</span> : null}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="underline-offset-4 transition-opacity hover:opacity-100 hover:underline"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={last ? "font-medium text-ink" : undefined}
                  itemProp="name"
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(i + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
