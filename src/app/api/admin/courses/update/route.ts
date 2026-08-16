import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { cleanLongText, cleanText, readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await readJsonObject(request);
    const courseId = typeof body?.courseId === "string" ? body.courseId : "";
    const title = cleanText(body?.title, 100);
    const description = cleanLongText(body?.description, 1500);

    if (!courseId || title.length < 3) return NextResponse.json({ error: "Course ID and a valid title are required" }, { status: 400 });

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { title, description: description || null },
      select: { id: true, title: true, slug: true, description: true },
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
