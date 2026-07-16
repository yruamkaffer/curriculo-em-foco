import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export function guardRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return { ok: false as const, status: 415, message: "Envie dados em JSON." };
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 100_000) return { ok: false as const, status: 413, message: "A solicitação ultrapassa o limite permitido." };
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const identifier = forwarded || request.headers.get("x-real-ip") || "local";
  const rate = checkRateLimit(identifier);
  if (!rate.allowed) return { ok: false as const, status: 429, message: "Limite temporário atingido. Tente novamente mais tarde." };
  return { ok: true as const, rate };
}
