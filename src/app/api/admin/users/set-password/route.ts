import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { isStrongPassword, passwordRequirementMessage, readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await readJsonObject(request);
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!userId || !isStrongPassword(password)) {
      return NextResponse.json({ error: passwordRequirementMessage() }, { status: 400 });
    }

    const student = await prisma.user.findFirst({ where: { id: userId, role: "STUDENT" }, select: { id: true } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash, verifiedAt: new Date() } }),
      prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
