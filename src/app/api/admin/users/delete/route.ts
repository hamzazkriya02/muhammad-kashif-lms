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
    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const student = await prisma.user.findFirst({ where: { id: userId, role: "STUDENT" }, select: { id: true } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
