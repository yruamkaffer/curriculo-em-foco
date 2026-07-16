import { z } from "zod";

export const requirementStatusSchema = z.enum([
  "confirmed",
  "partial",
  "needs_confirmation",
  "not_found",
  "not_applicable",
]);

export const requirementKindSchema = z.enum(["required", "desirable", "contextual"]);

export const sourceFragmentSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
});

export const evidenceSchema = z.object({
  fragmentId: z.string().min(1),
  quote: z.string().min(1),
});

export const requirementMatchSchema = z.object({
  id: z.string().min(1),
  requirement: z.string().min(2),
  kind: requirementKindSchema,
  status: requirementStatusSchema,
  confidence: z.number().min(0).max(1),
  evidence: z.array(evidenceSchema),
  explanation: z.string().min(1),
  suggestion: z.string().min(1),
  userConfirmed: z.boolean().default(false),
});

export const analysisResultSchema = z.object({
  mode: z.enum(["ai", "local"]),
  score: z.number().min(0).max(100),
  categoryScores: z.object({
    required: z.number().min(0).max(100),
    desirable: z.number().min(0).max(100),
    contextual: z.number().min(0).max(100),
  }),
  matches: z.array(requirementMatchSchema),
  fragments: z.array(sourceFragmentSchema),
  warnings: z.array(z.string()),
  analyzedAt: z.string().datetime(),
});

export const analyzeRequestSchema = z.object({
  jobText: z.string().trim().min(80).max(30_000),
  resumeText: z.string().trim().min(80).max(40_000),
});

export const optimizedClaimSchema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    sourceFragmentIds: z.array(z.string()),
    userConfirmationId: z.string().min(1).optional(),
  })
  .refine((claim) => claim.sourceFragmentIds.length > 0 || Boolean(claim.userConfirmationId), {
    message: "Toda afirmação precisa de fonte ou confirmação explícita.",
  });

export const resumeSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  items: z.array(optimizedClaimSchema),
});

export const optimizedResumeSchema = z.object({
  name: z.string().min(1),
  contactLine: z.string().min(1),
  headline: optimizedClaimSchema.optional(),
  summary: optimizedClaimSchema.optional(),
  sections: z.array(resumeSectionSchema).min(1),
});

export const optimizeRequestSchema = z.object({
  jobText: z.string().trim().min(80).max(30_000),
  resumeText: z.string().trim().min(80).max(40_000),
  analysis: analysisResultSchema,
  confirmedMatchIds: z.array(z.string()),
});

export type RequirementStatus = z.infer<typeof requirementStatusSchema>;
export type RequirementKind = z.infer<typeof requirementKindSchema>;
export type SourceFragment = z.infer<typeof sourceFragmentSchema>;
export type RequirementMatch = z.infer<typeof requirementMatchSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type OptimizedClaim = z.infer<typeof optimizedClaimSchema>;
export type ResumeSection = z.infer<typeof resumeSectionSchema>;
export type OptimizedResume = z.infer<typeof optimizedResumeSchema>;
export type OptimizeRequest = z.infer<typeof optimizeRequestSchema>;
