import { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Shared section wrapper — title + optional description above a bordered panel.
 * Used by every settings tab to keep vertical rhythm consistent.
 */
export default function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <div className="space-y-1 pb-8 border-b border-[var(--border)] last:border-0 last:pb-0">
      {/* Section heading */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}