import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { cleanText, isStrongPassword, isValidEmail, normalizeEmail, passwordRequirementMessage, readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await readJsonObject(request);
    const name = cleanText(body?.name, 80);
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (name.length < 2 || !isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid name and email" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: passwordRequirementMessage() }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        status: "APPROVED",
        approvedAt: new Date(),
        verifiedAt: new Date(),
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ success: true, admin: newAdmin });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
