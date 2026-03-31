// features/settings/components/ApiTab.tsx
"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SettingsSection from "./SettingsSection";
import SettingsRow from "./SettingsRow";
import { api } from "@/lib/axios";

export default function ApiTab() {
  const [apiKey, setApiKey] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({ requests: 0, limit: 500 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [keyRes, usageRes] = await Promise.all([
          api.get("/user/api-key"),
          api.get("/user/usage"),
        ]);
        setApiKey(keyRes.data.apiKey);
        setUsage(usageRes.data);
      } catch (err) {
        toast.error("Failed to load API key data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maskedKey = revealed ? apiKey : `${apiKey.slice(0, 14)}${"•".repeat(Math.max(24, apiKey.length - 14))}`;

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard.");
  };

  const regenerateKey = async () => {
    setRegenerating(true);
    try {
      const res = await api.post("/user/api-key/regenerate");
      setApiKey(res.data.apiKey);
      toast.success("API key regenerated.");
    } catch (err) {
      toast.error("Failed to regenerate key");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted">Loading...</div>;
  }

  const percent = Math.round((usage.requests / usage.limit) * 100);

  return (
    <div className="space-y-8">
      {/* API key */}
      <SettingsSection title="API key" description="Use this key to authenticate requests to the MindTrack AI API.">
        <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--surface-raised)] border border-[var(--border)] mb-4">
          <code className="flex-1 text-xs text-[var(--text-secondary)] truncate" style={{ fontFamily: "var(--font-mono)" }}>
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
          <Button size="sm" variant="secondary" icon={<RefreshCw size={13} />} loading={regenerating} onClick={regenerateKey}>
            Regenerate key
          </Button>
          <p className="text-xs text-[var(--text-muted)]">Regenerating will invalidate the current key immediately.</p>
        </div>
      </SettingsSection>

      {/* Usage */}
      <SettingsSection title="Usage" description="Your API consumption for the current billing period.">
        <SettingsRow label="Requests this month" control={<span className="text-sm font-bold text-[var(--text)]">{usage.requests}</span>} />
        <SettingsRow label="Monthly limit" control={<span className="text-sm font-bold text-[var(--text)]">{usage.limit}</span>} />
        <SettingsRow label="Plan" control={<Badge variant="accent">Free</Badge>} />
        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>{usage.requests} / {usage.limit} requests</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--surface-raised)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}