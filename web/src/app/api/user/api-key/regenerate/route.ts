import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserIdFromRequest } from "@/lib/auth";
import crypto from "crypto";

function generateApiKey(): string {
  const random = crypto.randomBytes(32).toString("hex");
  return `mt_live_${random}`;
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const newKey = generateApiKey();
    const user = await User.findByIdAndUpdate(
      userId,
      { apiKey: newKey },
      { new: true }
    ).select("apiKey");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ apiKey: user.apiKey });
  } catch (error) {
    console.error("Regenerate API key error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}