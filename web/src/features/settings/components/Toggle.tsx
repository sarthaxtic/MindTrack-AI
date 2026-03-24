"use client";

import { clsx } from "clsx";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Accessible toggle switch using a visually-hidden checkbox.
 * Uses CSS-variable design tokens — no Tailwind arbitrary values needed.
 */
export default function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      {/* Visually hidden native checkbox for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />

      {/* Track */}
      <span
        className={clsx(
          "relative inline-flex h-5 w-9 items-center rounded-full",
          "transition-all duration-200",
          checked
            ? "bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]"
            : "bg-[var(--surface-raised)] border border-[var(--border)]",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        {/* Thumb */}
        <span
          className={clsx(
            "inline-block size-3.5 rounded-full bg-white",
            "transition-transform duration-200 shadow-sm",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </span>

      {label && (
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      )}
    </label>
  );
}