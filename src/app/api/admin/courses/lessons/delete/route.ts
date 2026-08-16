import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await readJsonObject(request);
    const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
    if (!lessonId) return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    await prisma.lesson.delete({ where: { id: lessonId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
