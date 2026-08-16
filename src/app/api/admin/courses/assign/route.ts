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

    const [student, course] = await Promise.all([
      prisma.user.findFirst({ where: { id: userId, role: "STUDENT" }, select: { id: true } }),
      prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }),
    ]);
    if (!student || !course) return NextResponse.json({ error: "Student or course not found" }, { status: 404 });

    const existing = await prisma.courseAccess.findFirst({ where: { userId, courseId } });
    if (existing) {
      if (existing.status !== "ACTIVE") {
        await prisma.courseAccess.update({ where: { id: existing.id }, data: { status: "ACTIVE" } });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "This course is already assigned to this student" }, { status: 409 });
    }

    await prisma.courseAccess.create({ data: { userId, courseId, status: "ACTIVE" } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assign course error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
