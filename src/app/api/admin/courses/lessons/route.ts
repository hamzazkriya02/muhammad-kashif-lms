import { parseLessonResources } from "@/lib/lesson-resources";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { cleanText, readJsonObject } from "@/lib/security/validation";
import { extractYouTubeId } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await readJsonObject(request);
    const sectionId = typeof body?.sectionId === "string" ? body.sectionId : "";
    const title = cleanText(body?.title, 140);
    const youtubeId = extractYouTubeId(body?.youtubeId ?? body?.youtubeUrl);
    let resources;
    try { resources = parseLessonResources(body?.resources); }
    catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid resources" }, { status: 400 });
    }

    if (!sectionId || title.length < 2 || !youtubeId) {
      return NextResponse.json({ error: "Enter a lesson title and a valid YouTube URL or video ID" }, { status: 400 });
    }

    const section = await prisma.courseSection.findUnique({ where: { id: sectionId }, select: { id: true } });
    if (!section) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const lessonCount = await prisma.lesson.count({ where: { sectionId } });
    const lesson = await prisma.lesson.create({
      data: { sectionId, title, youtubeId, resources, type: "VIDEO", sortOrder: lessonCount },
    });

    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
