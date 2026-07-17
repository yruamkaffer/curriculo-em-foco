import { describe, expect, it } from "vitest";
import { analyzeLocally } from "@/lib/matching/local-analysis";
import { assertValidProvenance, optimizeLocally } from "@/lib/optimization/local-optimize";
import { TEST_JOB, TEST_RESUME } from "../../../test/fixtures";

describe("optimizeLocally", () => {
  it("não cria afirmações sem proveniência", () => {
    const analysis = analyzeLocally(TEST_JOB, TEST_RESUME);
    const resume = optimizeLocally({ jobText: TEST_JOB, resumeText: TEST_RESUME, analysis, confirmedMatchIds: [] });
    expect(assertValidProvenance(resume)).toBe(true);
    expect(resume.sections.flatMap((section) => section.items).length).toBeGreaterThan(0);
  });
});
