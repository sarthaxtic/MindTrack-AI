import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "error";

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  status: LocationStatus;
  error: string | null;
  lastUpdated: number | null;

  setLocation: (lat: number, lng: number, name?: string) => void;
  setStatus: (status: LocationStatus) => void;
  setError: (error: string) => void;
  clearLocation: () => void;
}

/** TTL for cached location — 10 minutes */
export const LOCATION_CACHE_TTL_MS = 10 * 60 * 1000;

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      locationName: null,
      status: "idle" as LocationStatus,
      error: null,
      lastUpdated: null,

      setLocation: (lat, lng, name) =>
        set({
          latitude: lat,
          longitude: lng,
          locationName: name ?? null,
          status: "granted",
          error: null,
          lastUpdated: Date.now(),
        }),

      setStatus: (status) => set({ status }),

      setError: (error) =>
        set({ status: "error", error }),

      clearLocation: () =>
        set({
          latitude: null,
          longitude: null,
          locationName: null,
          status: "idle",
          error: null,
          lastUpdated: null,
        }),
    }),
    {
      name: "mindtrack-location",
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        locationName: state.locationName,
        lastUpdated: state.lastUpdated,
        // Don't persist status/error — re-derive on next load
      }),
    }
  )
);
