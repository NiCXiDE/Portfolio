"use client";

type Props = {
  tags: string[];
  active: string | null;
  onChange: (tag: string | null) => void;
  labels: Record<string, string>;
  clearLabel: string;
};

export function TagFilter({
  tags,
  active,
  onChange,
  labels,
  clearLabel,
}: Props) {
  if (tags.length === 0) return null;

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      {tags.map((tag) => {
        const selected = active === tag;
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors md:text-sm ${
              selected
                ? "bg-ink text-sky-pale"
                : "bg-sky-pale text-ink hover:opacity-80"
            }`}
          >
            {labels[tag] ?? tag}
          </button>
        );
      })}
      {active && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-ink/60 underline underline-offset-2 hover:text-ink md:text-sm"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
