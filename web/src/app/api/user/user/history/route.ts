import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const result = await Analysis.deleteMany({ userId });

    return NextResponse.json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Clear history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}