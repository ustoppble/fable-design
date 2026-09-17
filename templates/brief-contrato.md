# Fase 0 — o contrato (checklist do orquestrador)

O orquestrador escreve isto com a própria mão, antes de qualquer executor nascer. Não delegue:
é a costura que os seis consomem. Contrato torto = seis dialetos do mesmo site = run perdido.

## Critério de saída da fase 0

**O projeto compila e roda vazio**, com as seis seções presentes como placeholder. Se não roda,
a fase 0 não terminou — não abra pane nenhum.

## O que existe quando a fase 0 acaba

```
contrato/
  tokens.css     as 4 cores e a escala de tipografia, como variáveis CSS
  types.ts       os tipos que as seções recebem
  mock.ts        dados simulados que mudam sozinhos a cada 400ms, com um comentário
                 dizendo explicitamente que são simulados
  scroll.ts      o motor de scroll virtual: body travado, posição interpolada por frame,
                 inércia com decaimento, barra própria na borda direita, e o progresso
                 exposto para as seções consumirem
  reveal.ts      o helper de revelação linha a linha atrás de máscara, com atraso
                 encadeado — para as seis seções revelarem igual
  registry.ts    as seis seções em ordem, cada uma com duração em múltiplos de altura
                 de tela e sobreposição com a vizinha
src/sections/
  01..06         placeholder que compila: exporta o componente, renderiza o nome do papel
BRIEF.md         os seis papéis preenchidos a partir do briefing do usuário
posse.json       { "01-<papel>.tsx": "executor-1", ... } — o portão usa para medir posse
DOUTRINA.md      copiado da skill para dentro do projeto, para o executor ler local
```

## Decisões que são do orquestrador e de mais ninguém

1. **A paleta.** Quatro cores, decididas aqui. Se o briefing trouxe a cor da marca, ela é a cor
   de destaque; se não trouxe, escolha e registre no `tokens.css`.
2. **A escala de tipografia.** Os `clamp` do display e o corpo em 15px, com razão ≥12:1.
3. **O motor de scroll e o helper de revelação.** Se cada seção implementar o seu, o site
   inteiro fica com seis temporizações diferentes.
4. **A duração de cada seção** e a sobreposição entre vizinhas.
5. **`git init` e o commit do contrato.** Sem isso o portão não tem como medir quem escreveu o
   quê.

## Convenções que o portão exige no DOM

O portão é um script: ele só mede o que consegue encontrar. Estas três marcas são
responsabilidade da fase 0 e não são opcionais — sem elas o portão reprova por não achar, não
por o site estar ruim.

| Marca | Onde | Para quê |
|---|---|---|
| `data-preloader` | no nó raiz do preloader | cronometrar o 0→100 e confirmar que ele sai do DOM |
| `data-scroll-root` | no nó que recebe o `transform` interpolado | provar que o scroll é virtual e não nativo |
| `data-section="01"` … `"06"` | no nó raiz de cada seção, posto pelo **registry** | fotografar seção por seção, desktop e mobile |
| `window.__fable = { scrollTo(i), total }` | gancho global exposto pelo motor de scroll | **num site de scroll virtual ninguém navega por script sem gancho** — `scrollIntoView` não funciona quando o body está travado. Sem isso o portão não consegue fotografar nem a segunda seção |

## Antes de abrir os panes

- [ ] `tokens.css` tem no máximo 4 cores e nenhuma delas repetida com nome diferente
- [ ] a razão display/corpo é ≥12:1
- [ ] `npm run build` e o typecheck passam com as seis seções placeholder
- [ ] o scroll virtual já funciona vazio: a roda do mouse move a página sem `scrollTop` nativo
- [ ] o preloader já existe e já conta de 0 a 100
- [ ] `posse.json` cobre os seis arquivos
- [ ] o contrato está commitado
