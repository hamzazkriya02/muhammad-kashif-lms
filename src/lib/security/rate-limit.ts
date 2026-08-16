type RateEntry = { count: number; resetAt: number };

const globalRateLimit = globalThis as unknown as {
  __lmsRateLimit?: Map<string, RateEntry>;
};

const store = globalRateLimit.__lmsRateLimit ?? new Map<string, RateEntry>();
if (process.env.NODE_ENV !== "production") {
  globalRateLimit.__lmsRateLimit = store;
}

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      remaining: Math.max(0, options.limit - 1),
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    remaining: Math.max(0, options.limit - existing.count),
  };
}
