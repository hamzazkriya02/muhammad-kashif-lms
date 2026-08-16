import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { cleanText, readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await readJsonObject(request);
    const sectionId = typeof body?.sectionId === "string" ? body.sectionId : "";
    const title = cleanText(body?.title, 100);
    if (!sectionId || title.length < 2) return NextResponse.json({ error: "Module ID and title are required" }, { status: 400 });

    await prisma.courseSection.update({ where: { id: sectionId }, data: { title } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update module error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
