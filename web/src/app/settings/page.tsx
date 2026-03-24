"use client";

import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import SettingsTabs from "@/features/settings/components/SettingsTabs";
import ProfileTab from "@/features/settings/components/ProfileTab";
import NotificationsTab from "@/features/settings/components/NotificationsTab";
import ApiTab from "@/features/settings/components/ApiTab";
import DangerTab from "@/features/settings/components/DangerTab";
import { type SettingsTabId } from "@/constants/dashboard";

// Map tab id → component
const TAB_CONTENT: Record<SettingsTabId, React.ReactNode> = {
  profile:       <ProfileTab />,
  notifications: <NotificationsTab />,
  api:           <ApiTab />,
  danger:        <DangerTab />,
};

export default function SettingsPage() {
  const user = useRequireAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");

  if (!user) return null;

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account, notifications, and API access"
    >
      <div className="max-w-4xl flex gap-8">
        {/* Left: vertical tab nav */}
        <aside className="w-44 shrink-0">
          <SettingsTabs active={activeTab} onChange={setActiveTab} />
        </aside>

        {/* Right: tab content */}
        <div className="flex-1 min-w-0">
          {TAB_CONTENT[activeTab]}
        </div>
      </div>
    </DashboardLayout>
  );
}