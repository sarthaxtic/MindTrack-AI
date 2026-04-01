import { AnalysisResponse, MentalState } from "@/features/posts/types/post.types";

export interface NearbyTherapist {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  phone: string;
  email: string;
  address: string;
  distanceKm: number;
  available: boolean;
  nextAvailable: string;
  avatar: string;
}

// High-risk states that trigger therapist auto-message
const HIGH_RISK_STATES: MentalState[] = ["Depression", "Bipolar"];
const MODERATE_RISK_STATES: MentalState[] = ["Anxiety", "Stress"];
const HIGH_RISK_CONFIDENCE_THRESHOLD = 0.75;
const MODERATE_RISK_CONFIDENCE_THRESHOLD = 0.9;

export function shouldSendTherapistAlert(analysis: AnalysisResponse): boolean {
  if (
    HIGH_RISK_STATES.includes(analysis.prediction) &&
    analysis.confidence >= HIGH_RISK_CONFIDENCE_THRESHOLD
  ) {
    return true;
  }
  if (
    MODERATE_RISK_STATES.includes(analysis.prediction) &&
    analysis.confidence >= MODERATE_RISK_CONFIDENCE_THRESHOLD
  ) {
    return true;
  }
  return false;
}

export function buildTherapistAlertMessage(
  analysis: AnalysisResponse,
  therapist: NearbyTherapist
): string {
  const pct = Math.round(analysis.confidence * 100);
  const signals = analysis.explanation.slice(0, 3).join(", ");
  return (
    `Dear ${therapist.name},\n\n` +
    `[URGENT AUTO-ALERT] A MindTrack-AI user has been flagged with a high-risk mental health signal ` +
    `and may need immediate support.\n\n` +
    `Detection: ${analysis.prediction} (${pct}% confidence)\n` +
    `Key signals: ${signals}\n\n` +
    `Please reach out to the user at your earliest convenience.\n\n` +
    `— MindTrack-AI Alert System`
  );
}

const NEARBY_THERAPISTS: NearbyTherapist[] = [
  {
    id: "t1",
    name: "Dr. Meera Kapoor",
    title: "Clinical Psychologist",
    specialization: ["Depression", "Anxiety", "Trauma"],
    phone: "+91 98200 11234",
    email: "dr.kapoor@mindwell.in",
    address: "12 Wellness Plaza, Andheri West, Mumbai",
    distanceKm: 1.4,
    available: true,
    nextAvailable: "Today, 4:00 PM",
    avatar: "MK",
  },
  {
    id: "t2",
    name: "Dr. Vikram Nair",
    title: "Psychiatrist",
    specialization: ["Bipolar", "Schizophrenia", "Mood Disorders"],
    phone: "+91 99876 54321",
    email: "dr.nair@healingminds.in",
    address: "8 Serenity Towers, Bandra East, Mumbai",
    distanceKm: 2.1,
    available: true,
    nextAvailable: "Today, 6:30 PM",
    avatar: "VN",
  },
  {
    id: "t3",
    name: "Ms. Pooja Desai",
    title: "Counseling Psychologist",
    specialization: ["Stress", "Burnout", "Relationships"],
    phone: "+91 91234 67890",
    email: "pooja.desai@mindbridge.in",
    address: "3 Hope Lane, Powai, Mumbai",
    distanceKm: 3.7,
    available: false,
    nextAvailable: "Tomorrow, 10:00 AM",
    avatar: "PD",
  },
];

export function getNearbyTherapists(
  analysis: AnalysisResponse,
  userLat?: number,
  userLng?: number
): NearbyTherapist[] {
  const prediction = analysis.prediction;

  // If user coordinates are available, recalculate simulated distances
  // based on the user's actual position.
  const therapists: NearbyTherapist[] = userLat !== undefined && userLng !== undefined
    ? NEARBY_THERAPISTS.map((t, i) => {
        // Simple distance simulation using coordinate offsets
        const offsets = [
          { dlat: 0.01, dlng: 0.015 },
          { dlat: -0.02, dlng: 0.01 },
          { dlat: 0.03, dlng: -0.02 },
        ];
        const off = offsets[i % offsets.length];
        const dlat = off.dlat;
        const dlng = off.dlng;
        const distanceKm = parseFloat(
          // 111 km is the approximate distance per degree of latitude/longitude
          // (rough estimate; does not account for Earth's curvature at different latitudes).
          (Math.sqrt(dlat * dlat + dlng * dlng) * 111).toFixed(1)
        );
        return { ...t, distanceKm };
      })
    : [...NEARBY_THERAPISTS];

  return therapists.sort((a, b) => {
    const aMatch = a.specialization.includes(prediction) ? -1 : 0;
    const bMatch = b.specialization.includes(prediction) ? -1 : 0;
    if (aMatch !== bMatch) return aMatch - bMatch;
    if (a.available !== b.available) return a.available ? -1 : 1;
    return a.distanceKm - b.distanceKm;
  });
}
