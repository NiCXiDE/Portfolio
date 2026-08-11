"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const { resolved, toggle } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex size-9 items-center justify-center text-ink transition-opacity hover:opacity-70 ${className}`}
    >
      {isDark ? (
        <Sun className="size-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="size-4" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
