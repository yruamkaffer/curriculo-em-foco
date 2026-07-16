import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/ai/service";
import { guardRequest } from "@/lib/security/request";
import { analyzeRequestSchema } from "@/schemas/domain";

export async function POST(request: NextRequest) {
  const guard = guardRequest(request);
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });
  try {
    const input = analyzeRequestSchema.parse(await request.json());
    const result = await analyzeResume(input);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(guard.rate.remaining) } });
  } catch (error) {
    const message = error instanceof Error && error.name === "ZodError" ? "Revise o tamanho e o conteúdo dos textos." : "Não foi possível concluir a análise.";
    return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
