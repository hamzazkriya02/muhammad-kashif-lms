import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { generateSecureToken, hashToken } from "@/lib/auth/token";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_DAYS = 7;

export async function createSession(userId: string, deviceId?: string) {
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  // One active session per account. This reduces the impact of stolen sessions.
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.session.create({
    data: {
      userId,
      sessionTokenHash: tokenHash,
      deviceId: deviceId?.slice(0, 255) || null,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    priority: "high",
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { sessionTokenHash: tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (session.user.status !== "APPROVED") return null;

  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await prisma.session.updateMany({
      where: { sessionTokenHash: tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
