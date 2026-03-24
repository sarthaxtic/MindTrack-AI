"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SettingsSection from "./SettingsSection";

export default function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Stub — replace with real API call
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Profile updated.");
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <SettingsSection
        title="Avatar"
        description="Shown next to your name across the platform."
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="size-16 rounded-full bg-[var(--accent)] flex items-center
                         justify-content:center justify-center text-[#080c10]
                         text-xl font-bold shrink-0"
              style={{ boxShadow: "0 0 20px var(--accent-glow)" }}
            >
              {(user?.email ?? "U").charAt(0).toUpperCase()}
            </div>
            {/* Upload overlay */}
            <button
              className="absolute -bottom-1 -right-1 size-6 rounded-full
                         bg-[var(--surface-raised)] border border-[var(--border)]
                         flex items-center justify-center
                         hover:border-[var(--border-active)] transition-colors"
              aria-label="Change avatar"
            >
              <Camera size={11} className="text-[var(--text-secondary)]" />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--text)]">
              {user?.email ?? "Unknown"}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Free plan · Member since 2025
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Profile fields */}
      <SettingsSection
        title="Personal information"
        description="Update your display name and email address."
      >
        <div className="space-y-4 max-w-sm">
          <Input
            label="Display name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button loading={saving} onClick={handleSave} size="sm">
            Save changes
          </Button>
        </div>
      </SettingsSection>

      {/* Password */}
      <SettingsSection
        title="Password"
        description="Change your account password."
      >
        <div className="space-y-4 max-w-sm">
          <Input
            label="Current password"
            type="password"
            showPasswordToggle
            placeholder="••••••••"
          />
          <Input
            label="New password"
            type="password"
            showPasswordToggle
            placeholder="Min. 6 characters"
          />

          <Button variant="secondary" size="sm">
            Update password
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}