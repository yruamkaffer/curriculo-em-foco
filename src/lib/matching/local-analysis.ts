import { calculateCategoryScores, calculateScore } from "@/lib/matching/scoring";
import { normalizeText, significantTokens } from "@/lib/text";
import type { AnalysisResult, RequirementKind, RequirementMatch, SourceFragment } from "@/schemas/domain";

const requirementHints = /requis|necess|obrigat|experi[eê]ncia|conhecimento|dom[ií]nio|viv[eê]ncia|habilidade|forma[cç][aã]o|certifica|idioma/i;
const desirableHints = /desej|diferencial|prefer|ser[aá] um plus|nice to have/i;
const contextualHints = /remoto|h[ií]brido|presencial|localiza|disponibilidade|contrata[cç][aã]o|benef[ií]cio/i;

function splitUsefulLines(text: string) {
  return text
    .split(/\r?\n|[•●▪]/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((line) => line.length >= 8 && line.length <= 220);
}

function inferKind(line: string): RequirementKind {
  if (desirableHints.test(line)) return "desirable";
  if (contextualHints.test(line)) return "contextual";
  return "required";
}

export function fragmentResume(text: string): SourceFragment[] {
  const lines = splitUsefulLines(text);
  let cursor = 0;
  return lines.map((line, index) => {
    const start = Math.max(text.indexOf(line, cursor), cursor);
    const end = start + line.length;
    cursor = end;
    return { id: `src-${index + 1}`, text: line, start, end };
  });
}

export function extractRequirements(jobText: string) {
  const lines = splitUsefulLines(jobText);
  const contentLines = lines.filter((line) => !line.endsWith(":") && significantTokens(line).length >= 2);
  const selected = contentLines.filter((line) => requirementHints.test(line) || desirableHints.test(line) || contextualHints.test(line));
  const requirements = (selected.length >= 3 ? selected : contentLines.slice(0, 12)).slice(0, 18);
  return requirements.map((requirement, index) => ({ id: `req-${index + 1}`, requirement, kind: inferKind(requirement) }));
}

function classify(requirement: string, fragments: SourceFragment[]) {
  const normalizedRequirement = normalizeText(requirement);
  const requirementTokens = significantTokens(requirement);
  let best: { fragment: SourceFragment; overlap: number } | undefined;

  for (const fragment of fragments) {
    const normalizedFragment = normalizeText(fragment.text);
    const exact = normalizedFragment.includes(normalizedRequirement);
    const overlap = exact ? 1 : requirementTokens.filter((token) => normalizedFragment.includes(token)).length / Math.max(requirementTokens.length, 1);
    if (!best || overlap > best.overlap) best = { fragment, overlap };
  }

  if (best && best.overlap >= 0.72) return { status: "confirmed" as const, confidence: Math.min(0.95, best.overlap), best };
  if (best && best.overlap >= 0.38) return { status: "partial" as const, confidence: Math.min(0.75, best.overlap + 0.2), best };
  if (best && best.overlap >= 0.2) return { status: "needs_confirmation" as const, confidence: 0.4, best };
  return { status: "not_found" as const, confidence: 0.7, best: undefined };
}

export function analyzeLocally(jobText: string, resumeText: string): AnalysisResult {
  const fragments = fragmentResume(resumeText);
  const matches: RequirementMatch[] = extractRequirements(jobText).map((item) => {
    const classification = classify(item.requirement, fragments);
    const evidence = classification.best
      ? [{ fragmentId: classification.best.fragment.id, quote: classification.best.fragment.text }]
      : [];

    const messages = {
      confirmed: ["Há correspondência textual forte no currículo.", "Mantenha a evidência perto do resultado ou experiência relacionada."],
      partial: ["Há termos relacionados, mas a evidência parece incompleta.", "Explique contexto, responsabilidade e resultado somente se forem verdadeiros."],
      needs_confirmation: ["Existe um indício fraco que precisa da sua confirmação.", "Confirme apenas se você puder sustentar a informação."],
      not_found: ["Não foi localizada evidência textual no currículo.", "Considere desenvolver essa competência ou deixe a lacuna explícita."],
    } as const;

    return {
      ...item,
      status: classification.status,
      confidence: classification.confidence,
      evidence,
      explanation: messages[classification.status][0],
      suggestion: messages[classification.status][1],
      userConfirmed: false,
    };
  });

  return {
    mode: "local",
    score: calculateScore(matches),
    categoryScores: calculateCategoryScores(matches),
    matches,
    fragments,
    warnings: [
      "Análise local de contingência: compara termos e não compreende contexto como um modelo de IA.",
      "A compatibilidade é uma estimativa e não representa chance de contratação.",
    ],
    analyzedAt: new Date().toISOString(),
  };
}
