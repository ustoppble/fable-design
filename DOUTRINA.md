# DOUTRINA — o acabamento, em número

Lei da receita. Não se negocia por briefing, não se adapta ao assunto, não se "interpreta".
Quem executa uma seção obedece isto sem precisar ter gosto: o gosto já está aqui dentro.

Os valores vêm de um prompt que comprovadamente produziu acabamento de estúdio. Eles não são
preferência — são a diferença entre uma peça que parece caríssima e um template de IA.

## Tipografia

- Display fluido de **70px a 217px**, escalando com a largura da tela (`clamp`).
- Corpo em **15px**, peso leve, altura de linha **1.5**.
- Contraste de escala de **no mínimo 12:1** entre o display e o corpo.
- **Números tabulares** em toda métrica (`font-variant-numeric: tabular-nums`).
- Fonte variável, com o peso animando na entrada.

## Cor

- No máximo **4 cores** no site inteiro.
- Quase-preto de fundo, off-white de texto, **UMA** cor de destaque.
- A cor de destaque **toma seções inteiras**: o fundo inverte por completo quando a seção entra.
  A página respira escuro → destaque → claro, não um acento decorativo aqui e ali.

## Movimento

- **Preloader** em tela cheia: contador de 0 a 100 e barra que enche. Ao terminar, dissolve em
  ~1 segundo com easing suave.
- **Scroll virtual, não nativo**: body com overflow escondido, posição interpolada a cada frame,
  inércia com decaimento.
- **Barra de rolagem própria**, fininha, na borda direita.
- Todo texto entra **revelado linha a linha**, atrás de máscara, com atraso encadeado entre as
  linhas.
- Cada seção tem **duração explícita** em múltiplos de altura de tela, com sobreposição entre
  seções vizinhas.
- **Nada aparece por corte seco.** Se apareceu de repente, está errado.

## Tridimensional

- Uma cena 3D leve (React Three Fiber).
- O objeto passa **na frente** da tipografia, cobrindo parte das letras. Não é fundo.
- Shader próprio e simples: ruído sutil e leve aberração cromática.
- Se a placa não aguentar, **degrada a qualidade** — nunca quebra, nunca desaparece sem
  substituto.

## Conteúdo

- **Zero lorem ipsum.** Todo texto faz sentido para o assunto real do briefing.
- Nenhum fato inventado sobre o negócio: número, preço, depoimento e nome só entram se vieram no
  briefing. Faltou? Quem executa **pergunta**, não preenche.

## Desempenho

- **60fps** é o alvo, 55 é o mínimo aceito. Se pesar, otimize — não remova o efeito.
- Sem rede: nenhuma requisição externa, nenhum CDN, nenhuma fonte remota. Tudo empacotado.

## Ordem de prioridade se faltar tempo

1. Tipografia e cor
2. Scroll e revelação
3. 3D

Cortar na ordem inversa. Um site com tipografia certa e sem 3D ainda parece caro; o contrário
não existe.
