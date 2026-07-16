import type { Metadata } from "next";
import { AnalyzerFlow } from "@/features/resume/analyzer-flow";

export const metadata: Metadata = { title: "Analisar currículo", description: "Compare uma vaga e seu currículo com evidências e controle humano." };

export default function AnalyzePage() { return <AnalyzerFlow />; }
