# Cores e estilos de design — aplicar SEMPRE, sem o usuário pedir

Aprendido lendo 5 posts (17/10/2026). Toda edição passa por aqui ANTES dos efeitos: primeiro decido **estilo** e **paleta**, depois os efeitos de `DIRECAO.md` são executados dentro dessa linguagem.

## 1. Regra de cor (Dharu Designs — "Best colors combos")

**Uma cor muda o clima inteiro.** Fórmula: **1 cor profunda e saturada + 1 neutro quente (off-white, nunca branco puro)**. Texto sempre na cor oposta do par (claro sobre a cor forte, cor forte sobre o claro). Nada de terceira cor competindo.

| Par | Cor forte | Neutro | Clima / quando usar |
|---|---|---|---|
| Royal Blue + Light Cream | #014BAA | #F8F3F0 | confiança, tecnologia, educação, corporativo moderno |
| Wine Red + Light Sand | #7F011F | #F5EBD0 | elegante, luxo, moda, joia, vinho, gastronomia |
| Orange + Milk | #EC5E27 | #FDFDF1 | energia, criatividade, IA/motion, chamada para ação |
| Plum + Milk | #381932 | #FFF3E6 | sofisticado, feminino, beleza, intimista |
| Indigo + Vanilla | #282B4A | #EEEBDA | sério, editorial, finanças, documentário |
| Cherry + Alabaster | #890149 | #F3F3E7 | ousado, beleza, fashion, evento |
| Forest + Leaf | #064734 | #E0FFC2 | natureza, saúde, sustentável, imóvel com verde |

Como aplicar no vídeo:
- Cena "bloco de cor": fundo inteiro na cor forte com palavra gigante no neutro → próxima cena inverte (fundo neutro, palavra na cor forte). A alternância cor/neutro já é uma transição.
- Talking head: a cor forte vira a cor de destaque (pílula, palavra-chave da legenda, brilho das molduras) + grade puxando o vídeo para ela (checklist "nível Tiago").
- Marca do cliente com paleta definida (CLAUDE.md > Marcas) manda; os pares acima preenchem o que faltar (ex.: neutro quente para fundos claros).
- Fundos escuros: quase-preto com leve tom da cor forte (não #000 cinza-neutro), glow radial da cor forte num canto (padrão do carrossel do Fernando: azul-marinho + brilho azul).

## 2. Estilos de design (GoBird — "Graphic design styles", 20 estilos)

Escolher **1 estilo por vídeo** conforme o assunto/tom, e manter do início ao fim.

| # | Estilo | Visual | Usar quando | Como faço aqui |
|---|---|---|---|---|
| 1 | Minimalismo | fundo off-white, 1 elemento, muito respiro, 1 cor de acento | premium, calmo, produto único | `SceneShell` + 1 palavra, par de cor §1 |
| 2 | Maximalismo | tudo cheio, cores e texturas, palavra quebrada em linhas | viral, juventude, evento | colagem de stickers + `KineticText` gigante, cortes 0,4s |
| 3 | Futurista | preto + 1 vermelho/neon, sans larga, óculos/tech | IA, tecnologia, lançamento | fundo escuro, glow, aberração cromática (E01) |
| 4 | Vector art | ilustração chapada, formas lisas, poucas cores | explicativo, personagem | SVG animado / FLUX "flat vector" |
| 5 | Colagem | recortes de foto, papel rasgado, tipos misturados | storytelling, cultura, moda | `PersonCutout` + papel rasgado + fita |
| 6 | Retrô | VHS/fita, tipo bold arredondada, tons quentes desbotados | nostalgia, "lembra quando" | grão, scanline, sépia, borda arredondada |
| 7 | Cyberpunk | amarelo-ácido + preto, tipo glitch/mono, grid técnico | tech agressivo, games | glitch (E16), grid, mono |
| 8 | Pop art | cores primárias, raios, retícula (halftone), balão "POP!" | humor, oferta, surpresa | raios rodando + retícula + pop com overshoot |
| 9 | Glassmorphism | painéis de vidro fosco sobre gradiente escuro com luz | app, SaaS, fintech | cards com `backdrop-filter: blur`, borda fina clara |
| 10 | Clay style | 3D fofinho de massinha, cores pastel | infantil, amigável, app leve | FLUX "clay 3D" + Wan para mexer |
| 11 | Pixel art | pixels, paleta limitada, pôr do sol | games, nostalgia digital | `image-rendering: pixelated`, passos de 12fps |
| 12 | Editorial | foto P&B/estátua + serif grande de revista, muito texto pequeno | autoridade, opinião, documentário | Instrument Serif enorme + colunas pequenas |
| 13 | Y2K | cromado, azul-céu, tipo líquida/estilizada, moda 2000 | moda jovem, streetwear | gradiente cromado, brilho, estrelas |
| 14 | Swiss design | grid rígido, sans (Helvetica/Inter), vermelho + preto + branco, alinhado à esquerda | dados, corporativo, clareza | grid visível, Inter, blocos alinhados |
| 15 | Surreal | objetos impossíveis (ilha flutuando, OVNIs), céu | campanha criativa, sonho | FLUX surreal + parallax |
| 16 | Boêmio | terrosos (terracota, mostarda, verde-oliva), sol/lua, curvas | artesanal, bem-estar, natureza | paleta terrosa, formas orgânicas |
| 17 | Vitoriano | gravura escura, flores, castelo, ornamentos | luxo antigo, mistério, livro | vinheta forte, textura de papel, serif clássica |
| 18 | Grafite | spray, letras bubble, ciano/rosa, muro | streetwear, música, rua | tipo grafite + respingos + corte na batida |
| 19 | Aurora | preto com gradiente de luz (magenta/laranja/roxo), título espaçado | premium, lançamento, música | `GlowBackground` com cores aurora, tracking largo (E09) |
| 20 | Handwritten | letra à mão, papel, cor única | pessoal, delicado, nota | fonte manuscrita, traço que se desenha (E12) |

Atalho de escolha por tipo de vídeo (§1 de DIRECAO.md):
- Talking head / venda → Minimalismo ou Glassmorphism escuro, 1 par de cor.
- Marca premium → Minimalismo, Aurora ou Editorial.
- Moda / streetwear (VM) → Editorial, Colagem, Y2K ou Grafite (monocromático + 1 vermelho).
- Tecnologia / IA → Futurista, Glassmorphism, Cyberpunk, Swiss.
- Tutorial / dados → Swiss ou Vector art.
- Viral / humor / oferta → Pop art ou Maximalismo.
- Cristão / bem-estar → Boêmio, Handwritten, Minimalismo com par quente.

## 3. Fórmula de "motion" profissional (Fernando Rank — 5 prompts)

Todo vídeo motion se descreve em 5 decisões — usar como checklist de planejamento:
1. **Formato e duração** (15s/30s, 9:16 ou 16:9).
2. **Paleta** em poucas palavras: "fundo preto, P&B", "duas cores ([COR] + quase-preto)", "fundo escuro com brilho colorido", "alternando cinza claro e grafite com azul e vermelho de destaque".
3. **Tipografia**: headline grande com reveal palavra por palavra; extra bold caixa alta; condensada pesada; **bold + 1 palavra por frase em serif itálica colorida**.
4. **Transições**: cortes secos, echo trail (rastro), motion blur, blur, wipes e íris.
5. **Cenas em sequência** (seta →): abertura com logo/elemento-semente → frases → objeto protagonista → benefícios em cards → logo + tagline.

Os 5 modelos (estrutura pronta):
- **Apresentação de app** (30s): minimalista P&B, headlines palavra por palavra, mockups de UI, cortes secos com echo trail; elementos terminam formando o logo.
- **Showreel de motion** (15s): fundo alternando cinza claro/grafite, condensada pesada, azul e vermelho de destaque, notas manuscritas com setinhas. Ensina princípios: bolinha com squash & stretch vira o ponto final da frase; palavras animadas pelo próprio significado; gráfico linear vs ease-in-out; cobrinha de pontos (follow-through); dial até 100% (anticipation).
- **Lançamento de app** (30s): fundo escuro com glow colorido, iPhone 3D flutuando, palavra-chave na cor, zoom na tela, cards saltando do celular com blur, celulares em leque no final.
- **Produto em destaque** (15s): duas cores (cor + quase-preto), extra bold caixa alta, produto 3D girando, pontinho que explode, close de detalhes, benefícios em cards orbitando o produto, motion blur + echo trail.
- **Apresentação pessoal** (15s): preto alternando com a cor, linha vira pílula que forma o "O" do nome, foto em círculo com texto girando, números com count-up, botão "Seguir" sendo clicado.

Visual do próprio carrossel (bom modelo de capa/card): azul-marinho quase preto com glow azul no canto, pílula "PROMPT 01" com tracking, título em sans pesada branca com a 2ª metade na cor de destaque.

## 4. Showreel "Claude motion designer" (MotionLove)

Mostra o que é "nível alto" em motion feito por código, com cada cena numa paleta de 2 cores:
- Abertura: grid de pontos no escuro → uma linha laranja varre → flash → "CLAUDE." em sans pesada preta sobre laranja + "motion designer" em serif itálica (mesma regra: bold + serif).
- Grid 3D de quadrados que vira superfície ondulando (laranja/roxo) — câmera em perspectiva.
- Palavras de impacto uma por tela, cada uma num par diferente: "EVERY" (preto sobre off-white) → "SINGLE" repetido em eco sobre azul → "on purpose." (serif itálica sobre laranja).
- Dashboard: "+312%" com count-up, gráfico de barras crescendo, anel de porcentagem.
- Partículas em fluxo, círculo de pontos girando, card de UI "Render queue" sobre azul, formas pretas (bolhas) se fundindo sobre laranja (metaball) que viram um ponto → o ponto vira o "•" do logo final.
- Lição: **paleta de 3 cores fixas (laranja, azul royal, quase-preto) + off-white**, alternadas por cena; o elemento final nasce de um elemento da cena anterior (continuidade por forma).
- Apresentação do post: tela gravada num notebook real com reflexo na mesa, legenda inclinada no topo com o asterisco do Claude.

## 5. Matheus Gomes ("skill que procura skill")

Conteúdo, não design: talking head cru, câmera na mão, frase-gancho fixa no topo o vídeo todo, insert rápido da tela do site. Reforça o padrão "frase fixa no topo + B-roll de tela filmada" (R2/R4). Cita a skill "find-skills" (buscar skills por necessidade).

## Passo automático na edição

1. Classificar o vídeo (DIRECAO §1) → escolher **estilo** (§2) e **par de cor** (§1) que combinam com o assunto/tom; marca do cliente sobrepõe.
2. Montar as cenas com a fórmula de 5 decisões (§3).
3. Fundo/legenda/pílulas/cards só nas cores do par; neutro quente no lugar de branco puro.
4. Tipografia: sans pesada (`heavy`/`display`) + 1 palavra em serif itálica (`serif`) na cor.
5. Na entrega, dizer em 1 linha: "estilo X, par Y".
