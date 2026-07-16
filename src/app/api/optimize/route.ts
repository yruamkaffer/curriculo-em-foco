import { NextRequest, NextResponse } from "next/server";
import { optimizeResume } from "@/lib/ai/service";
import { guardRequest } from "@/lib/security/request";
import { optimizeRequestSchema } from "@/schemas/domain";

export async function POST(request: NextRequest) {
  const guard = guardRequest(request);
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });
  try {
    const input = optimizeRequestSchema.parse(await request.json());
    const result = await optimizeResume(input);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar uma versão segura do currículo." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
