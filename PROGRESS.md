# Progresso do MVP

## Decisões

- Nome: Currículo em Foco.
- Next.js App Router, TypeScript, Tailwind 4 e shadcn/ui.
- PDF gerado localmente com `pdf-lib`; preview principal permanece em HTML acessível.
- OpenAI Responses API atrás de `AIProvider`, com Structured Outputs, Zod e `store: false`.
- Sem chave de API, análise literal local é oferecida como contingência explícita.
- Estado pessoal somente em memória e `sessionStorage`.

## Riscos conhecidos

- PDFs escaneados exigem colagem manual; OCR está fora do MVP.
- O PDF tem texto selecionável e ordem linear, mas não declara conformidade PDF/UA.
- Rate limit em memória é adequado apenas a uma instância; produção distribuída exige armazenamento compartilhado.
- Verificação manual com leitor de tela continua necessária antes de produção.

## Critérios de conclusão

- [x] Fluxo vertical completo.
- [x] Lint, typecheck, testes e build.
- [x] Teste de extração do PDF.
- [x] Verificação visual desktop e mobile.
- [ ] Repositório GitHub publicado.
