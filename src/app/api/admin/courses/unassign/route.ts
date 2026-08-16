import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await readJsonObject(request);
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const courseId = typeof body?.courseId === "string" ? body.courseId : "";
    if (!userId || !courseId) return NextResponse.json({ error: "Student and course are required" }, { status: 400 });
    await prisma.courseAccess.deleteMany({ where: { userId, courseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unassign course error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
