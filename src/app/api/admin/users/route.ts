import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { cleanText, isValidEmail, normalizeEmail, readJsonObject } from "@/lib/security/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await readJsonObject(request);
    const name = cleanText(body?.name, 80);
    const email = normalizeEmail(body?.email);

    if (name.length < 2 || !isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid student name and email" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: "STUDENT",
        status: "APPROVED",
        approvedAt: new Date(),
      },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      verifiedAt: true,
      passwordHash: true,
      courseAccess: {
        select: { courseId: true, status: true, course: { select: { id: true, title: true, slug: true } } },
      },
      lessonProgress: { select: { lessonId: true, percent: true, completedAt: true } },
    },
  });

  return NextResponse.json({
    users: users.map(({ passwordHash, ...user }) => ({ ...user, hasPassword: Boolean(passwordHash) })),
  });
}
