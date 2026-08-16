import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim().slice(0, 64) || "unknown";
  return request.headers.get("x-real-ip")?.slice(0, 64) || "unknown";
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent")?.slice(0, 255) || "Unknown device";
}
