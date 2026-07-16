const stopWords = new Set([
  "a", "as", "o", "os", "de", "da", "das", "do", "dos", "e", "em", "para", "por", "com",
  "que", "um", "uma", "na", "no", "nas", "nos", "ser", "ter", "ou", "ao", "à", "às",
]);

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function significantTokens(value: string) {
  return [...new Set(normalizeText(value).split(" ").filter((word) => word.length > 2 && !stopWords.has(word)))];
}

export function safeFilenamePart(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "Documento";
}
