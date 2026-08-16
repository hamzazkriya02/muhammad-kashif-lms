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
    const lessonId = typeof body?.lessonId === "string" ? body.lessonId : "";
    const title = cleanText(body?.title, 140);
    const youtubeId = extractYouTubeId(body?.youtubeId ?? body?.youtubeUrl);

    if (!lessonId || title.length < 2 || !youtubeId) {
      return NextResponse.json({ error: "Enter a lesson title and a valid YouTube URL or video ID" }, { status: 400 });
    }

    await prisma.lesson.update({ where: { id: lessonId }, data: { title, youtubeId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update lesson error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
