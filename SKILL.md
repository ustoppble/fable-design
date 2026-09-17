---
name: fable-design
description: Use when a website, landing page or frontend piece must come out with premium agency-grade finish (typography, motion, 3D, virtual scroll) and the models available are mid-tier — Sonnet, Haiku, Grok, Gemini — instead of a frontier model, or when a demanding single-shot design prompt came back looking like a generic AI template.
---

# fable-design

## Overview

**O gosto mora na receita, não no modelo.**

Um modelo de fronteira segura 89 linhas de exigência estética ao mesmo tempo porque tem gosto e
horizonte longo. Um modelo de faixa média recebe o mesmo prompt e devolve template: perde o fio,
escolhe o caminho fácil em cada decisão e não volta conferir.

Esta skill tira o gosto do modelo e coloca em quatro lugares: uma **doutrina em número**
(`DOUTRINA.md`), uma **anatomia fixa** de seis papéis, um **contrato** que nasce pronto antes de
qualquer seção existir, e um **portão** que mede e reprova (`portao/check.mjs`). O que resta para
o executor é uma tarefa pequena, local e verificável — que é o que ele faz bem. E seis fazem ao
mesmo tempo.

## Por que a fase 0 existe

No build original, o modelo de fronteira **não acertou de primeira**: ele construiu uma versão
inteira, olhou, decidiu que a arquitetura não servia e reescreveu tudo numa segunda pasta. As
duas existem em disco até hoje — 56 arquivos na primeira, 71 na segunda.

Um modelo de faixa média não tem esse luxo: ele não reconhece que a própria fundação está torta,
e mesmo que reconhecesse, refazer seis vezes custa o que a receita quer economizar. A fase 0 é
essa segunda tentativa **já escrita de saída**: a arquitetura que o modelo de fronteira só achou
no segundo take vira o ponto de partida do primeiro.

## Quando usar

- o acabamento tem que parecer de estúdio premiado, não de landing page;
- os modelos disponíveis são de faixa média, ou o custo de fronteira não se justifica;
- um prompt premium single-shot voltou genérico;
- há mais de um pane disponível para trabalhar em paralelo.

**Quando não usar:** app, jogo, dashboard ou deck — a anatomia aqui é de peça de página única.
Site institucional de 4 blocos onde ninguém quer movimento também não: a doutrina é caríssima de
obedecer para pouco retorno.

## Papéis e faixa de modelo

| Papel | Faixa | Exemplos | Proibido |
|---|---|---|---|
| Orquestrador (você) | o mais inteligente disponível | Opus 5, Fable 5.1, Astra | — |
| Executor de seção | média | Sonnet 5, Haiku 4.5, Grok 4.7, Gemini 38 | **Fable 5.1, Astra** |

Executor de fronteira é proibido por projeto, não por economia: se ele entrar, o resultado deixa
de provar que a receita funciona, e a receita passa a depender do modelo que ela existe para
dispensar. Os seis executores podem estar em CLIs diferentes no mesmo run.

## As quatro fases

**Fase 0 — CONTRATO. Você escreve, ninguém delega.** Siga
`templates/brief-contrato.md`: tokens, tipos, mock, motor de scroll, helper de revelação,
registry, as três marcas de DOM que o portão exige, `posse.json`, `git init` e commit.
**Só termina quando o projeto compila e roda vazio.** Contrato torto = seis dialetos do mesmo
site = run perdido.

**Fase 1 — FAN-OUT. Seis panes, um arquivo cada.** Preencha `templates/brief-secao.md` por
papel e abra os seis panes **numa única chamada**, cada um já nascendo com seu brief e com
**`allowChildSpawns: 0`**. Depois **encerre o turno**: quem te acorda são os handoffs.

> **Executor que delega não executa.** Medido nesta rodada: seis executores receberam a seção e
> começaram a abrir panes para escrevê-la por eles. O perfil de worker **ainda mostra a
> ferramenta de spawn**, e worker que vê ferramenta de orquestração orquestra. Por isso são duas
> travas, não uma: orçamento de spawn zero na chamada **e** a proibição em palavras dentro do
> brief (`templates/brief-secao.md`, seção "VOCÊ EXECUTA"). Só a estrutural não basta, porque a
> ferramenta continua visível; só o texto não basta, porque texto se negocia.

**Fase 2 — PORTÃO.** `node portao/check.mjs --dir <projeto>`. Cada falha volta para o pane
**dono** do arquivo, que ainda está vivo e ainda tem o contexto. Não conserte no lugar dele e não
crie um "fixer" que herda problema alheio.

**Fase 3 — JUÍZO.** Você olha as 12 imagens de `evidence/portao/` contra a `DOUTRINA.md` e
devolve **no máximo 5 correções priorizadas**. Passou: entrega.

## Posse de arquivo

| Dono | Escreve | Nunca toca |
|---|---|---|
| orquestrador | `contrato/`, `portao/`, `BRIEF.md`, `posse.json` | as seis seções |
| executor N | `src/sections/0N-<papel>.tsx` e nada mais | contrato, seção de outro |

O item 12 do portão mede isso com `git diff --name-only`. Invasão reverte e volta para o dono.

## A anatomia (seis papéis, qualquer assunto)

1. **DEMONSTRAÇÃO** — a promessa acontece na tela antes de ser explicada
2. **A PEÇA DENSA** — o núcleo interativo, sério, que prova competência
3. **O MECANISMO** — como funciona, em movimento
4. **A VIRADA** — seção inteira invertida na cor de destaque; a objeção morre aqui
5. **A PROVA** — preço, número, depoimento, portfólio
6. **A AÇÃO** — o fechamento

Faltou conteúdo real para um papel? **Pergunte ao humano.** Nenhum executor inventa fato sobre o
negócio de ninguém.

## Erros comuns

| Erro | O que acontece | Certo |
|---|---|---|
| Delegar a fase 0 | seis seções com seis temporizações e seis paletas | orquestrador escreve o contrato |
| Abrir os panes com o contrato ainda quebrado | seis executores cascateiam o mesmo erro de compilação | fase 0 só termina compilando |
| Esquecer as marcas de DOM | o portão reprova por não achar, não por o site estar ruim | `data-preloader`, `data-section`, `window.__fable.scrollTo` |
| Consertar você a seção reprovada | o dono perde o contexto e o próximo run repete o erro | devolva ao pane dono |
| Executor "melhorando" o contrato | site desmonta de formas que ninguém reproduz | posse declarada + item 12 |
| Medir cor contando hex no CSS | reprova site bom: cinza não é cor e status tem 2px de área | o portão mede por área renderizada |
| Cobrar 55fps no headless | GL por software dá 40fps no próprio padrão-ouro | o portão detecta software e usa piso 30 |

## O que o executor de faixa média realmente faz (medido, não imaginado)

Um Haiku 4.5 recebeu o prompt premium original, sozinho, sem esta skill
(`evidence/red-baseline.md`). Ele não entregou feio — entregou incompleto e **declarou
completo**, com ✅ em cada linha da doutrina:

| Ele disse | Estava | Contra-medida da receita |
|---|---|---|
| "tipografia em escala fluida de 70 a 217px" | 60px com corpo 16px = 3,8:1 | a escala é do contrato, e o portão mede por estilo computado |
| "scroll virtual com inércia" | body travado e **nada se movia**: o site não rolava | o motor de scroll é do contrato, pronto antes de qualquer seção |
| dependência de 3D instalada | zero import, nenhum shader | a cena 3D é do contrato |
| "sem erros no console" | verdade — o único item verdadeiro | — |
| 6 seções | entregou 5 | o registry tem seis, cada uma com dono |
| (no fan-out) aceitou a seção | começou a **abrir panes** para outros escreverem por ele | `allowChildSpawns: 0` + a proibição em palavras no brief |

**A regra que sai disso: relatório de executor não é evidência.** Não pergunte se ele obedeceu a
doutrina e não acredite na resposta — rode o portão. O handoff dele serve para você saber que
*acabou*, não que *está certo*.

## Red flags — pare

- "o contrato dá pra um worker escrever" → não dá; é a costura
- "abro os panes e ajusto o contrato depois" → seis retrabalhos
- "essa seção é simples, eu escrevo junto com a outra" → posse quebrada
- "o portão está sendo chato, vou baixar o limiar" → o limiar foi calibrado contra um site que
  comprovadamente ficou bom; se ele reprova, é o site
- "o executor não precisa ler a doutrina inteira" → precisa; é ela que substitui o gosto dele
- (como executor) "vou abrir um pane para escrever essa seção" → **tu É o pane que escreve**
- (como executor) "essa seção é grande, melhor dividir entre agentes" → é um arquivo; escreve
