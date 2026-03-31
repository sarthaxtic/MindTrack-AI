import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Analysis } from "@/models/Analysis";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Delete user and all related analyses
    await Promise.all([
      User.findByIdAndDelete(userId),
      Analysis.deleteMany({ userId }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}