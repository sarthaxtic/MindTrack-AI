import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // This endpoint is only called by the authenticated or internal frontend
  // to correctly render the Google Maps Embed Iframe!
  return NextResponse.json({ apiKey });
}
