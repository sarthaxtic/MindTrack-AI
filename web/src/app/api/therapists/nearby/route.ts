import { NextRequest, NextResponse } from "next/server";
import { haversineDistance } from "@/services/locationService";
import type { TherapistWithDistance } from "@/types/therapist.types";

/**
 * GET /api/therapists/nearby?lat=<lat>&lng=<lng>&radius=<km>
 *
 * Fetches mental health professionals exclusively from Google Places API.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius") ?? "25";

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "lat and lng query parameters are required" },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const radiusKm = parseFloat(radiusStr);

  if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
    return NextResponse.json(
      { error: "lat, lng, and radius must be valid numbers" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY is missing. Returning empty list.");
    return NextResponse.json([]);
  }

  const radiusMeters = Math.min(Math.round(radiusKm * 1000), 50000); // 50km max for Places API

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.append("location", `${lat},${lng}`);
    url.searchParams.append("radius", radiusMeters.toString());
    url.searchParams.append("keyword", "therapist OR psychologist OR psychiatrist OR counsellor");
    url.searchParams.append("key", apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for an hour to save quota
    });

    if (!res.ok) {
      throw new Error(`Google Places API returned ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || ""}`);
    }

    const results = data.results || [];
    const userCoords = { lat, lng };

    const formattedTherapists: TherapistWithDistance[] = results.map((place: any) => {
      const pLat = place.geometry?.location?.lat || 0;
      const pLng = place.geometry?.location?.lng || 0;
      const dist = haversineDistance(userCoords, { lat: pLat, lng: pLng });

      return {
        id: place.place_id,
        name: place.name,
        title: "Mental Health Professional",
        specializations: ["Counseling", "Therapy"], 
        credentials: ["Google Verified"],
        languages: ["English"],
        experience: "Clinic / Office",
        bio: `Located at ${place.vicinity}. Verified via Google Maps.`,
        avatar: place.name.charAt(0).toUpperCase(),
        email: "Contact via Maps",
        phone: "See Google Maps",
        clinicName: place.name,
        clinicAddress: place.vicinity || "Address not provided",
        city: "Local area",
        coordinates: { lat: pLat, lng: pLng },
        available: place.business_status === "OPERATIONAL",
        nextAvailable: new Date().toISOString(),
        availabilitySlots: [],
        fee: "Contact for pricing",
        rating: place.rating || 0,
        reviews: place.user_ratings_total || 0,
        distanceKm: Number(dist.toFixed(1)),
      };
    });

    // Filter by our exact radius request and sort
    const finalTherapists = formattedTherapists
      .filter((t) => t.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json(finalTherapists);
  } catch (err) {
    console.error("GET /api/therapists/nearby error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
