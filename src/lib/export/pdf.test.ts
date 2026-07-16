import { describe, expect, it } from "vitest";
import { generateResumePdf } from "@/lib/export/pdf";
import type { OptimizedResume } from "@/schemas/domain";

describe("generateResumePdf", () => {
  it("gera PDF com seções principais e texto extraível", async () => {
    const resume: OptimizedResume = {
      name: "Marina Souza",
      contactLine: "marina@example.com | São Paulo",
      summary: { id: "s", text: "Analista de dados com experiência em indicadores.", sourceFragmentIds: ["src-1"] },
      sections: [{ id: "experience", title: "EXPERIÊNCIA", items: [{ id: "i", text: "Criação de consultas SQL para indicadores.", sourceFragmentIds: ["src-2"] }] }],
    };
    const bytes = await generateResumePdf(resume);
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const document = await pdfjs.getDocument({ data: bytes, useWorkerFetch: false }).promise;
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    expect(text).toContain("Marina Souza");
    expect(text).toContain("RESUMO PROFISSIONAL");
    expect(text).toContain("EXPERIÊNCIA");
    expect(text.indexOf("Marina Souza")).toBeLessThan(text.indexOf("EXPERIÊNCIA"));
  });
});
