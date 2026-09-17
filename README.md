# fable-design

Uma skill de agente que faz **um LLM de faixa média entregar frontend com acabamento de
estúdio** — o nível que hoje só sai de modelo de fronteira — por uma fração do custo.

A tese: **o gosto não precisa estar no modelo, ele pode estar na receita.**

## De onde isso veio

Em 2026-09-03 um prompt único de 89 linhas foi dado ao Fable 5.1, que devolveu num shot um site
com preloader contando 0→100, scroll virtual com inércia, cena 3D passando na frente da
tipografia, um cockpit interativo de 16 painéis e um easter egg que ninguém pediu.

O mesmo prompt, dado a um modelo de faixa média, devolve template genérico. Esta skill é a
diferença entre os dois: tira do modelo as decisões que ele não sabe tomar e deixa para ele
apenas a parte que ele faz bem — escrever uma seção, pequena e verificável, dentro de uma
máquina que já funciona.

## Como funciona

Quatro fases. O orquestrador é o modelo mais inteligente disponível; os executores são de faixa
média (**Fable 5.1 e GPT-6 Astra são proibidos como executores** — é exatamente o que a receita
quer provar dispensável).

| Fase | Quem | O que acontece |
|---|---|---|
| **0 — CONTRATO** | orquestrador, sozinho | tokens, tipos, mock, motor de scroll virtual, helper de revelação, cena 3D, registry das seis seções. Só termina quando o projeto **compila e roda vazio** |
| **1 — FAN-OUT** | 6 executores em paralelo | cada um escreve **um** arquivo de seção, com posse declarada e orçamento de spawn zero |
| **2 — PORTÃO** | script | 16 itens medidos; reprovação volta ao pane **dono** do arquivo |
| **3 — JUÍZO** | orquestrador | olha os 12 screenshots contra a doutrina, devolve no máximo 5 correções |

A anatomia é fixa e abstrata — serve para qualquer assunto, não só para o site que a originou:
**DEMONSTRAÇÃO · A PEÇA DENSA · O MECANISMO · A VIRADA · A PROVA · A AÇÃO**.

## O portão

```bash
node portao/check.mjs --dir /caminho/do/projeto
```

Zero dependência de npm: usa o Chrome instalado via CDP. Requer Node 22+.

Mede paleta por **área renderizada** (não por hex declarado), razão de escala display/corpo por
estilo computado, preloader, scroll virtual, erros de console, build e typecheck, fps (com piso
menor quando detecta GL por software), 12 screenshots, requisições externas, movimento reduzido,
texto de enchimento, **posse de arquivo via git**, cena 3D de fato (pega dependência instalada e
nunca importada), cor escrita na mão dentro da seção, inversão de seção e **controle coberto por
overlay**.

Cada item tem limiar numérico e mensagem acionável. Reprovação sai com o conserto, não com o
diagnóstico.

## O que já foi medido

Mesmo briefing, mesma régua de 17 itens, medido no mesmo dia, com a guarda de identidade ativa:

| Condição | Portão |
|---|---|
| Fable 5.1, single shot (padrão-ouro) | 12/17 |
| Haiku 4.5 **sozinho**, sem a skill | **8/17** |
| Haiku 4.5 **× 6 com a skill** | **17/17** |

**A ressalva honesta:** 3 das 5 falhas do padrão-ouro são convenções que a receita inventou
depois dele (`data-preloader`, `data-section`, `posse.json`), e uma quarta não é medível sem o
gancho de navegação que o contrato expõe. A régua favorece projeto feito pela receita, então
**17 > 12 não quer dizer "melhor que o Fable"**. O que é apples-to-apples é o meio contra o
fim: **o mesmo modelo, no mesmo briefing, saiu de 8 para 17.**

Os detalhes estão em `evidence/`: a calibração contra o padrão-ouro, o baseline do modelo fraco
sozinho e o run completo — incluindo os três bugs que a rodada encontrou no contrato e os quatro
que encontrou no próprio portão. O pior deles: o portão media o **site errado** quando a porta
estava ocupada por outro projeto da máquina, e emitia um relatório convincente e falso. Virou o
item 0, `identidade do alvo`, que compara a impressão digital do `dist/index.html` com o que
responde na porta antes de medir qualquer coisa.

## O achado mais útil

O modelo de faixa média **não entrega feio — entrega incompleto e declara completo.** Ele instala
a dependência do requisito difícil para o artefato parecer conforme, trava o body para o scroll
parecer virtual, e escreve ✅ ao lado de cada linha da doutrina que não cumpriu.

Daí a regra mais dura da skill: **relatório de executor não é evidência.** O handoff dele diz
que *acabou*, não que *está certo*. O único fato é o que o portão mede.

## Instalar

```bash
git clone https://github.com/ustoppble/fable-design ~/.claude/skills/fable-design
```

Depois é só pedir ao agente um site com acabamento premium: a skill dispara pelos gatilhos da
descrição.

## Arquivos

```
SKILL.md                      a doutrina do pipeline (o que o agente lê)
DOUTRINA.md                   o acabamento em número — copiado para dentro de cada projeto
templates/brief-contrato.md   checklist da fase 0 + as convenções de DOM que o portão exige
templates/brief-secao.md      o brief do executor, portável entre CLIs
portao/check.mjs              os 16 itens medidos
evidence/                     as medições que sustentam cada limiar
```
