import { AnalysisResponse, MentalState } from "@/features/posts/types/post.types";

// ─── Severity levels ─────────────────────────────────────────────────────────
export type SeverityLevel = "normal" | "mild" | "moderate" | "severe" | "critical";

export interface SeverityInfo {
  level: SeverityLevel;
  label: string;
  color: string;          // Tailwind text colour class
  bgColor: string;        // Tailwind bg colour class
  borderColor: string;    // Tailwind border colour class
  showSuggestions: boolean;
  showHospitals: boolean;
  showEmergency: boolean;
}

const HIGH_RISK: MentalState[] = ["Depression", "Bipolar"];
const MODERATE_RISK: MentalState[] = ["Anxiety", "Stress"];

export function getSeverity(analysis: AnalysisResponse): SeverityInfo {
  const { prediction, confidence } = analysis;

  if (prediction === "Neutral") {
    return {
      level: "normal",
      label: "Normal",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/25",
      showSuggestions: false,
      showHospitals: false,
      showEmergency: false,
    };
  }

  if (HIGH_RISK.includes(prediction) && confidence >= 0.85) {
    return {
      level: "critical",
      label: "Critical",
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      showSuggestions: true,
      showHospitals: true,
      showEmergency: true,
    };
  }

  if (HIGH_RISK.includes(prediction) && confidence >= 0.6) {
    return {
      level: "severe",
      label: "Severe",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/25",
      showSuggestions: true,
      showHospitals: true,
      showEmergency: false,
    };
  }

  if (
    (HIGH_RISK.includes(prediction) && confidence < 0.6) ||
    (MODERATE_RISK.includes(prediction) && confidence >= 0.6)
  ) {
    return {
      level: "moderate",
      label: "Moderate",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/25",
      showSuggestions: true,
      showHospitals: false,
      showEmergency: false,
    };
  }

  // mild: Anxiety/Stress with low confidence
  return {
    level: "mild",
    label: "Mild",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/25",
    showSuggestions: true,
    showHospitals: false,
    showEmergency: false,
  };
}
