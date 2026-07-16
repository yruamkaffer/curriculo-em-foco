const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "docx", "txt"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream",
  "",
]);

export function validateResumeFile(file: Pick<File, "name" | "size" | "type">) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!allowedExtensions.has(extension)) throw new Error("Use um arquivo PDF, DOCX ou TXT.");
  if (!allowedMimeTypes.has(file.type)) throw new Error("O tipo do arquivo não corresponde aos formatos aceitos.");
  if (file.size > MAX_FILE_SIZE) throw new Error("O arquivo deve ter no máximo 5 MB.");
  if (file.size === 0) throw new Error("O arquivo está vazio.");
  return extension;
}

export async function extractTextFromFile(file: File) {
  const extension = validateResumeFile(file);
  if (extension === "txt") return file.text();
  const buffer = await file.arrayBuffer();
  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  const text = pages.join("\n\n").trim();
  if (text.length < 20) throw new Error("Este PDF parece ser uma imagem ou não contém texto suficiente. Cole o conteúdo manualmente.");
  return text;
}
