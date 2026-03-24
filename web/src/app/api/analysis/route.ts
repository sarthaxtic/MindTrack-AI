import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Analysis } from "@/models/Analysis";
import { verifyToken } from "@/lib/auth";

// Helper to get userId from Authorization header
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    // Our token payload contains { id: user._id } from login/signup routes
    if (typeof decoded === "string") return null;
    return decoded.id as string;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Dummy AI (replace later)
    const result = text.includes("sad")
      ? {
          prediction: "Depression",
          confidence: 0.87,
          explanation: ["Negative sentiment detected"],
        }
      : {
          prediction: "Neutral",
          confidence: 0.65,
          explanation: ["Balanced tone"],
        };

    const saved = await Analysis.create({
      userId,
      text,
      ...result,
    });

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const history = await Analysis.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}