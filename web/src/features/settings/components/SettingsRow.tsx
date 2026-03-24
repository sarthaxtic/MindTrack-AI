import { ReactNode } from "react";

interface SettingsRowProps {
  label: string;
  description?: string;
  /** Right-hand control — input, toggle, select, button, etc. */
  control: ReactNode;
}

/**
 * One labelled row inside a SettingsSection.
 * Label + description on the left, control on the right.
 */
export default function SettingsRow({
  label,
  description,
  control,
}: SettingsRowProps) {
  return (
    <div
      className="flex items-center justify-between gap-6 py-3
                 border-b border-[var(--border)] last:border-0"
    >
      <div className="min-w-0">
        <p className="text-sm text-[var(--text)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="shrink-0">{control}</div>
    </div>
  );
}