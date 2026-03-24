"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";
import Toggle from "./Toggle";
import { NOTIFICATION_PREFS } from "@/constants/dashboard";

type PrefState = Record<string, boolean>;

// Default all prefs to enabled
const DEFAULT_STATE: PrefState = Object.fromEntries(
  NOTIFICATION_PREFS.map((p) => [p.id, true])
);

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState<PrefState>(DEFAULT_STATE);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string, val: boolean) =>
    setPrefs((p) => ({ ...p, [id]: val }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Notification preferences saved.");
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <SettingsSection
        title="Email notifications"
        description="Choose which events trigger an email to your inbox."
      >
        {NOTIFICATION_PREFS.map((pref) => (
          <SettingsRow
            key={pref.id}
            label={pref.label}
            description={pref.description}
            control={
              <Toggle
                checked={prefs[pref.id] ?? false}
                onChange={(val) => toggle(pref.id, val)}
              />
            }
          />
        ))}

        <div className="pt-4">
          <Button size="sm" loading={saving} onClick={handleSave}>
            Save preferences
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}