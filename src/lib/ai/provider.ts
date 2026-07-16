import type { AnalyzeRequest, AnalysisResult, OptimizeRequest, OptimizedResume } from "@/schemas/domain";

export interface AIProvider {
  analyze(input: AnalyzeRequest): Promise<AnalysisResult>;
  optimize(input: OptimizeRequest): Promise<OptimizedResume>;
}
