// src/features/dashboard/components/StatsCards.tsx
"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";
import { HistoryItem } from "../types/history.types";

interface StatsCardsProps {
  history: HistoryItem[];
}

function computeStats(history: HistoryItem[]) {
  const total = history.length;
  const depression = history.filter((h) => h.prediction === "Depression").length;
  const anxiety = history.filter((h) => h.prediction === "Anxiety").length;
  const neutral = history.filter((h) => h.prediction === "Neutral").length;
  // For trend: compare last 7 days vs previous 7 days (if enough data)
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const lastWeekCount = history.filter((h) => new Date(h.createdAt) >= lastWeek).length;
  const previousWeekCount = history.filter(
    (h) => new Date(h.createdAt) >= previousWeek && new Date(h.createdAt) < lastWeek
  ).length;
  const trend = previousWeekCount === 0 ? 0 : (lastWeekCount - previousWeekCount) / previousWeekCount;
  const trendDirection = trend > 0 ? true : trend < 0 ? false : null;
  const trendText =
    trendDirection === true ? `${Math.round(trend * 100)}%` : trendDirection === false ? `${Math.round(Math.abs(trend) * 100)}%` : "0%";

  return {
    total,
    depression,
    anxiety,
    neutral,
    trendDirection,
    trendText,
  };
}

export default function StatsCards({ history }: StatsCardsProps) {
  const stats = computeStats(history);

  const statItems = [
    {
      label: "Total Analyses",
      value: stats.total,
      color: "accent" as const,
      up: null,
      trend: `last 7d`,
    },
    {
      label: "Depression",
      value: stats.depression,
      color: "danger" as const,
      up: stats.trendDirection,
      trend: stats.trendText,
    },
    {
      label: "Anxiety",
      value: stats.anxiety,
      color: "warning" as const,
      up: stats.trendDirection,
      trend: stats.trendText,
    },
    {
      label: "Neutral",
      value: stats.neutral,
      color: "success" as const,
      up: stats.trendDirection,
      trend: stats.trendText,
    },
  ];

  const colorMap = {
    accent: {
      bg: "bg-[var(--accent-dim)]",
      border: "border-[var(--border-active)]",
      text: "text-[var(--accent)]",
    },
    danger: {
      bg: "bg-red-500/8",
      border: "border-red-500/20",
      text: "text-red-400",
    },
    warning: {
      bg: "bg-amber-500/8",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
    success: {
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
    },
  } as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const colors = colorMap[stat.color];
        return (
          <div
            key={stat.label}
            className={clsx(
              "rounded-[var(--radius-lg)] p-5 border",
              "bg-[var(--surface)] border-[var(--border)]",
              "hover:border-[var(--border-active)] transition-colors duration-200"
            )}
          >
            <p
              className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {stat.label}
            </p>
            <p
              className={clsx("text-3xl font-bold tracking-tight", colors.text)}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {stat.value}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {stat.up === true && <TrendingUp size={11} className="text-emerald-400 shrink-0" />}
              {stat.up === false && <TrendingDown size={11} className="text-red-400 shrink-0" />}
              {stat.up === null && <Minus size={11} className="text-[var(--text-muted)] shrink-0" />}
              <span className="text-[11px] text-[var(--text-muted)]">{stat.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}