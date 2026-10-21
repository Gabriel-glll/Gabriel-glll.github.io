# Referências estudadas — como cada uma é feita

Análise quadro a quadro (folhas de quadros + detecção de cortes `ffmpeg scdet`). Aqui fica o "como", não demos. Usar junto com `DIRECAO.md`.

---

## Lote 4 (17/10/2026) — vídeo imobiliário (o estilo que o usuário quer)

Como obter: reel público abre em `/reel/<id>/embed/captioned/` (o `<video>` traz o mp4), mas reels com música licenciada só mostram a capa no embed. Nesses casos, abrir `/reel/<id>/` no navegador do app e ler `"video_versions":[{"type":..,"url":"..."}]` do HTML (funciona até sem login).

### R7 — xepafilmes DarDTUlu4e9 "a chave do futuro lar" (29s, 25 cortes, ~1s por plano)
**O que é:** FILMAGEM real (gimbal) de casa de alto padrão + corretor de verdade.
- 0–6s: bastidor (videomaker e corretor combinando), com legenda pequena branca: "o corretor queria um gancho criativo / olha o resultado:".
- 6,5s: flash de luz quente (light leak laranja + branco), seguido de plano aberto com o corretor ao fundo. Ele joga a chave NA lente, a chave cresce até tapar a câmera e ele surge em close fazendo joinha. Legenda "E essa / *é a chave* / do seu futuro lar", com o destaque em amarelo itálico.
- 11–13s: giros rápidos com desfoque de movimento real (a câmera gira), fachada, quadro encolhendo para cartão e flash branco.
- 14,5s: nome do condomínio em letras 3D gigantes, com textura, deitadas na grama/piso (é composição 3D rastreada, não texto chapado).
- 15–26s: tour com cortes de ~1s, sempre com a câmera andando. Texto 3D rastreado no deck da piscina ("MOBILIADA E DECORADA") e "431m²" flutuando.
- 27–29s: flash branco e revelação aérea/girando da casa toda. Sem cartão de preço e sem CTA.
**Reproduzido em** `src/videos/ImovelCA0036.tsx`. ❌ O usuário reprovou ("ficou bem feio"): com fotos paradas, o zoom não parece câmera andando, e textos/cartões a mais deixaram com cara de template.

### R8 — ar.amegh_ajay DdjUplSsOaZ "do render à casa" (11,5s, 2 cortes)
**O que é:** arquiteto na mesa à noite (luz âmbar). Ele "puxa" a maquete 3D da tela do notebook com a mão. Ela flutua como holograma azul com interface (linhas, ícones), vira maquete física e há corte casado para a casa REAL construída no mesmo ângulo, em plano de drone que se aproxima. No fim, volta ao notebook (loop).
**Técnica:**
- Quase sem cortes: é uma tomada contínua com transformações (tela, holograma, maquete, casa real). O "uau" é a transformação no mesmo enquadramento.
- Holograma: render da casa com tom ciano, linhas de contorno brilhando, UI flutuante e partículas, seguindo a mão. Dá para fazer com IA de vídeo (início/fim) ou com composição 3D sobre a filmagem da mão.
- Corte casado (match cut): maquete e casa real no mesmo ângulo e tamanho na tela.
- Luz quente de abajur, sem texto na tela, só música.
**Como reproduzir:** gravar a mão "pegando" algo da tela (ou gerar com IA) + o render/foto da casa como holograma (`mixBlendMode: screen`, tom ciano, contorno brilhante) + IA de vídeo para a transição maquete→casa real (quadro inicial = maquete, quadro final = foto da fachada). Ideal para lançamento na planta (render → obra pronta).

### R9 — montani3d DSC6w8LEUv2 "render vira vídeo com IA" (31,8s, quase 1 tomada)
**O que é:** "voo" contínuo feito 100% com IA a partir de renders. Começa na Terra vista do espaço, desce pela cidade e pelo terreno vazio, mostra a planta brilhando no lote, o prédio "nasce" de luz laranja e vira o render final. Depois vêm os cômodos em círculos com linhas pontilhadas e texto de ficha técnica, o mapa da região com rotas brilhando, o dia virando noite e o zoom de volta à Terra.
**Técnica:**
- Tomada contínua impossível encadeando clipes de IA (o fim de um = o começo do próximo), com a câmera sempre se movendo.
- Gráficos laranja neon (contorno do prédio, lote, rotas) desenhados por cima, com brilho (glow) e linhas pontilhadas ligando o prédio a "bolhas" circulares com fotos dos ambientes e textos técnicos pequenos.
- Gradação escura e dessaturada na cidade, com o prédio em destaque e laranja como única cor forte.
- Timelapse dia→noite no mesmo enquadramento (IA ou duas imagens com transição).
**Como reproduzir:** IA de vídeo com quadro inicial e final (Kling/Veo) para os trechos de voo, mais Remotion para o neon: `@remotion/paths` (`evolvePath`) para contornos e rotas, `filter: drop-shadow` em camadas para o glow, círculos com foto (`border-radius: 50%` + borda laranja) ligados por `stroke-dasharray`. Mapa/Terra: `MapRouteLab`/`EarthLab` já existem.

### R10 — anielsciunitti DcZIj9jqrfo "tour cinematográfico" (88s, 44 cortes, ~2s por plano)
**O que é:** FILMAGEM real de casa de alto padrão, estilo filme. Quase sem texto (só o logo pequeno no começo).
**Técnica:**
- Abre com fade do preto e planos de baixo para cima (contra-plongée) da fachada e do beiral contra o céu.
- Gimbal lento e constante: travelling lateral, entrada pelo corredor, subida pela escada. Planos de 1,6–2,4s, cortes no ritmo da música.
- Transições: chicote com desfoque real (17,5s), objeto em primeiro plano passando e "limpando" a tela (pilar ou parede, 18s), e corte seco no resto.
- Cor quente e suave (madeira, luz indireta), contraste baixo, brancos levemente cremosos. Nada saturado.
- Ordem: fachada, entrada, lustre, jardim, corredor, escada, estar, jantar, cozinha, quartos, banho, piscina e fachada no fim.
**Como reproduzir:** precisa de vídeo filmado. Com fotos, só se aproxima com paralaxe 2.5D (`scripts/parallax.py`) ou IA de vídeo, com movimentos lentos (dolly/travelling de 2s) + passagem de objeto em primeiro plano (máscara de um recorte escuro cruzando a tela) + gradação quente leve.

### Conclusão do lote 4
- Das 4 referências, 2 são filmagem (R7, R10) e 2 são IA de vídeo sobre render (R8, R9). **Nenhuma usa foto parada.** O que vende é o movimento de câmera contínuo.
- Texto é raro e integrado à cena (3D rastreado, ou nenhum). Nada de cartões, pílulas ou legenda grande o tempo todo.
- Com fotos do anúncio, o caminho é transformar cada foto em clipe com movimento: paralaxe local grátis (`scripts/parallax.py`) ou IA de vídeo paga (Kling/Veo) para movimentos maiores e "voos".

---

## Lote 3 (17/10/2026) — padrão-ouro de qualidade

### R6 — tiagolemosx "Máquina de Edição IA" (28s, Ddt-jBng9Zo) — META DE NÍVEL DO USUÁRIO
**O que é:** anúncio talking head (2 gravações: jaqueta clara no set roxo + jaqueta preta com microfone) com um "sizzle" no meio mostrando cada técnica de edição rotulada. Cortes: 7,7 · 8,4 · 10,2 · 12,0 · 13,5 · 13,8 · 14,2s; fora do sizzle quase não há corte — a edição vive em CAMADAS sobre a mesma tomada.
**Estrutura:** 0–7,7s gancho ("o vídeo de vendas do meu treinamento foi editado 100% por IA… são 3 minutos") → 7,7–14,2s sizzle de técnicas (~0,4–1,3s cada) → 14,5–22s prova ("e tá nessa página, assiste e me diz se dá pra perceber") → 22–28s CTA + logo + cartão final.
**Por que parece profissional (o que medir na nossa edição):**
1. **Uma paleta só, o vídeo inteiro:** set já iluminado em roxo/magenta (LED no fundo), pretos esmagados; TODOS os gráficos usam o mesmo roxo (#7c5cff/lavanda) — pílulas, palavra-chave da legenda, brilho das molduras, cartão final. Nada de cor fora da paleta.
2. **Título atrás da cabeça** no topo (texto atrás, recorte da pessoa na frente): sans extra-pesada branca ("NOVA ERA", "100%", "PÁGINA") + linha 2 dentro de pílula roxa ("EDITADO POR IA") + "kicker" minúsculo com tracking largo acima ("SÃO", "E TÁ NESSA", "SE VOCÊ JÁ É"). Entrada letra a letra com blur/wipe, ~8–10 quadros; fica parado enquanto a frase dura e sai com blur.
3. **Contraste tipográfico no clímax:** "DÁ PRA / PERCEBER?" — linha 2 em display CONDENSADA altíssima (outra família) caindo de cima com blur. Só uma vez no vídeo = assinatura.
4. **Legenda discreta:** pequena (≈4% da altura), branca, peito da pessoa, acumula palavra por palavra, palavra-chave em lavanda ("100%", "perceber", "igual", "máquina"). Não compete com o título.
5. **Elementos de UI flutuando atrás/ao lado da cabeça, com glow roxo:** player "VSL – Máquina de Edição IA" que se preenche de miniaturas; celular "NA PÁGINA" com foto P&B; tablet inclinado "05 primeira edição" no CTA. Sempre com borda fina luminosa + sombra, entram com escala+blur.
6. **Sizzle rotulado:** cada técnica ganha um rótulo-pílula pequeno (CORTES, LEGENDA, TEXTO ATRÁS, IMAGENS, MOLDURA, 3D, MOTION LETTERING, EDITOR) e uma demonstração de 1s: tela do editor com timeline e playhead; cantoneiras de foco em volta do rosto; letreiro gigante em contorno correndo em faixas atrás da pessoa (marquee); tela dividida B-roll (beija-flor) + scrubber; card "Abre espaço para explicar"; 5 painéis de vidro em perspectiva 3D ("5 camadas · profundidade real"); letras subindo escalonadas; mosaico de dezenas de miniaturas dando zoom-out ("NA SUA ESCALA").
7. **CTA persistente:** pílula roxa "Toque em Saiba mais +" fixa sob a legenda nos últimos 8s; logo entra sobre a pessoa e o vídeo fecha num cartão gradiente roxo escuro com logo + slogan + seta descendo.
8. **Movimento contínuo sutil:** câmera com push-in lento; nenhum gráfico 100% parado (glow pulsando, miniaturas deslizando).
**Ferramentas nossas:** `PersonCutout`/`BehindWord` (título atrás), `CaptionBox` (legenda), `UICard`, `KineticText`, `@remotion/three` (painéis 3D), `record-site` (tela do editor). **Novas:** T26–T31 em `src/lib/Premium.tsx` — ✅ aprovado pelo usuário em 17/10 ("ficou no nível"). É técnica aprendida para usar quando o vídeo pedir, NÃO padrão obrigatório.
**Limite honesto:** metade do "nível" é a GRAVAÇÃO — set com luz de fundo colorida, câmera nítida com fundo desfocado, microfone de lapela, enquadramento do peito pra cima com espaço livre acima da cabeça (onde mora o título). Sem isso a edição não alcança.

## Lote 2 (17/10/2026)

### R1 — Soliê Jóias "#chaostrend" (17s, 0 cortes)
**O que é:** tomada contínua gerada por IA. Modelo anda em Paris à noite → esbarra num homem → o celular voa (tela: "chamada de SOLIÊ JÓIAS") → a sacola cai, as caixas abrem, as joias flutuam em câmera lenta girando → tudo pousa organizado no chão molhado como vitrine; o homem some ao fundo.
**Técnica:**
- "Chaos trend": um acidente vira apresentação de produto. Narrativa em 3 atos sem corte: vida normal (0–4s) → caos em câmera lenta (4–13s) → produto arrumado como vitrine (14–17s).
- Feito com IA de vídeo encadeando quadro inicial e final (first/last frame): gerar a imagem 1 (modelo andando com sacola da marca) e a imagem final (produtos arrumados no chão, mesmo cenário), e pedir à IA de vídeo a transição física entre elas. Se o modelo não aguentar 17s, encadear 2–3 clipes usando o último quadro de um como primeiro do próximo.
- Marca aparece 3 vezes de forma "natural": tela do celular, sacola, caixas. Câmera baixa acompanhando a queda; profundidade de campo rasa; luzes de cidade em bokeh.
- Ferramentas aqui: FLUX/Kontext para os quadros-chave com o produto real (`scripts/ai.py edit`), Wan 2.2 FLF2V ou Kling (site, créditos grátis) para o movimento, `scripts/enhance.sh` para HD.
**Quando usar:** produto físico pequeno (joia, acessório, roupa, perfume), tom viral/curioso, sem fala. Legenda curta e irônica ("nem pediu desculpas").

### R2 — Tales Cavalcanti "vibecoders pt.5" (19s, cortes em 2,9 / 9,1 / 13,3s)
**O que é:** série de dicas de ferramentas. 3s de rosto com gancho, depois B-roll filmado com o celular de um notebook mostrando cada ferramenta.
**Técnica:**
- Gancho falado + título fixo no topo em serif (tipo Instrument Serif) com sombra: "Vibecoders legais não guardam segredos pt.5". "pt.5" = formato de série (gera retorno).
- Cada ferramenta = 1 bloco de ~4–6s: título serif (nome da ferramenta) + subtítulo pequeno de 2 linhas (o que ela faz), no topo; abaixo, a tela rolando filmada de mão (tremida natural, ambiente escuro, teclado aparecendo).
- CTA escrito no rodapé no último bloco ("comenta 'código' que eu te mando na DM").
- Ritmo: troca de bloco a cada ~4–5s, sem efeitos — a informação é o conteúdo.
**Como reproduzir sem filmar:** `record-site.mjs` + `CornerPin` numa foto de notebook escuro + leve tremida de mão (já temos em `SiteLab`). Título com `serif` + sombra.
**Quando usar:** conteúdo de lista/dicas, série recorrente, perfil educativo.

### R3 — WRN Essentials (8s, 48 cortes)
**O que é:** identidade de marca de roupa em montagem estroboscópica, preto e branco.
**Técnica (medida):**
- **Rampa de cortes desacelerando:** cortes a cada 2 quadros (0,067s) durante 1,7s → 0,2s → 0,13s → depois cada intervalo cresce: 0,17 · 0,2 · 0,23 · 0,27 · 0,3 · 0,33 · 0,4 · 0,47 · 0,57 · 0,66s → termina segurando no logo. Fórmula: intervalo_n ≈ 0,067 × 1,2^n depois do trecho rápido. Começa no caos e "respira" até o logo.
- **Positivo/negativo:** a mesma foto aparece normal e invertida (negativo) em sequência — dobra a quantidade de cortes sem precisar de mais fotos e dá textura de "flash". (`invert()` de `@remotion/effects` ou `filter: invert(1)`.)
- Material: fotos de estúdio fundo cinza/preto, peças flat (moletom), etiqueta pendurada, close de tecido, boné, cartela de cores (LIGHT/DARK/DEEP), modelos andando na água. Logo minúsculo central em quase todo plano ("wrn").
- Paleta só preto/branco/cinza; o único "efeito" é o ritmo.
**Como reproduzir:** igual `BrandLab` (corte por plano) trocando a lista de tempos pela rampa acima e alternando `invert` nos planos pares.
**Quando usar:** marca de roupa/lifestyle, lançamento, abertura de perfil. Sem fala, só batida.

### R4 — Shivansh "LAUNCH" (75s, 0 cortes)
**O que é:** uma única tomada de celular na mão mostrando um notebook que rola sites imobiliários de luxo; legenda fixa no topo o vídeo inteiro: "The website your $10M project actually deserves."
**Técnica:**
- Zero edição: o valor está no material (sites premium) e numa frase-gancho fixa que fala com o público (incorporador com projeto de US$ 10M).
- Ambiente real (luzes de café/árvore, reflexo) dá autenticidade; a tela fica levemente em perspectiva.
- O vídeo longo (75s) segura porque cada tela é um "slide" novo (planta, render, galeria, tipografia grande).
**Como reproduzir:** `record-site.mjs` (rolagem lenta, muitas telas) + `CornerPin` em foto de notebook com ambiente; texto fixo no topo em fonte condensada branca com sombra; câmera com tremida leve contínua.
**Quando usar:** vender serviço de site/design; portfólio; prova de qualidade. Gancho = valor do cliente ("o site que seu projeto de 10 milhões merece").

### R5 — Maximiliano Carrau "Claude + design" (23s, corte médio 1,28s)
**O que é:** tela dividida: B-roll em cima (~45%), pessoa falando embaixo; legenda grande na linha de divisão.
**Técnica:**
- **Legenda:** 2–3 palavras por vez, fonte condensada pesada em caixa alta, branca com contorno/sombra, palavra-chave em LARANJA. Fica exatamente na emenda entre os dois quadros.
- **Badges numerados** verdes ("#1", "#2") sobre a legenda para marcar itens da lista.
- **B-roll:** prints de sites, telas das ferramentas, logos isolados (Figma, Playwright) que "pulam" em fundo preto; às vezes o B-roll ocupa a tela inteira por 1–2s e a pessoa some.
- Cortes a cada ~1,3s, sempre na troca de assunto da fala.
- Conteúdo citado (útil para sites, não para vídeo): skills de design do Emil Kowalski, "impeccable" (tipografia/espaçamento/animação), "taste" (fugir da cara genérica de IA), MCP do Figma + Playwright.
**Como reproduzir:** `TalkLabCard` (layout dividido) + `CaptionBox` trocando para fonte `display`, palavra-chave laranja e posição na emenda; badge "#n" acima; logos com pop (escala com overshoot `Easing.back`).
**Quando usar:** pessoa falando + lista de ferramentas/passos, tom confiante-enérgico.

---

## Padrões que se repetem (lote 1 + 2)

- **Formato série** ("pt.5", "#1 #2") aumenta retenção e retorno.
- **Frase-gancho fixa no topo** o vídeo todo funciona para B-roll sem fala (Shivansh, wearebrand, Fernando, Nicolas).
- **Marca de roupa = monocromático + ritmo**: Platter, WRN e OFFSEN não usam efeito chamativo; usam corte na batida, negativo/duotone, close de tecido e etiqueta.
- **IA de vídeo = tomada contínua impossível** (Soliê, OFFSEN, Imob): o "uau" vem do movimento físico, não de efeito de pós.
- **Pessoa falando** sempre tem legenda com palavra-chave colorida (laranja, amarelo ou serif itálica) e B-roll trocando a cada 1–2s.
