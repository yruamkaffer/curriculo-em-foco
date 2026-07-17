import { describe, expect, it } from "vitest";
import { analyzeLocally } from "@/lib/matching/local-analysis";
import { TEST_JOB, TEST_RESUME } from "../../../test/fixtures";

describe("analyzeLocally", () => {
  it("relaciona requisitos a fragmentos existentes", () => {
    const result = analyzeLocally(TEST_JOB, TEST_RESUME);
    expect(result.mode).toBe("local");
    expect(result.matches.length).toBeGreaterThan(3);
    for (const evidence of result.matches.flatMap((match) => match.evidence)) {
      const fragment = result.fragments.find((item) => item.id === evidence.fragmentId);
      expect(fragment?.text).toContain(evidence.quote);
    }
  });
});
