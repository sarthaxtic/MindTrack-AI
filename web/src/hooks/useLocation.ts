"use client";

import { useEffect, useRef } from "react";
import {
  LOCATION_CACHE_TTL_MS,
  LocationStatus,
  useLocationStore,
} from "@/store/locationStore";

export interface UseLocationReturn {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  status: LocationStatus;
  error: string | null;
  refresh: () => void;
}

/**
 * Global location hook.
 * - Automatically requests the browser's geolocation on first mount.
 * - Reuses a cached location if it is fresher than LOCATION_CACHE_TTL_MS.
 * - Persists location to localStorage via Zustand's persist middleware.
 * - Exposes a `refresh` method to manually re-request the location.
 */
export function useLocation(): UseLocationReturn {
  const {
    latitude,
    longitude,
    locationName,
    status,
    error,
    lastUpdated,
    setLocation,
    setStatus,
    setError,
  } = useLocationStore();

  const hasRequestedRef = useRef(false);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setError("Could not determine your location. Please try again.");
        }
      },
      { timeout: 10000, maximumAge: LOCATION_CACHE_TTL_MS }
    );
  };

  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    // If we already have a fresh cached location, keep it
    if (
      latitude !== null &&
      longitude !== null &&
      lastUpdated !== null &&
      Date.now() - lastUpdated < LOCATION_CACHE_TTL_MS
    ) {
      // Restore status to "granted" since the store only persists coords
      if (status !== "granted") {
        setStatus("granted");
      }
      return;
    }

    requestLocation();
  // requestLocation is stable (defined outside the effect and never re-created),
  // and the store selectors are intentionally read only at mount time to avoid
  // re-running the effect on every location update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    latitude,
    longitude,
    locationName,
    status,
    error,
    refresh: requestLocation,
  };
}
