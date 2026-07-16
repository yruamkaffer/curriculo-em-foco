import { OpenAIProvider } from "@/lib/ai/openai-provider";
import { analyzeLocally } from "@/lib/matching/local-analysis";
import { optimizeLocally } from "@/lib/optimization/local-optimize";
import type { AnalyzeRequest, AnalysisResult, OptimizeRequest, OptimizedResume } from "@/schemas/domain";

export async function analyzeResume(input: AnalyzeRequest): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return analyzeLocally(input.jobText, input.resumeText);

  try {
    return await new OpenAIProvider(apiKey).analyze(input);
  } catch {
    const fallback = analyzeLocally(input.jobText, input.resumeText);
    fallback.warnings.unshift("A análise avançada falhou. Seus textos foram preservados e usamos a contingência local.");
    return fallback;
  }
}

export async function optimizeResume(input: OptimizeRequest): Promise<OptimizedResume> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return optimizeLocally(input);
  try {
    return await new OpenAIProvider(apiKey).optimize(input);
  } catch {
    return optimizeLocally(input);
  }
}
