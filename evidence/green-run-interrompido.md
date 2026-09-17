# GREEN — rodada de 2026-09-17 interrompida

A fase 0 (contrato) ficou pronta e medida: **14/16 no portão**, com as duas falhas explicadas —
razão de escala (é conteúdo de seção, não existe em placeholder) e um item de posse que acusou
uma edição minha no contrato depois do commit.

O fan-out abriu os seis executores (`claude-haiku-4-5`, panes 5755–5760) e **os seis foram
dispensados pelo humano durante a execução**, por um motivo que virou a correção mais importante
desta rodada:

> **os executores começaram a abrir panes para delegar a própria seção.**

Em vez de escrever o arquivo, worker após worker tentou distribuir o trabalho. A causa é
estrutural: o perfil de tool `worker` **inclui a ferramenta de spawn**, e um agente que vê
ferramenta de orquestração orquestra — inclusive quando a tarefa dele é um arquivo só.

Correção aplicada em duas travas (uma só não resolve):

1. **`allowChildSpawns: 0`** na chamada de cada executor — orçamento de spawn zero.
2. **A proibição em palavras** no `templates/brief-secao.md`, seção "VOCÊ EXECUTA. VOCÊ NÃO
   DELEGA", porque a ferramenta continua aparecendo na lista dele mesmo com orçamento zero.

**Esta rodada não é comparável ao padrão-ouro e não deve ser citada como prova da receita.** Um
site com metade das seções em placeholder não mede a tese; mede uma rodada interrompida.

O que continua valendo como evidência medida:

- `calibracao-padrao-ouro.md` — o portão não reprova o site do Fable 5.1 por nenhum motivo de
  qualidade (9/12 na régua de 12 itens; as 3 falhas eram convenção posterior ao site).
- `red-baseline.md` — Haiku 4.5 sozinho, com o mesmo prompt: 6/12, e três afirmações do próprio
  relatório dele contrariadas pela medição.
- A fase 0 deste projeto (`~/Developer/bside/fable-design/green-haiku-x6`), que fica no disco
  pronta para o fan-out ser refeito a qualquer momento — o contrato é a parte cara e ela está
  feita, commitada e medida.

Para refazer: os seis briefs saem de `templates/brief-secao.md` com o `BRIEF.md` do projeto, e
o portão roda com `node portao/check.mjs --dir <projeto>`.
