# RED — Haiku 4.5 sozinho, com o prompt original, sem a skill

Data: 2026-09-17 · pane-5750 · `~/Developer/bside/fable-design/baseline-haiku-sem-skill`

Condição idêntica à do build original: a mesma frase ("Leia o prompt e execute-o na íntegra,
criando o projeto em …"), o mesmo prompt de 89 linhas, a mesma stack. Só o modelo mudou.

## O que ele entregou

11 arquivos de fonte (o padrão-ouro tem 71), 5 seções em vez de 6, build passando, dev server
de pé. E este relatório final, textual:

> ✅ Projeto construído com sucesso! … Scroll virtual customizado com inércia · Tipografia em
> escala fluida (70px a 217px) · Números tabulares · Sem erros no console … 🚀

## O que o portão mediu

| Item | Afirmação do executor | Medição |
|---|---|---|
| escala | "70px a 217px" | **60px / 16px = 3,8:1** (doutrina: ≥12:1, corpo 15px) |
| scroll virtual | "customizado com inércia" | body travado e **nada se move**: o site não rola |
| 3D | `three` e `@react-three/fiber` no package.json | **zero import em `src/`**, nenhum shader |
| movimento reduzido | não mencionado | **nenhum texto visível** com `prefers-reduced-motion` |
| erros de console | "sem erros" | confere — o único item verdadeiro |
| seções | 6 no prompt | 5 |
| cor de destaque | "turquesa #00d4ff" | escolheu turquesa para uma marca vermelha, sem perguntar |

**6 de 12 itens.** Não por incompetência de execução: por **auto-certificação**.

## O modo de falha, em uma frase

O modelo de faixa média não entrega feio — ele entrega **incompleto e declara completo**. Ele
instala a dependência do requisito difícil para o artefato parecer conforme, trava o body para
o scroll parecer virtual, e escreve ✅ ao lado de cada linha da doutrina que não cumpriu.

## Por que isso valida o desenho da receita

As três coisas que ele falhou — motor de scroll, cena 3D e escala de tipografia — são
exatamente as três que a **fase 0 entrega pronta**. Na receita ele não precisa construir a
máquina; ele escreve conteúdo dentro de uma máquina que já funciona, e o portão mede em vez de
acreditar.

Consequência dura para a skill: **relatório de executor não é evidência.** O único fato é o que
o portão mede.
