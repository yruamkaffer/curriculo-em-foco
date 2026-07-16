import { describe, expect, it } from "vitest";
import { validateResumeFile } from "@/lib/files/extract";

describe("validateResumeFile", () => {
  it("aceita formatos permitidos", () => {
    expect(validateResumeFile({ name: "cv.pdf", size: 100, type: "application/pdf" })).toBe("pdf");
  });

  it("rejeita arquivo grande, vazio ou executável", () => {
    expect(() => validateResumeFile({ name: "cv.pdf", size: 6 * 1024 * 1024, type: "application/pdf" })).toThrow(/5 MB/);
    expect(() => validateResumeFile({ name: "cv.txt", size: 0, type: "text/plain" })).toThrow(/vazio/);
    expect(() => validateResumeFile({ name: "cv.exe", size: 100, type: "application/octet-stream" })).toThrow(/PDF/);
  });
});
