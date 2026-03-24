"use client";

import { useState } from "react";
import { Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";

const DUMMY_KEY = "mt_live_sk_a7f3d9e2c1b4f8a0d5e6c9b2f3a7d1e4";

export default function ApiTab() {
  const [revealed, setRevealed] = useState(false);
  const [regenerating, setRegenerate] = useState(false);

  const maskedKey = revealed
    ? DUMMY_KEY
    : `${DUMMY_KEY.slice(0, 14)}${"•".repeat(24)}`;

  const copyKey = () => {
    navigator.clipboard.writeText(DUMMY_KEY);
    toast.success("API key copied to clipboard.");
  };

  const regenerateKey = async () => {
    setRegenerate(true);
    await new Promise((r) => setTimeout(r, 900));
    toast.success("API key regenerated.");
    setRegenerate(false);
  };

  return (
    <div className="space-y-8">
      {/* API key */}
      <SettingsSection
        title="API key"
        description="Use this key to authenticate requests to the MindTrack AI API."
      >
        {/* Key display */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)]
                     bg-[var(--surface-raised)] border border-[var(--border)]
                     mb-4"
        >
          <code
            className="flex-1 text-xs text-[var(--text-secondary)] truncate"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {maskedKey}
          </code>

          <button
            onClick={() => setRevealed((v) => !v)}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0"
            aria-label={revealed ? "Hide key" : "Reveal key"}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          <button
            onClick={copyKey}
            className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors shrink-0"
            aria-label="Copy key"
          >
            <Copy size={14} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw size={13} />}
            loading={regenerating}
            onClick={regenerateKey}
          >
            Regenerate key
          </Button>
          <p className="text-xs text-[var(--text-muted)]">
            Regenerating will invalidate the current key immediately.
          </p>
        </div>
      </SettingsSection>

      {/* Usage */}
      <SettingsSection
        title="Usage"
        description="Your API consumption for the current billing period."
      >
        <SettingsRow
          label="Requests this month"
          control={
            <span
              className="text-sm font-bold text-[var(--text)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              142
            </span>
          }
        />
        <SettingsRow
          label="Monthly limit"
          control={
            <span
              className="text-sm font-bold text-[var(--text)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              500
            </span>
          }
        />
        <SettingsRow
          label="Plan"
          control={<Badge variant="accent">Free</Badge>}
        />

        {/* Usage bar */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-xs text-[var(--text-muted)]"
               style={{ fontFamily: "var(--font-mono)" }}>
            <span>142 / 500 requests</span>
            <span>28%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--surface-raised)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: "28%" }}
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}