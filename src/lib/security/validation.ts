export const PASSWORD_MIN_LENGTH = 10;

export function cleanText(value: unknown, maxLength = 120): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function cleanLongText(value: unknown, maxLength = 2000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().slice(0, 254);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: unknown): password is string {
  if (typeof password !== "string") return false;
  if (password.length < PASSWORD_MIN_LENGTH || password.length > 128) return false;

  return (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
}

export function passwordRequirementMessage(): string {
  return `Password must be ${PASSWORD_MIN_LENGTH}+ characters and include uppercase, lowercase, and a number`;
}

export function isCuidLike(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9_-]{10,40}$/i.test(value);
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}
