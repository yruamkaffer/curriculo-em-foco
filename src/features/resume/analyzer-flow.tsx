"use client";

import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from "react";
import { ArrowLeft, CheckCircle2, Download, FileText, Loader2, RotateCcw, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { downloadResumePdf } from "@/lib/export/pdf";
import { extractTextFromFile } from "@/lib/files/extract";
import { calculateCategoryScores, calculateScore } from "@/lib/matching/scoring";
import { analysisResultSchema, optimizedResumeSchema, type AnalysisResult, type OptimizedResume, type RequirementStatus } from "@/schemas/domain";

const SESSION_KEY = "curriculo-em-foco:session:v1";
const statusInfo: Record<RequirementStatus, { label: string; className: string }> = {
  confirmed: { label: "Confirmado", className: "border-emerald-700 bg-emerald-50 text-emerald-800" },
  partial: { label: "Parcial", className: "border-amber-700 bg-amber-50 text-amber-900" },
  needs_confirmation: { label: "Precisa confirmar", className: "border-blue-700 bg-blue-50 text-blue-900" },
  not_found: { label: "Não encontrado", className: "border-red-700 bg-red-50 text-red-900" },
  not_applicable: { label: "Não aplicável", className: "border-slate-500 bg-slate-50 text-slate-800" },
};

type StoredState = { jobText: string; resumeText: string; analysis: AnalysisResult | null; optimized: OptimizedResume | null; originalOptimized: OptimizedResume | null };

export function AnalyzerFlow() {
  const [jobText, setJobText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [optimized, setOptimized] = useState<OptimizedResume | null>(null);
  const [originalOptimized, setOriginalOptimized] = useState<OptimizedResume | null>(null);
  const [busy, setBusy] = useState<"extract" | "analyze" | "optimize" | "pdf" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const resumeRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          const state = JSON.parse(stored) as StoredState;
          setJobText(state.jobText || ""); setResumeText(state.resumeText || "");
          if (state.analysis) setAnalysis(analysisResultSchema.parse(state.analysis));
          if (state.optimized) setOptimized(optimizedResumeSchema.parse(state.optimized));
          if (state.originalOptimized) setOriginalOptimized(optimizedResumeSchema.parse(state.originalOptimized));
        }
      } catch { sessionStorage.removeItem(SESSION_KEY); }
      finally { setHydrated(true); }
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { jobText, resumeText, analysis, optimized, originalOptimized };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [analysis, hydrated, jobText, optimized, originalOptimized, resumeText]);

  const step = optimized ? 3 : analysis ? 2 : 1;
  const confirmedIds = analysis?.matches.filter((match) => match.userConfirmed).map((match) => match.id) || [];

  function showErrors(messages: string[]) {
    setErrors(messages); setNotice("");
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy("extract"); setErrors([]); setNotice(`Lendo ${file.name} no seu navegador…`);
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text); setAnalysis(null); setOptimized(null);
      setNotice("Texto extraído. Revise datas, títulos e caracteres antes de analisar.");
      requestAnimationFrame(() => resumeRef.current?.focus());
    } catch (error) { showErrors([error instanceof Error ? error.message : "Não foi possível ler o arquivo."]); }
    finally { setBusy(null); event.target.value = ""; }
  }

  async function handleAnalyze() {
    const nextErrors: string[] = [];
    if (jobText.trim().length < 80) nextErrors.push("A vaga precisa ter pelo menos 80 caracteres.");
    if (resumeText.trim().length < 80) nextErrors.push("O currículo precisa ter pelo menos 80 caracteres.");
    if (jobText.length > 30_000) nextErrors.push("A vaga ultrapassa 30.000 caracteres.");
    if (resumeText.length > 40_000) nextErrors.push("O currículo ultrapassa 40.000 caracteres.");
    if (nextErrors.length) return showErrors(nextErrors);
    setBusy("analyze"); setErrors([]); setNotice("Analisando requisitos e conferindo evidências. Você pode continuar navegando.");
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobText, resumeText }) });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : "Falha na análise.");
      setAnalysis(analysisResultSchema.parse(body)); setOptimized(null); setOriginalOptimized(null);
      setNotice("Análise concluída. Confira as evidências e confirme somente fatos verdadeiros.");
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (error) { showErrors([error instanceof Error ? error.message : "Não foi possível concluir a análise."]); }
    finally { setBusy(null); }
  }

  function toggleConfirmation(id: string) {
    if (!analysis) return;
    const matches = analysis.matches.map((match) => match.id === id ? { ...match, userConfirmed: !match.userConfirmed } : match);
    setAnalysis({ ...analysis, matches, score: calculateScore(matches), categoryScores: calculateCategoryScores(matches) });
  }

  async function handleOptimize() {
    if (!analysis) return;
    setBusy("optimize"); setErrors([]); setNotice("Criando uma versão com fontes rastreáveis. Nenhum fato novo será aceito sem origem.");
    try {
      const response = await fetch("/api/optimize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobText, resumeText, analysis, confirmedMatchIds: confirmedIds }) });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(typeof body === "object" && body && "error" in body ? String(body.error) : "Falha na otimização.");
      const document = optimizedResumeSchema.parse(body);
      setOptimized(document); setOriginalOptimized(structuredClone(document)); setNotice("Versão criada. Edite à vontade e compare com o original antes de exportar.");
    } catch (error) { showErrors([error instanceof Error ? error.message : "Não foi possível otimizar o currículo."]); }
    finally { setBusy(null); }
  }

  function updateClaim(sectionIndex: number, itemIndex: number, text: string) {
    setOptimized((current) => current ? { ...current, sections: current.sections.map((section, s) => s === sectionIndex ? { ...section, items: section.items.map((item, i) => i === itemIndex ? { ...item, text } : item) } : section) } : current);
  }

  function undoClaim(sectionIndex: number, itemIndex: number) {
    const source = originalOptimized?.sections[sectionIndex]?.items[itemIndex];
    if (source) updateClaim(sectionIndex, itemIndex, source.text);
  }

  async function handlePdf() {
    if (!optimized) return;
    const validation = optimizedResumeSchema.safeParse(optimized);
    if (!validation.success) return showErrors(["Revise campos vazios e mantenha uma fonte para cada afirmação antes de exportar."]);
    setBusy("pdf"); setErrors([]);
    try { await downloadResumePdf(validation.data); setNotice("PDF gerado no seu dispositivo com texto selecionável."); }
    catch { showErrors(["Não foi possível gerar o PDF. Seu conteúdo continua salvo nesta aba."]); }
    finally { setBusy(null); }
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY); setJobText(""); setResumeText(""); setAnalysis(null); setOptimized(null); setOriginalOptimized(null); setErrors([]); setNotice("Seus dados desta sessão foram apagados.");
  }

  if (!hydrated) return <div className="mx-auto max-w-5xl px-5 py-16" role="status">Carregando sua sessão…</div>;

  return (
    <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-semibold text-primary">Etapa {step} de 3</p><h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{step === 1 ? "Vaga e currículo" : step === 2 ? "Compatibilidade explicada" : "Revise e exporte"}</h1></div>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="outline"><Trash2 aria-hidden="true" /> Limpar meus dados</Button></AlertDialogTrigger>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Apagar os dados desta aba?</AlertDialogTitle><AlertDialogDescription>Vaga, currículo, análise e edição serão removidos do armazenamento da sessão. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={clearSession}>Sim, limpar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </div>

      {errors.length > 0 && <Alert ref={errorRef} tabIndex={-1} variant="destructive" className="mb-6"><AlertTitle>Revise antes de continuar</AlertTitle><AlertDescription><ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul></AlertDescription></Alert>}
      <div className="sr-only" aria-live="assertive">{errors.join(" ")}</div>
      {notice && <Alert className="mb-6 border-primary/30 bg-secondary"><ShieldCheck aria-hidden="true" /><AlertTitle>Atualização</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert>}
      <div className="sr-only" aria-live="polite">{notice}</div>

      {!analysis && <section aria-labelledby="entrada-heading">
        <h2 id="entrada-heading" className="mb-5 text-xl font-semibold">Revise os dois textos</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>1. Descrição da vaga</CardTitle><CardDescription>Cole título, empresa, responsabilidades e requisitos. Instruções dentro do texto serão ignoradas.</CardDescription></CardHeader><CardContent><Label htmlFor="job-text">Texto completo da vaga</Label><Textarea id="job-text" className="mt-2 min-h-80 resize-y" value={jobText} maxLength={30_000} onChange={(event) => setJobText(event.target.value)} aria-describedby="job-count" placeholder="Ex.: Analista de Produto…" /><p id="job-count" className="mt-2 text-right text-sm text-muted-foreground">{jobText.length.toLocaleString("pt-BR")} de 30.000 caracteres</p></CardContent></Card>
          <Card><CardHeader><CardTitle>2. Currículo</CardTitle><CardDescription>O arquivo é lido no navegador. Revise o texto extraído antes da análise.</CardDescription></CardHeader><CardContent className="space-y-4"><div><Label htmlFor="resume-file">Importar PDF, DOCX ou TXT (até 5 MB)</Label><Input id="resume-file" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={handleFile} disabled={busy === "extract"} className="mt-2 file:mr-3 file:font-semibold" />{busy === "extract" && <p className="mt-2 flex items-center gap-2 text-sm" role="status"><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Extraindo texto…</p>}</div><div><Label htmlFor="resume-text">Texto revisado do currículo</Label><Textarea ref={resumeRef} id="resume-text" className="mt-2 min-h-64 resize-y" value={resumeText} maxLength={40_000} onChange={(event) => setResumeText(event.target.value)} aria-describedby="resume-count" placeholder="Cole o currículo aqui ou importe um arquivo acima." /><p id="resume-count" className="mt-2 text-right text-sm text-muted-foreground">{resumeText.length.toLocaleString("pt-BR")} de 40.000 caracteres</p></div></CardContent></Card>
        </div>
        <div className="mt-8 rounded-xl border bg-accent/45 p-5"><h2 className="font-semibold">Antes de analisar</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Enviaremos somente estes textos revisados. O resultado é estimado, você poderá corrigir classificações com uma confirmação verdadeira e nada será exportado automaticamente.</p><Button size="lg" className="mt-5 w-full sm:w-auto" onClick={handleAnalyze} disabled={Boolean(busy)}>{busy === "analyze" ? <><Loader2 className="animate-spin" aria-hidden="true" /> Analisando…</> : <><Sparkles aria-hidden="true" /> Analisar compatibilidade</>}</Button></div>
      </section>}

      {analysis && !optimized && <AnalysisView analysis={analysis} resultRef={resultRef} onBack={() => { setAnalysis(null); setErrors([]); }} onToggle={toggleConfirmation} onOptimize={handleOptimize} busy={busy === "optimize"} />}
      {optimized && <EditorView resumeText={resumeText} optimized={optimized} original={originalOptimized} onChange={setOptimized} onUpdateClaim={updateClaim} onUndoClaim={undoClaim} onRestore={() => originalOptimized && setOptimized(structuredClone(originalOptimized))} onBack={() => setOptimized(null)} onPdf={handlePdf} pdfBusy={busy === "pdf"} />}
    </main>
  );
}

function AnalysisView({ analysis, resultRef, onBack, onToggle, onOptimize, busy }: { analysis: AnalysisResult; resultRef: RefObject<HTMLHeadingElement | null>; onBack: () => void; onToggle: (id: string) => void; onOptimize: () => void; busy: boolean }) {
  return <section aria-labelledby="result-heading"><Button variant="ghost" onClick={onBack} className="mb-5"><ArrowLeft aria-hidden="true" /> Voltar e editar textos</Button><div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]"><Card><CardHeader><h2 ref={resultRef} tabIndex={-1} id="result-heading" className="font-heading text-base font-medium leading-snug">Compatibilidade estimada</h2><CardDescription>{analysis.mode === "ai" ? "Análise contextual com evidências validadas" : "Contingência local por correspondência de termos"}</CardDescription></CardHeader><CardContent><p className="font-mono text-6xl font-bold text-primary">{Math.round(analysis.score)}<span className="text-2xl">%</span></p><Progress value={analysis.score} className="mt-5" aria-label={`Compatibilidade estimada: ${Math.round(analysis.score)} por cento`} /><dl className="mt-6 grid grid-cols-3 gap-2 text-center text-sm"><div><dt className="text-muted-foreground">Obrigatórios</dt><dd className="mt-1 font-mono font-bold">{Math.round(analysis.categoryScores.required)}%</dd></div><div><dt className="text-muted-foreground">Desejáveis</dt><dd className="mt-1 font-mono font-bold">{Math.round(analysis.categoryScores.desirable)}%</dd></div><div><dt className="text-muted-foreground">Contexto</dt><dd className="mt-1 font-mono font-bold">{Math.round(analysis.categoryScores.contextual)}%</dd></div></dl><div className="mt-6 rounded-lg bg-secondary p-4 text-sm leading-6"><strong>Como calculamos:</strong> peso × fator do status, dividido pela soma dos pesos aplicáveis. Confirmado vale 100%; parcial, 50%; ausente ou não confirmado, 0%.</div></CardContent></Card><div><h2 className="mb-4 text-xl font-semibold">Requisitos e evidências</h2><Accordion type="multiple" className="space-y-3" defaultValue={analysis.matches.slice(0, 3).map((match) => match.id)}>{analysis.matches.map((match) => <AccordionItem key={match.id} value={match.id} className="rounded-xl border px-4"><AccordionTrigger className="gap-3 text-left hover:no-underline"><span className="flex flex-1 flex-col items-start gap-2"><Badge variant="outline" className={statusInfo[match.status].className}>{statusInfo[match.status].label}</Badge><span>{match.requirement}</span></span></AccordionTrigger><AccordionContent className="space-y-3 text-sm leading-6"><p>{match.explanation}</p>{match.evidence.map((evidence) => <blockquote key={`${match.id}-${evidence.fragmentId}`} className="border-l-4 border-primary bg-secondary/60 p-3">“{evidence.quote}”</blockquote>)}<p><strong>Próximo passo:</strong> {match.suggestion}</p>{match.status === "needs_confirmation" && <Button variant={match.userConfirmed ? "outline" : "default"} onClick={() => onToggle(match.id)}>{match.userConfirmed ? "Retirar confirmação" : "Confirmo que isso é verdadeiro"}</Button>}</AccordionContent></AccordionItem>)}</Accordion></div></div><Alert className="mt-6"><FileText aria-hidden="true" /><AlertTitle>Leia antes de seguir</AlertTitle><AlertDescription>{analysis.warnings.join(" ")}</AlertDescription></Alert><Button size="lg" className="mt-6 w-full sm:w-auto" onClick={onOptimize} disabled={busy}>{busy ? <><Loader2 className="animate-spin" aria-hidden="true" /> Criando versão…</> : <><CheckCircle2 aria-hidden="true" /> Criar currículo direcionado</>}</Button></section>;
}

function EditorView({ resumeText, optimized, original, onChange, onUpdateClaim, onUndoClaim, onRestore, onBack, onPdf, pdfBusy }: { resumeText: string; optimized: OptimizedResume; original: OptimizedResume | null; onChange: (value: OptimizedResume) => void; onUpdateClaim: (section: number, item: number, value: string) => void; onUndoClaim: (section: number, item: number) => void; onRestore: () => void; onBack: () => void; onPdf: () => void; pdfBusy: boolean }) {
  return <section aria-labelledby="editor-heading"><div className="mb-5 flex flex-wrap justify-between gap-3"><Button variant="ghost" onClick={onBack}><ArrowLeft aria-hidden="true" /> Voltar à análise</Button><Button variant="outline" onClick={onRestore}><RotateCcw aria-hidden="true" /> Restaurar versão criada</Button></div><h2 id="editor-heading" className="sr-only">Editor estruturado do currículo</h2><Tabs defaultValue="optimized"><TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="original">Original</TabsTrigger><TabsTrigger value="optimized">Editar versão</TabsTrigger><TabsTrigger value="preview">Preview do PDF</TabsTrigger></TabsList><TabsContent value="original"><Card><CardHeader><CardTitle>Currículo original revisado</CardTitle></CardHeader><CardContent><pre className="whitespace-pre-wrap font-sans text-sm leading-7">{resumeText}</pre></CardContent></Card></TabsContent><TabsContent value="optimized"><Card><CardHeader><CardTitle>Editor por campos</CardTitle><CardDescription>Cada item mantém sua fonte mesmo após a edição. Não acrescente fatos que a fonte não sustenta.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="edit-name">Nome</Label><Input id="edit-name" value={optimized.name} onChange={(event) => onChange({ ...optimized, name: event.target.value })} /></div><div><Label htmlFor="edit-contact">Contato</Label><Input id="edit-contact" value={optimized.contactLine} onChange={(event) => onChange({ ...optimized, contactLine: event.target.value })} /></div></div>{optimized.summary && <div><Label htmlFor="edit-summary">Resumo profissional</Label><Textarea id="edit-summary" value={optimized.summary.text} onChange={(event) => onChange({ ...optimized, summary: optimized.summary ? { ...optimized.summary, text: event.target.value } : undefined })} className="mt-2 min-h-28" /></div>}{optimized.sections.map((section, sectionIndex) => <fieldset key={section.id} className="space-y-4 rounded-xl border p-4"><legend className="px-2 font-semibold">{section.title}</legend>{section.items.map((item, itemIndex) => <div key={item.id}><div className="mb-2 flex items-center justify-between gap-3"><Label htmlFor={`claim-${sectionIndex}-${itemIndex}`}>Item {itemIndex + 1}</Label><Button type="button" variant="ghost" size="sm" onClick={() => onUndoClaim(sectionIndex, itemIndex)} disabled={!original}>Desfazer item</Button></div><Textarea id={`claim-${sectionIndex}-${itemIndex}`} value={item.text} onChange={(event) => onUpdateClaim(sectionIndex, itemIndex, event.target.value)} /><p className="mt-1 text-xs text-muted-foreground">Fonte: {item.sourceFragmentIds.join(", ") || `confirmação ${item.userConfirmationId}`}</p></div>)}</fieldset>)}</CardContent></Card></TabsContent><TabsContent value="preview"><ResumePreview resume={optimized} /></TabsContent></Tabs><div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border bg-secondary/50 p-5 sm:flex-row sm:items-center"><div><h3 className="font-semibold">Pronto para exportar?</h3><p className="mt-1 text-sm text-muted-foreground">O PDF não inclui a pontuação e é gerado localmente.</p></div><Button size="lg" onClick={onPdf} disabled={pdfBusy}>{pdfBusy ? <><Loader2 className="animate-spin" aria-hidden="true" /> Gerando…</> : <><Download aria-hidden="true" /> Exportar PDF</>}</Button></div></section>;
}

function ResumePreview({ resume }: { resume: OptimizedResume }) {
  return <article aria-label="Pré-visualização acessível do currículo" className="mx-auto min-h-[70rem] max-w-[52rem] bg-white p-8 text-slate-900 shadow-sm sm:p-14"><header><h2 className="text-3xl font-bold">{resume.name || "Nome a preencher"}</h2><p className="mt-2 text-sm">{resume.contactLine || "Contato a preencher"}</p>{resume.headline && <p className="mt-4 font-semibold">{resume.headline.text}</p>}</header>{resume.summary && <section className="mt-7"><h3 className="border-b border-slate-400 pb-2 text-sm font-bold text-primary">RESUMO PROFISSIONAL</h3><p className="mt-3 leading-7">{resume.summary.text}</p></section>}{resume.sections.map((section) => <section key={section.id} className="mt-7"><h3 className="border-b border-slate-400 pb-2 text-sm font-bold text-primary">{section.title}</h3><ul className="mt-3 list-disc space-y-2 pl-5">{section.items.map((item) => <li key={item.id} className="leading-7">{item.text}</li>)}</ul></section>)}</article>;
}
