import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await readJsonObject(request);
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const status = body?.status === "DISABLED" ? "DISABLED" : body?.status === "APPROVED" ? "APPROVED" : null;

    if (!userId || !status) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const student = await prisma.user.findFirst({ where: { id: userId, role: "STUDENT" }, select: { id: true } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { status, approvedAt: status === "APPROVED" ? new Date() : undefined } }),
      prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Student status error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
