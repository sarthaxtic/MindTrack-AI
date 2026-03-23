"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";
import PostAnalyzer from "@/features/dashboard/components/PostAnalyzer";
import StatsCards from "@/features/dashboard/components/StatsCards";
import HistoryList from "@/features/dashboard/components/HistoryList";
import { HistoryItem } from "@/features/dashboard/types/history.types";

const dummyHistory: HistoryItem[] = [
  {
    id: "1",
    text: "I feel very sad and tired",
    prediction: "Depression",
    confidence: 0.8,
    explanation: [],
    createdAt: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  const user = useRequireAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <StatsCards />

        <PostAnalyzer />

        <div>
          <h2 className="text-lg font-semibold mb-2">
            Recent Analyses
          </h2>
          <HistoryList data={dummyHistory} />
        </div>
      </div>
    </DashboardLayout>
  );
}