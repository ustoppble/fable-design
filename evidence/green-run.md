# GREEN — seis executores Haiku 4.5 em paralelo, com a skill

Data: 2026-09-17 · projeto `~/Developer/bside/fable-design/green-haiku-x6`

Mesmo briefing do padrão-ouro (o site do Overclock), mesmo modelo que falhou sozinho no RED,
seis panes escrevendo uma seção cada dentro do contrato da fase 0.

## Resultado

**17/17 no portão.** 683 linhas de seção escritas pelos seis executores.

Na mesma régua, medida no mesmo dia, com a guarda de identidade ativa em cada rodada:

| Condição | Portão |
|---|---|
| Fable 5.1, single shot (padrão-ouro) | 12/17 |
| Haiku 4.5 sozinho, sem a skill | **8/17** |
| Haiku 4.5 × 6 com a skill | **17/17** |

**A ressalva honesta:** 3 das 5 falhas do padrão-ouro são convenções que a receita inventou
depois dele (`data-preloader`, `data-section`, `posse.json`) e uma quarta (inversão de seção) não
é medível sem o gancho de navegação que o contrato expõe. A régua favorece projeto feito pela
receita, então **17 > 12 não significa "melhor que o Fable"**. O que é apples-to-apples é a linha
do meio contra a de baixo: **o mesmo modelo, no mesmo briefing, saiu de 8 para 17.**

## O que aconteceu no caminho

**Primeira tentativa de fan-out: abortada.** Os seis executores, em vez de escrever o arquivo,
começaram a **abrir panes para delegar a própria seção**. O humano derrubou a onda. Causa: o
perfil de tool `worker` inclui a ferramenta de spawn, e agente que vê ferramenta de orquestração
orquestra — inclusive quando a tarefa é um arquivo só.

Correção em duas travas, porque uma só não segura: `allowChildSpawns: 0` na chamada **e** a
proibição em palavras no topo do brief (`templates/brief-secao.md`, seção "VOCÊ EXECUTA"). Só a
estrutural não basta (a ferramenta continua visível na lista dele); só o texto não basta (texto
se negocia). **Na segunda onda, os seis executaram.**

## Três bugs que este run encontrou no próprio contrato

1. **`^19.2.8` resolveu para react 19.3.0** e quebrou o install contra `@react-three/fiber@9.7.0`.
   Se tivesse acontecido com os seis panes abertos, travaria todos de uma vez. A fase 0 passou a
   exigir versão fixada e lockfile commitado.
2. **O canvas do R3F engolia o clique** de tudo que estava embaixo: o `pointer-events: none` no
   wrapper não basta, o R3F põe `auto` no canvas. Virou o item 16 do portão.
3. **O `clamp` do display estava curto** (11vw dava 10,5:1 a 1440px). Subiu para 13vw.

## Quatro bugs que este run encontrou no próprio PORTÃO

1. **Media paleta e escala no viewport mobile** que sobrava do laço de screenshots — onde o
   `clamp` cai para o piso. Reprovava tipografia correta com "70px".
2. **Posse comparada com o commit raiz** acusava o contrato que o orquestrador tem direito de ter
   commitado. Passou a medir a árvore suja, que é o que o executor (que não commita) produz.
3. **Posse era por arquivo, não por prefixo.** Dois executores criaram o próprio
   `.module.css` — razoável, e acusado como invasão. Agora dono de `06-acao.tsx` é dono de
   `06-acao.*`.
4. **O mais grave: o portão media o site errado e não sabia.** A porta fixa estava ocupada por
   OUTRO projeto da máquina; o `vite preview` morria por `strictPort`, o `fetch` respondia 200 do
   intruso e saía um relatório convincente e falso — o RED "passou" de 7 para 13 itens numa
   rodada em que mediu um app de voz. Virou o **item 0: identidade do alvo**, uma precondição
   dura que compara a impressão digital do `dist/index.html` com o que responde na porta e aborta
   a medição de navegador quando não bate.
