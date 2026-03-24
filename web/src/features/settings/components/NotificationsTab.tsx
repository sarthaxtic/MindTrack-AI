// features/settings/components/NotificationsTab.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";
import Toggle from "./Toggle";
import { NOTIFICATION_PREFS } from "@/constants/dashboard";
import { api } from "@/lib/axios";

type PrefState = Record<string, boolean>;

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState<PrefState>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.get("/user/notifications");
        setPrefs(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load notification preferences");
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const toggle = (id: string, val: boolean) => setPrefs((p) => ({ ...p, [id]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/user/notifications", prefs);
      toast.success("Notification preferences saved.");
    } catch (err) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted">Loading preferences...</div>;
  }

  return (
    <div className="space-y-8">
      <SettingsSection title="Email notifications" description="Choose which events trigger an email to your inbox.">
        {NOTIFICATION_PREFS.map((pref) => (
          <SettingsRow
            key={pref.id}
            label={pref.label}
            description={pref.description}
            control={<Toggle checked={prefs[pref.id] ?? false} onChange={(val) => toggle(pref.id, val)} />}
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