import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { cleanLongText, cleanText, readJsonObject } from "@/lib/security/validation";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await readJsonObject(request);
    const title = cleanText(body?.title, 100);
    const description = cleanLongText(body?.description, 1500);

    if (title.length < 3) return NextResponse.json({ error: "Course title must be at least 3 characters" }, { status: 400 });

    const slug = slugify(title);
    if (!slug) return NextResponse.json({ error: "Course title is invalid" }, { status: 400 });

    const existingCourse = await prisma.course.findUnique({ where: { slug } });
    if (existingCourse) {
      return NextResponse.json({ error: "A course with a similar title already exists" }, { status: 409 });
    }

    const course = await prisma.course.create({
      data: { title, slug, description: description || null, status: "PUBLISHED" },
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sections: { orderBy: { sortOrder: "asc" }, include: { lessons: { orderBy: { sortOrder: "asc" } } } },
      _count: { select: { courseAccess: true } },
    },
  });

  return NextResponse.json({ courses });
}
