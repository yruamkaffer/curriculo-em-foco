import { describe, expect, it } from "vitest";
import { analyzeLocally } from "@/lib/matching/local-analysis";
import { SAMPLE_JOB, SAMPLE_RESUME } from "@/features/resume/samples";

describe("analyzeLocally", () => {
  it("relaciona requisitos a fragmentos existentes", () => {
    const result = analyzeLocally(SAMPLE_JOB, SAMPLE_RESUME);
    expect(result.mode).toBe("local");
    expect(result.matches.length).toBeGreaterThan(3);
    for (const evidence of result.matches.flatMap((match) => match.evidence)) {
      const fragment = result.fragments.find((item) => item.id === evidence.fragmentId);
      expect(fragment?.text).toContain(evidence.quote);
    }
  });
});
