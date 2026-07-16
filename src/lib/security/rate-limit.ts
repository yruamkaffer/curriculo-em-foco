import { createHash } from "node:crypto";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function anonymizeIdentifier(value: string) {
  return createHash("sha256").update(`${process.env.RATE_LIMIT_SALT || "local-development"}:${value}`).digest("hex").slice(0, 24);
}

export function checkRateLimit(identifier: string) {
  const limit = Number(process.env.RATE_LIMIT_REQUESTS || 10);
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 3_600_000);
  const key = anonymizeIdentifier(identifier);
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (current.count >= limit) return { allowed: false, remaining: 0, resetAt: current.resetAt };
  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}
