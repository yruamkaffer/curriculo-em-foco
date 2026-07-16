import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", advancedAnalysis: Boolean(process.env.OPENAI_API_KEY) }, { headers: { "Cache-Control": "no-store" } });
}
