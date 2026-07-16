import { InfoPage } from "@/components/layout/info-page";

export default function ComoFunciona() {
  return <InfoPage eyebrow="Transparência" title="Como funciona"><p>Você cola a vaga, importa ou cola o currículo e revisa o texto antes de qualquer análise.</p><h2>O que a ferramenta faz</h2><ul><li>Relaciona requisitos da vaga a trechos existentes do currículo.</li><li>Calcula a pontuação por uma fórmula determinística.</li><li>Reorganiza apenas informações com fonte ou confirmação explícita.</li><li>Gera localmente um PDF simples, de uma coluna e com texto selecionável.</li></ul><h2>O que ela não faz</h2><p>Não prevê contratação, não substitui recrutadores e não cria experiência, resultado ou competência. A análise local de contingência é literal e pode deixar passar relações de contexto.</p></InfoPage>;
}
