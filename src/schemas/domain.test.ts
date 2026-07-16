import { describe, expect, it } from "vitest";
import { optimizedClaimSchema } from "@/schemas/domain";

describe("optimizedClaimSchema", () => {
  it("bloqueia afirmação sem fonte nem confirmação", () => {
    expect(optimizedClaimSchema.safeParse({ id: "1", text: "Liderou a equipe", sourceFragmentIds: [] }).success).toBe(false);
  });
});
