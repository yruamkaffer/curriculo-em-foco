import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

test("fluxo completo com exemplo fictício", async ({ page }) => {
  await page.goto("/");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("link", { name: /analisar meu currículo/i }).click();
  await page.getByRole("button", { name: /usar exemplo fictício/i }).click();
  await page.getByRole("button", { name: /analisar compatibilidade/i }).click();
  await expect(page.getByRole("heading", { name: /compatibilidade estimada/i })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: /confirmo que isso é verdadeiro/i }).click();
  await page.getByRole("button", { name: /criar currículo direcionado/i }).click();
  await expect(page.getByRole("tab", { name: /editar versão/i })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /exportar pdf/i }).click();
  const downloadedPdf = await download;
  expect(downloadedPdf.suggestedFilename()).toMatch(/^Curriculo_.*\.pdf$/);
  const pdfDirectory = path.join(process.cwd(), "tmp", "pdfs");
  await mkdir(pdfDirectory, { recursive: true });
  await downloadedPdf.saveAs(path.join(pdfDirectory, "curriculo-exemplo.pdf"));
  await page.getByRole("button", { name: /limpar meus dados/i }).click();
  await page.getByRole("button", { name: /sim, limpar/i }).click();
  await expect(page.getByRole("heading", { name: /vaga e currículo/i })).toBeVisible();
});

test("landing tem reflow em viewport mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
