import type { RequirementKind, RequirementMatch, RequirementStatus } from "@/schemas/domain";

export const WEIGHTS: Record<RequirementKind, number> = {
  required: 3,
  desirable: 1.5,
  contextual: 0.5,
};

export const FACTORS: Record<RequirementStatus, number | null> = {
  confirmed: 1,
  partial: 0.5,
  needs_confirmation: 0,
  not_found: 0,
  not_applicable: null,
};

export function calculateScore(matches: RequirementMatch[]) {
  let numerator = 0;
  let denominator = 0;

  for (const match of matches) {
    const factor = match.userConfirmed && match.status === "needs_confirmation" ? 1 : FACTORS[match.status];
    if (factor === null) continue;
    const weight = WEIGHTS[match.kind];
    numerator += weight * factor;
    denominator += weight;
  }

  return denominator === 0 ? 0 : (numerator / denominator) * 100;
}

export function calculateCategoryScores(matches: RequirementMatch[]) {
  return {
    required: calculateScore(matches.filter((match) => match.kind === "required")),
    desirable: calculateScore(matches.filter((match) => match.kind === "desirable")),
    contextual: calculateScore(matches.filter((match) => match.kind === "contextual")),
  };
}
