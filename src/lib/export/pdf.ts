import { PDFDocument, PDFName, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { safeFilenamePart } from "@/lib/text";
import type { OptimizedResume } from "@/schemas/domain";

const PAGE = { width: 595.28, height: 841.89, margin: 54 };
const COLORS = { ink: rgb(0.063, 0.165, 0.263), blue: rgb(0.043, 0.361, 0.678), muted: rgb(0.28, 0.36, 0.43) };

function clean(value: string) {
  return value.replace(/[\u2010-\u2015]/g, "-").replace(/\u2022/g, "-").replace(/\s+/g, " ").trim();
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = clean(text).split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) current = candidate;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateResumePdf(resume: OptimizedResume) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.setTitle(`Currículo - ${clean(resume.name)}`);
  pdf.setSubject("Currículo profissional direcionado e ATS-friendly");
  pdf.setAuthor(clean(resume.name));
  pdf.setCreator("Currículo em Foco");
  pdf.setProducer("pdf-lib");
  pdf.setKeywords(["currículo", "resume", "ATS"]);
  pdf.catalog.set(PDFName.of("Lang"), PDFString.of("pt-BR"));

  let page!: PDFPage;
  let y!: number;
  const newPage = () => {
    page = pdf.addPage([PAGE.width, PAGE.height]);
    y = PAGE.height - PAGE.margin;
  };
  newPage();

  const ensure = (needed: number) => {
    if (y - needed < PAGE.margin) newPage();
  };
  const drawLines = (text: string, options: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; indent?: number; gap?: number } = {}) => {
    const font = options.font || regular;
    const size = options.size || 10.5;
    const indent = options.indent || 0;
    const gap = options.gap ?? 4;
    const lines = wrap(text, font, size, PAGE.width - PAGE.margin * 2 - indent);
    ensure(lines.length * (size + gap));
    for (const line of lines) {
      page.drawText(line, { x: PAGE.margin + indent, y, size, font, color: options.color || COLORS.ink });
      y -= size + gap;
    }
  };
  const heading = (text: string) => {
    ensure(34);
    y -= 8;
    page.drawText(clean(text).toUpperCase(), { x: PAGE.margin, y, size: 10.5, font: bold, color: COLORS.blue });
    y -= 8;
    page.drawLine({ start: { x: PAGE.margin, y }, end: { x: PAGE.width - PAGE.margin, y }, thickness: 0.7, color: COLORS.blue });
    y -= 15;
  };

  drawLines(resume.name, { font: bold, size: 20, gap: 6 });
  drawLines(resume.contactLine, { size: 9.5, color: COLORS.muted });
  if (resume.headline) drawLines(resume.headline.text, { font: bold, size: 11.5 });
  if (resume.summary) {
    heading("Resumo profissional");
    drawLines(resume.summary.text);
  }
  for (const section of resume.sections) {
    heading(section.title);
    for (const item of section.items) {
      ensure(28);
      page.drawText("-", { x: PAGE.margin, y, size: 10.5, font: bold, color: COLORS.blue });
      drawLines(item.text, { indent: 14 });
      y -= 4;
    }
  }

  return pdf.save();
}

export function buildPdfFilename(resume: OptimizedResume, jobTitle = "Vaga", company = "Empresa") {
  return `Curriculo_${safeFilenamePart(resume.name)}_${safeFilenamePart(jobTitle)}_${safeFilenamePart(company)}.pdf`;
}

export async function downloadResumePdf(resume: OptimizedResume, jobTitle?: string, company?: string) {
  const bytes = await generateResumePdf(resume);
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = buildPdfFilename(resume, jobTitle, company);
  anchor.click();
  URL.revokeObjectURL(url);
}
