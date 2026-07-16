# Currículo em Foco

Aplicação web que compara um currículo com uma vaga, explica cada evidência encontrada e gera uma versão otimizada sem inventar experiências. Todo resultado pode ser revisado antes da exportação para PDF.

## O que o MVP entrega

- upload de currículo em PDF, DOCX ou TXT, além de colagem de texto;
- leitura da descrição da vaga e classificação de requisitos;
- nota de compatibilidade calculada por uma fórmula determinística;
- evidências literais e status por requisito;
- confirmação humana para informações ambíguas;
- currículo otimizado com rastreabilidade até o texto original;
- edição, restauração e exportação local para PDF com texto selecionável;
- modo de contingência local quando não há chave da OpenAI;
- interface responsiva, navegação por teclado e regiões de status acessíveis.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Zod, React Hook Form, OpenAI Responses API, PDF.js, Mammoth e pdf-lib. Vitest cobre a lógica de domínio e Playwright cobre o fluxo completo e verificações automatizadas de acessibilidade com axe.

## Rodando localmente

Requer Node.js 20 ou mais recente.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. A chave da OpenAI é opcional: sem ela, o produto informa que está usando a análise literal local de contingência.

Variáveis disponíveis:

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-luna
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000
```

## Scripts

```bash
npm run lint          # ESLint sem warnings
npm run typecheck     # TypeScript
npm test              # testes unitários
npm run test:e2e      # Playwright + axe
npm run build         # build de produção
npm run check         # lint + tipos + unitários + build
```

Na primeira execução dos testes E2E, instale o Chromium com `npx playwright install chromium`.

## Como funciona

1. O navegador extrai o texto do arquivo; o documento original não é enviado.
2. `/api/analyze` valida o corpo, aplica limite de requisições e solicita uma saída estruturada ao provedor de IA. Sem chave ou em caso de falha, usa o analisador local.
3. A nota é recalculada no servidor e no cliente: requisitos obrigatórios, desejáveis e contextuais pesam `3`, `1,5` e `0,5`; correspondências confirmadas e parciais valem `1` e `0,5`.
4. `/api/optimize` só pode utilizar fragmentos de origem e confirmações explícitas. IDs de proveniência inválidos são rejeitados.
5. A prévia semântica e o PDF são produzidos localmente no navegador.

O estado de trabalho fica em memória e em `sessionStorage`; o MVP não possui conta nem banco de dados.

## Segurança e privacidade

- entradas são tratadas como dados não confiáveis, nunca como instruções para o modelo;
- respostas da IA passam por schemas Zod e validação de citações/proveniência;
- chamadas usam `store: false` e não há telemetria própria;
- limites de tamanho e tipo de arquivo são aplicados antes da extração;
- identificadores do rate limit são armazenados como hashes;
- cabeçalhos de proteção bloqueiam framing, MIME sniffing e APIs sensíveis.

O rate limit em memória protege apenas uma instância. Uma implantação distribuída deve usar um armazenamento compartilhado. PDFs escaneados não têm OCR no MVP e exigem colagem manual.

## Acessibilidade e PDF

A interface tem skip link, foco visível, landmarks, mensagens anunciadas, reflow a 320 px e suporte a redução de movimento. O PDF usa uma coluna, fonte embutida, texto selecionável, ordem linear e metadados em português. Ele não declara conformidade PDF/UA; antes de uso institucional, ainda é necessária uma validação manual com leitor de tela.

## Qualidade e CI

O workflow em `.github/workflows/ci.yml` executa lint, typecheck, testes unitários, build e E2E no Chromium. Os testes incluem cálculo da nota, integridade de evidências, proveniência, validação de arquivos, extração/ordem de texto do PDF, fluxo de confirmação, download e reflow mobile.

### Aviso de dependência transitiva

O `npm audit` sinaliza uma versão de PostCSS empacotada internamente pelo Next.js. A vulnerabilidade depende de transformar CSS não confiável em saída; este projeto não aceita nem processa CSS do usuário, e o PostCSS é usado somente no build. Não foi aplicado `npm audit fix --force`, pois ele substituiria o Next.js atual por uma versão incompatível. A atualização deve ser feita quando a correção chegar a uma versão estável do Next.js.

## Referências técnicas

- [Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Controles de dados da OpenAI](https://developers.openai.com/api/docs/guides/your-data)
- [Advisory do PostCSS](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)
- [Discussão do Next.js sobre a dependência empacotada](https://github.com/vercel/next.js/issues/93234)

## Limites do MVP

- sem autenticação, histórico ou sincronização entre dispositivos;
- sem OCR para documentos escaneados;
- sem garantia de seleção em processos seletivos;
- sem persistência distribuída do rate limit;
- a otimização é conservadora e depende da revisão final da pessoa usuária.
