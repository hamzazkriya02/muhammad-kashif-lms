import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await readJsonObject(request);
    const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
    const completed = body?.completed === true;
    if (!lessonId) return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        section: {
          course: {
            courseAccess: {
              some: {
                userId: currentUser.id,
                status: "ACTIVE",
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!lesson) return NextResponse.json({ error: "You do not have access to this lesson" }, { status: 403 });

    const progress = await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: currentUser.id, lessonId } },
      update: { percent: completed ? 100 : 0, completedAt: completed ? new Date() : null },
      create: { userId: currentUser.id, lessonId, percent: completed ? 100 : 0, completedAt: completed ? new Date() : null },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
