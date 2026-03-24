import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserIdFromRequest } from "@/lib/auth";
import crypto from "crypto";

function generateApiKey(): string {
  const random = crypto.randomBytes(32).toString("hex");
  return `mt_live_${random}`;
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userId).select("apiKey");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let apiKey = user.apiKey;
    if (!apiKey) {
      // Generate a new key if not present
      apiKey = generateApiKey();
      user.apiKey = apiKey;
      await user.save();
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("Get API key error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}