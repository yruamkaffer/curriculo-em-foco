import { describe, expect, it } from "vitest";
import { analyzeLocally } from "@/lib/matching/local-analysis";
import { assertValidProvenance, optimizeLocally } from "@/lib/optimization/local-optimize";
import { SAMPLE_JOB, SAMPLE_RESUME } from "@/features/resume/samples";

describe("optimizeLocally", () => {
  it("não cria afirmações sem proveniência", () => {
    const analysis = analyzeLocally(SAMPLE_JOB, SAMPLE_RESUME);
    const resume = optimizeLocally({ jobText: SAMPLE_JOB, resumeText: SAMPLE_RESUME, analysis, confirmedMatchIds: [] });
    expect(assertValidProvenance(resume)).toBe(true);
    expect(resume.sections.flatMap((section) => section.items).length).toBeGreaterThan(0);
  });
});
