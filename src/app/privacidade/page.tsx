import { InfoPage } from "@/components/layout/info-page";

export default function Privacidade() {
  return <InfoPage eyebrow="Privacidade por padrão" title="Seus dados não viram um perfil"><p>Não há cadastro nem banco de currículos. O arquivo bruto é lido no navegador; somente o texto que você revisou é enviado para análise.</p><h2>Durante a sessão</h2><ul><li>Vaga, currículo e resultados ficam em memória e no <code>sessionStorage</code> da aba.</li><li>O botão “Limpar meus dados” apaga o estado da sessão.</li><li>Logs técnicos não devem conter currículo, nome, e-mail, telefone ou a vaga integral.</li></ul><h2>Processamento por IA</h2><p>Quando uma chave do provedor está configurada, o texto pode ser processado pela OpenAI com armazenamento de resposta desativado (<code>store: false</code>). Sem chave, é usada uma comparação local limitada.</p></InfoPage>;
}
