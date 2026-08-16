import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const now = new Date();
  const access = await prisma.courseAccess.findMany({
    where: {
      userId: currentUser.id,
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { assignedAt: "asc" },
    include: {
      course: {
        include: {
          sections: { orderBy: { sortOrder: "asc" }, include: { lessons: { orderBy: { sortOrder: "asc" } } } },
        },
      },
    },
  });

  const courses = access.map((item) => item.course);
  const lessonIds = courses.flatMap((course) => course.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id)));
  const progress = lessonIds.length
    ? await prisma.lessonProgress.findMany({ where: { userId: currentUser.id, lessonId: { in: lessonIds } } })
    : [];

  return NextResponse.json({ courses, progress });
}
