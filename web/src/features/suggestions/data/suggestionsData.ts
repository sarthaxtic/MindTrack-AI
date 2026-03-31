// Re-export hospital data + counselors with simulated lat/lng for the suggestions panel
export { HOSPITALS, assignHospitalDistances } from "@/constants/hospitals";
export type { Hospital, HospitalWithDistance } from "@/constants/hospitals";

import { COUNSELLORS } from "@/constants/counsellors";

// Extend counselors with simulated coordinates (Mumbai-area defaults)
export const COUNSELLORS_WITH_LOCATION = COUNSELLORS.map((c, i) => ({
  ...c,
  baseLat: 19.076 + (i % 3) * 0.04,
  baseLng: 72.8777 + (i % 3) * 0.04,
}));
