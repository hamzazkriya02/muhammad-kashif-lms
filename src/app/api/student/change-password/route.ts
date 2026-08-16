import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, revokeAllUserSessions } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isStrongPassword, passwordRequirementMessage, readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    const body = await readJsonObject(request);
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }
    if (!isStrongPassword(newPassword)) {
      return NextResponse.json({ error: passwordRequirementMessage() }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "New password must be different from the current password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user?.passwordHash) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: currentUser.id }, data: { passwordHash: newHash } });
    await revokeAllUserSessions(currentUser.id);

    return NextResponse.json({ success: true, signedOut: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
