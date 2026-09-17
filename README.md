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

| Condição | Resultado |
|---|---|
| Fable 5.1, single shot (padrão-ouro) | 9/12 na régua de 12 itens — as 3 falhas eram convenção posterior ao site, **nenhuma por qualidade** |
| Haiku 4.5 sozinho, mesmo prompt, sem a skill | **6/12** — e três afirmações do próprio relatório dele contrariadas pela medição |
| Contrato da fase 0 (sem seções) | 14/16 |
| Fan-out completo | **em andamento** — ver `evidence/` |

Os detalhes estão em `evidence/`: a calibração contra o padrão-ouro (que corrigiu quatro bugs de
instrumento do próprio portão) e o baseline do modelo fraco sozinho.

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
