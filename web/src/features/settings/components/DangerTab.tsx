"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";

export default function DangerTab() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const CONFIRM_PHRASE = "delete my account";
  const canDelete = confirmText.toLowerCase() === CONFIRM_PHRASE;

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setUser(null);
    toast.error("Account deleted.");
    router.push("/");
  };

  return (
    <div className="space-y-8">
      {/* Export data */}
      <SettingsSection
        title="Export your data"
        description="Download all your analysis history as a JSON file."
      >
        <SettingsRow
          label="Analysis history"
          description="All past post analyses, predictions, and confidence scores."
          control={
            <Button variant="secondary" size="sm">
              Download JSON
            </Button>
          }
        />
      </SettingsSection>

      {/* Clear history */}
      <SettingsSection
        title="Clear history"
        description="Permanently delete all analysis history. This cannot be undone."
      >
        <SettingsRow
          label="Delete all analyses"
          description="Removes all 24 stored analyses from your account."
          control={
            <Button variant="danger" size="sm">
              Clear history
            </Button>
          }
        />
      </SettingsSection>

      {/* Delete account */}
      <SettingsSection title="Delete account">
        {/* Warning banner */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)]
                     bg-red-500/8 border border-red-500/20 mb-5"
        >
          <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 leading-relaxed">
            This will permanently delete your account, all analyses, and your
            API key. This action <strong>cannot</strong> be undone.
          </p>
        </div>

        <div className="space-y-4 max-w-sm">
          <Input
            label={`Type "${CONFIRM_PHRASE}" to confirm`}
            placeholder={CONFIRM_PHRASE}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />

          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={13} />}
            disabled={!canDelete}
            loading={deleting}
            onClick={handleDelete}
          >
            Permanently delete account
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}