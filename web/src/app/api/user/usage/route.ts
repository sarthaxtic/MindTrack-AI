import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Count analyses created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const requests = await Analysis.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth },
    });

    const limit = 500; // Free plan limit

    return NextResponse.json({ requests, limit });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}