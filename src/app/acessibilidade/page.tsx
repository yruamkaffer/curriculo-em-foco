import { InfoPage } from "@/components/layout/info-page";

export default function Acessibilidade() {
  return <InfoPage eyebrow="Design Universal" title="Acessibilidade é parte do produto"><p>O fluxo foi pensado para teclado, toque, mouse e tecnologias assistivas, com linguagem direta e foco previsível.</p><h2>Recursos implementados</h2><ul><li>Link para pular ao conteúdo, HTML semântico e foco visível.</li><li>Labels persistentes, resumo de erros e atualizações em regiões ao vivo.</li><li>Alvos de toque de pelo menos 44 px e layout com reflow em telas estreitas.</li><li>Respeito a movimento reduzido e nenhum significado transmitido somente por cor.</li></ul><h2>Limitação documentada</h2><p>O preview HTML é a versão acessível principal. O PDF tem texto selecionável e ordem linear, mas conformidade PDF/UA não é declarada sem validação especializada.</p></InfoPage>;
}
