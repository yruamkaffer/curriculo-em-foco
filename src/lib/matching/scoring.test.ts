import { describe, expect, it } from "vitest";
import { calculateScore } from "@/lib/matching/scoring";
import type { RequirementMatch } from "@/schemas/domain";

function match(status: RequirementMatch["status"], kind: RequirementMatch["kind"], userConfirmed = false): RequirementMatch {
  return { id: `${kind}-${status}`, requirement: "Requisito", kind, status, confidence: 1, evidence: [], explanation: "Explicação", suggestion: "Sugestão", userConfirmed };
}

describe("calculateScore", () => {
  it("aplica pesos e fatores sem arredondar o domínio", () => {
    const score = calculateScore([match("confirmed", "required"), match("partial", "desirable")]);
    expect(score).toBeCloseTo(83.333333, 5);
  });

  it("remove não aplicável do denominador", () => {
    expect(calculateScore([match("confirmed", "required"), match("not_applicable", "required")])).toBe(100);
  });

  it("só pontua precisa confirmar após confirmação explícita", () => {
    expect(calculateScore([match("needs_confirmation", "required")])).toBe(0);
    expect(calculateScore([match("needs_confirmation", "required", true)])).toBe(100);
  });
});
