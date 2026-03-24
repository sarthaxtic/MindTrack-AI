// features/settings/components/DangerTab.tsx
"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";
import { api } from "@/lib/axios";

export default function DangerTab() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const CONFIRM_PHRASE = "delete my account";
  const canDelete = confirmText.toLowerCase() === CONFIRM_PHRASE;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.post("/user/export", undefined, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "mindtrack-data.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (err) {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure? This will delete all your analysis history and cannot be undone.")) return;
    setClearing(true);
    try {
      await api.delete("/user/history");
      toast.success("History cleared");
      // Optionally refresh dashboard (maybe via event bus, but user can refresh manually)
    } catch (err) {
      toast.error("Failed to clear history");
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await api.delete("/user/account");
      logout();
      toast.success("Account deleted");
      router.push("/");
    } catch (err) {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Export data */}
      <SettingsSection title="Export your data" description="Download all your analysis history as a JSON file.">
        <SettingsRow
          label="Analysis history"
          description="All past post analyses, predictions, and confidence scores."
          control={
            <Button variant="secondary" size="sm" icon={<Download size={13} />} loading={exporting} onClick={handleExport}>
              Download JSON
            </Button>
          }
        />
      </SettingsSection>

      {/* Clear history */}
      <SettingsSection title="Clear history" description="Permanently delete all analysis history. This cannot be undone.">
        <SettingsRow
          label="Delete all analyses"
          description={`Removes all ${0} stored analyses from your account.`} // we could fetch count
          control={
            <Button variant="danger" size="sm" loading={clearing} onClick={handleClearHistory}>
              Clear history
            </Button>
          }
        />
      </SettingsSection>

      {/* Delete account */}
      <SettingsSection title="Delete account">
        <div className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-red-500/8 border border-red-500/20 mb-5">
          <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 leading-relaxed">
            This will permanently delete your account, all analyses, and your API key. This action <strong>cannot</strong> be undone.
          </p>
        </div>
        <div className="space-y-4 max-w-sm">
          <Input
            label={`Type "${CONFIRM_PHRASE}" to confirm`}
            placeholder={CONFIRM_PHRASE}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <Button variant="danger" size="sm" icon={<Trash2 size={13} />} disabled={!canDelete} loading={deleting} onClick={handleDeleteAccount}>
            Permanently delete account
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}