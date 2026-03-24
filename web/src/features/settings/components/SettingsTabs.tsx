"use client";

import { clsx } from "clsx";
import { SETTINGS_TABS, type SettingsTabId } from "@/constants/dashboard";

interface SettingsTabsProps {
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
}

export default function SettingsTabs({ active, onChange }: SettingsTabsProps) {
  return (
    <nav
      className="flex flex-col gap-0.5"
      aria-label="Settings sections"
    >
      <p
        className="px-3 pb-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Sections
      </p>

      {SETTINGS_TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={clsx(
            "w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-sm",
            "transition-all duration-150",
            active === id
              ? "bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border-active)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]"
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}