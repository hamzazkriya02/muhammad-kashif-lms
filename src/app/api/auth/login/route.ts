import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/security/request";
import { isValidEmail, normalizeEmail, readJsonObject } from "@/lib/security/validation";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonObject(request);
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";
    const ip = getClientIp(request);
    const userAgent = getUserAgent(request);

    if (!isValidEmail(email) || !password || password.length > 128) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const limiter = checkRateLimit(`login:${ip}:${email}`, {
      limit: LOGIN_LIMIT,
      windowMs: LOGIN_WINDOW_MS,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(limiter.retryAfterSeconds) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const recentFailures = await prisma.loginHistory.count({
      where: {
        userId: user.id,
        ip,
        success: false,
        createdAt: { gte: new Date(Date.now() - LOGIN_WINDOW_MS) },
      },
    });

    if (recentFailures >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please wait 15 minutes before trying again." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }

    if (user.status !== "APPROVED") {
      await prisma.loginHistory.create({
        data: { userId: user.id, ip, browser: userAgent, success: false },
      });
      return NextResponse.json({ error: "Your account is currently disabled" }, { status: 403 });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    await prisma.loginHistory.create({
      data: { userId: user.id, ip, browser: userAgent, success: isValidPassword },
    });

    if (!isValidPassword) {
      if (recentFailures === 3) {
        await prisma.securityAlert.create({
          data: {
            userId: user.id,
            type: "REPEATED_LOGIN_FAILURES",
            severity: "MEDIUM",
            details: `Multiple failed login attempts from ${ip}`,
          },
        });
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createSession(user.id, userAgent);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Unable to sign in right now" }, { status: 500 });
  }
}
