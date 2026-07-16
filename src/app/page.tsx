import Link from "next/link";
import { ArrowRight, FileCheck2, SearchCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { icon: SearchCheck, title: "1. Compare", text: "Cole a vaga e importe ou cole seu currículo." },
  { icon: FileCheck2, title: "2. Entenda", text: "Veja requisitos, evidências, lacunas e o cálculo do match." },
  { icon: ShieldCheck, title: "3. Ajuste com verdade", text: "Revise cada frase e exporte um PDF simples para ATS." },
];

export default function Home() {
  return (
    <main id="conteudo" className="flex-1">
      <section className="border-b bg-secondary/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-4 font-semibold text-primary">Grátis, sem login e com você no controle</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">Seu currículo em foco para cada vaga.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Entenda sua compatibilidade com evidências, encontre lacunas reais e crie uma versão clara do currículo — sem inventar experiências.</p>
            <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
              <Link href="/analisar">Analisar meu currículo <ArrowRight aria-hidden="true" /></Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">A compatibilidade é uma estimativa, não uma chance de contratação.</p>
          </div>
          <Card className="border-primary/25 bg-background shadow-sm">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Verdade acima da pontuação</p>
              <blockquote className="text-2xl font-semibold leading-snug">“Se não existe uma fonte no seu currículo ou uma confirmação sua, a frase não entra no PDF.”</blockquote>
              <p className="text-muted-foreground">O arquivo é lido no seu navegador. O servidor recebe apenas o texto revisado, e o currículo não é salvo em banco.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      <section aria-labelledby="como-em-tres-passos" className="mx-auto max-w-6xl px-5 py-16">
        <h2 id="como-em-tres-passos" className="text-3xl font-bold">Do texto da vaga ao PDF em três passos</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <CardContent className="p-6">
                <Icon className="mb-5 size-7 text-primary" aria-hidden="true" />
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
