import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { cleanText, readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await readJsonObject(request);
    const courseId = typeof body?.courseId === "string" ? body.courseId : "";
    const title = cleanText(body?.title, 100);

    if (!courseId || title.length < 2) return NextResponse.json({ error: "Course and module title are required" }, { status: 400 });
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const sectionCount = await prisma.courseSection.count({ where: { courseId } });
    const section = await prisma.courseSection.create({ data: { courseId, title, sortOrder: sectionCount } });
    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error("Create module error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
