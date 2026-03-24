"use client";

import { useState, useEffect } from "react";
import { Camera, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SettingsSection from "./SettingsSection";
import { api } from "@/lib/axios";

export default function ProfileTab() {
  const { user, setAuth, token } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalName, setOriginalName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const startEditing = () => {
    setOriginalName(name);
    setOriginalEmail(email);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setName(originalName);
    setEmail(originalEmail);
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/user/profile", { name, email });
      setAuth(
        { ...user!, name: res.data.name, email: res.data.email },
        token!
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Both fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await api.post("/user/password", { currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <SettingsSection title="Avatar" description="Shown next to your name across the platform.">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="size-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-[#080c10] text-xl font-bold shrink-0"
              style={{ boxShadow: "0 0 20px var(--accent-glow)" }}
            >
              {(user?.email ?? "U").charAt(0).toUpperCase()}
            </div>
            <button
              className="absolute -bottom-1 -right-1 size-6 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--border-active)] transition-colors"
              aria-label="Change avatar"
            >
              <Camera size={11} className="text-[var(--text-secondary)]" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text)]">{user?.email ?? "Unknown"}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Free plan
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Profile fields */}
      <SettingsSection title="Personal information" description="Update your display name and email address.">
        <div className="space-y-4 max-w-sm">
          <Input
            label="Display name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? "bg-(--surface-raised) cursor-default" : ""}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            className={!isEditing ? "bg-(--surface-raised) cursor-default" : ""}
          />
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button loading={saving} onClick={handleSaveProfile} size="sm">
                  Save changes
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={cancelEditing}
                  icon={<X size={13} />}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={startEditing}
                icon={<Pencil size={13} />}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Password */}
      <SettingsSection title="Password" description="Change your account password.">
        <div className="space-y-4 max-w-sm">
          <Input
            label="Current password"
            type="password"
            showPasswordToggle
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            showPasswordToggle
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={changingPassword}
            onClick={handleChangePassword}
          >
            Update password
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}