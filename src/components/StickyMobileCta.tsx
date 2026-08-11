"use client";

type Props = {
  label: string;
  onContact: () => void;
};

/** Fixed contact control for small screens (safe-area aware). */
export function StickyMobileCta({ label, onContact }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <button
        type="button"
        onClick={onContact}
        className="pointer-events-auto min-w-[10rem] bg-ink px-5 py-2.5 text-sm font-medium text-sky-pale shadow-md transition-opacity hover:opacity-90"
      >
        {label}
      </button>
    </div>
  );
}
