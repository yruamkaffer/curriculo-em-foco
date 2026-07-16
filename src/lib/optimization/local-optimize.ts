import { significantTokens } from "@/lib/text";
import type { OptimizeRequest, OptimizedClaim, OptimizedResume } from "@/schemas/domain";

function claim(id: string, text: string, sourceFragmentIds: string[], userConfirmationId?: string): OptimizedClaim {
  return { id, text, sourceFragmentIds, ...(userConfirmationId ? { userConfirmationId } : {}) };
}

export function optimizeLocally(input: OptimizeRequest): OptimizedResume {
  const nonEmptyLines = input.resumeText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const name = nonEmptyLines[0]?.slice(0, 80) || "Nome não identificado";
  const contactLine = nonEmptyLines.find((line) => /@|\+?\d[\d\s().-]{7,}|linkedin|github/i.test(line)) || "Contato a revisar";
  const confirmed = new Set(input.confirmedMatchIds);
  const relevant = input.analysis.matches
    .filter((match) => match.status === "confirmed" || confirmed.has(match.id))
    .slice(0, 8);
  const keywordSet = [...new Set(relevant.flatMap((match) => significantTokens(match.requirement)))].slice(0, 10);
  const contentFragments = input.analysis.fragments
    .slice(2)
    .filter((fragment) => !(fragment.text === fragment.text.toUpperCase() && significantTokens(fragment.text).length <= 2));
  const educationFragments = contentFragments.filter((fragment) => /faculdade|universidade|gradua[cç][aã]o|bacharel|tecnologia em|certifica/i.test(fragment.text));
  const experienceFragments = contentFragments.filter((fragment) => !educationFragments.some((education) => education.id === fragment.id));
  const summarySource = [...new Set(relevant.flatMap((match) => match.evidence.map((item) => item.fragmentId)))];
  const summaryText = keywordSet.length
    ? `Profissional com experiência relacionada a ${relevant.slice(0, 3).map((match) => match.requirement).join(", ")}.`
    : "";

  return {
    name,
    contactLine,
    summary: summarySource.length && summaryText ? claim("summary", summaryText, summarySource) : undefined,
    sections: [
      {
        id: "skills",
        title: "COMPETÊNCIAS RELEVANTES",
        items: relevant.map((match, index) =>
            claim(
              `skill-${index + 1}`,
              match.requirement.replace(/^(requisitos?|desejável|diferencial)\s*:?\s*/i, ""),
              match.evidence.map((item) => item.fragmentId),
              confirmed.has(match.id) && match.evidence.length === 0 ? match.id : undefined,
            ),
          ),
      },
      {
        id: "experience",
        title: "EXPERIÊNCIA E REALIZAÇÕES",
        items: experienceFragments.map((fragment, index) => claim(`experience-${index + 1}`, fragment.text, [fragment.id])),
      },
      {
        id: "education",
        title: "FORMAÇÃO",
        items: educationFragments.map((fragment, index) => claim(`education-${index + 1}`, fragment.text, [fragment.id])),
      },
    ].filter((section) => section.items.length > 0),
  };
}

export function assertValidProvenance(resume: OptimizedResume) {
  const claims = [resume.headline, resume.summary, ...resume.sections.flatMap((section) => section.items)].filter(Boolean);
  return claims.every((item) => item && (item.sourceFragmentIds.length > 0 || Boolean(item.userConfirmationId)));
}
