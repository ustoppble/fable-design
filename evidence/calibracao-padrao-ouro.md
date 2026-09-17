# Calibração do portão contra o padrão-ouro

Data: 2026-09-17

O portão foi rodado contra `overclock-site-v2` — o site que o Fable 5.1 entregou em single shot e
que o dono aprovou. Premissa da calibração: **se o portão reprova o padrão-ouro por qualidade, o
errado é o portão.**

## Primeira rodada: 4/12

Quatro reprovações eram bug do portão, não defeito do site:

| Item | O que o portão disse | O que era de verdade |
|---|---|---|
| paleta | "32 cores" | #000, #fff, o vermelho da marca, seis cinzas e as cores de status. Contar hex cru trata cinza como cor e dá o mesmo peso a um status de 2px e a uma seção inteira |
| fps | "40fps, reprovado" | headless roda GL por software (SwiftShader). 40fps é o ambiente, não o site |
| texto de enchimento | casou com `copy.ts:4` | a linha era um **comentário** dizendo "Nada de lorem ipsum". O portão reprovou o site por causa da própria instrução |
| movimento reduzido | "nenhum texto visível" | o seletor estava preso a `[data-section]`, convenção que o padrão-ouro não usa. Falhou por acoplamento |

## O que mudou no portão

1. **Paleta passou a ser medida por área renderizada**, não por declaração de CSS: as cores são
   agrupadas em famílias de matiz, cinza colapsa numa única família neutra, famílias com menos de
   0,5% da tela são ignoradas e o critério é "poucas famílias coloridas e UMA dominante". É o que
   o olho vê, que é o que a doutrina quis dizer.
2. **fps detecta renderização por software** e usa piso 30 nesse caso, 55 em hardware real.
3. **Enchimento ignora linha de comentário.**
4. **Movimento reduzido usa seletor solto.**
5. **Scroll virtual passou a medir comportamento**, não nome de atributo: se `[data-scroll-root]`
   não existir, procura qualquer nó cujo `transform` mudou com a roda do mouse. O padrão-ouro tem
   scroll virtual de verdade sob outro nome.

## Segunda rodada: 9/12

As três reprovações que restaram são convenção que a fase 0 cria e que o padrão-ouro, anterior à
receita, não tem: `data-preloader`, `data-section` e `posse.json`. **Nenhuma reprovação por
qualidade.**

```
PASSA   1. paleta contida — neutra + 0 colorida(s) visível(is); dominante 100%
PASSA   2. razão display/corpo — 200px / 15px = 13.3:1
FALHA   3. preloader — nenhum [data-preloader] no DOM
PASSA   4. scroll virtual — body travado, posição interpolada, zero scroll nativo
PASSA   5. erros de console — nenhum
PASSA   7. fps ≥ 30 — 40fps (GL por software)
FALHA   8. screenshots — nenhum [data-section] no DOM
PASSA   9. requisições externas — nenhuma
PASSA  10. movimento reduzido — o texto aparece
PASSA  11. sem texto de enchimento — nada em src/
FALHA  12. posse de arquivo — sem posse.json
```

## Limitação honesta

No padrão-ouro a paleta foi amostrada em **uma** posição de scroll: sem o gancho
`window.__fable.scrollTo` o portão não navega um site de scroll virtual. Num projeto feito pela
receita o gancho existe e as seis seções são amostradas — inclusive a que inverte inteira na cor
de destaque, que é justamente onde a medição importa.
