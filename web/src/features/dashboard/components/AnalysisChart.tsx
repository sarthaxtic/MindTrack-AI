// src/features/dashboard/components/AnalysisChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HistoryItem } from "../types/history.types";
import { MentalState } from "@/features/posts/types/post.types";

interface AnalysisChartProps {
  history: HistoryItem[];
}

// Type for a single data point in the chart
interface ChartDataPoint {
  day: string; // e.g., "03-24"
  Depression: number;
  Anxiety: number;
  Neutral: number;
  Bipolar: number;
  Stress: number;
}

// Type for the custom tooltip props (as received by recharts)
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

// Helper to get last 7 days (including today) in YYYY-MM-DD format
function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// Count occurrences per day and mental state
function computeChartData(history: HistoryItem[]): ChartDataPoint[] {
  const days = getLast7Days();
  const initial: Record<string, ChartDataPoint> = days.reduce((acc, day) => {
    acc[day] = {
      day: day.slice(5), // show "MM-DD"
      Depression: 0,
      Anxiety: 0,
      Neutral: 0,
      Bipolar: 0,
      Stress: 0,
    };
    return acc;
  }, {} as Record<string, ChartDataPoint>);

  history.forEach((item) => {
    const date = new Date(item.createdAt).toISOString().slice(0, 10);
    if (initial[date]) {
      // Safely increment the count for the prediction key
      const predictionKey = item.prediction as keyof ChartDataPoint;
      // TypeScript knows that ChartDataPoint has all mental states as keys,
      // so this is safe if item.prediction is one of those.
      // We cast the property value to number because it's definitely a number.
      (initial[date][predictionKey] as number) += 1;
    }
  });

  return Object.values(initial).sort((a, b) => a.day.localeCompare(b.day));
}

// Custom tooltip with proper typing
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-xs space-y-1"
      style={{ background: "var(--surface-raised)", fontFamily: "var(--font-mono)" }}
    >
      <p className="text-[var(--text-secondary)] mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-[var(--text-muted)]">{p.name}</span>
          <span className="text-[var(--text)] font-medium ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// Legend dot component
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

// Color mapping for mental states
const CHART_COLORS: Record<MentalState, string> = {
  Depression: "#ef4444", // red-500
  Anxiety: "#f59e0b", // amber-500
  Neutral: "#10b981", // emerald-500
  Bipolar: "#8b5cf6", // violet-500
  Stress: "#f97316", // orange-500
};

export default function AnalysisChart({ history }: AnalysisChartProps) {
  const data = computeChartData(history);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)] tracking-[-0.01em]">
            Signal breakdown
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Analyses by category, last 7 days
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(Object.entries(CHART_COLORS) as [MentalState, string][]).map(([key, color]) => (
            <LegendDot key={key} color={color} label={key} />
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%" barGap={2}>
          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="day"
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={24}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          {(Object.entries(CHART_COLORS) as [MentalState, string][]).map(([key, color]) => (
            <Bar
              key={key}
              dataKey={key}
              fill={color}
              radius={[3, 3, 0, 0]}
              fillOpacity={0.85}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}