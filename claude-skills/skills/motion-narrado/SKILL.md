---
name: motion-narrado
description: Motion design NARRADO em código (Remotion), aprovado pelo Gabriel em 17/10/2026 ("esse modelo é um motion design, parabéns!"): um texto/roteiro vira um Reel 9:16 de 40–90 s em que cada frase ganha uma METÁFORA VISUAL própria, sincronizada palavra por palavra com a voz (TTS grátis ou voz dele), com estilo + par de cor escolhidos sozinho, trilha e efeitos sonoros. Use quando o Gabriel mandar um texto/roteiro para narrar ("vou narrar isso", "faz um motion com esse texto"), vídeo de opinião, explicativo narrado, devocional, faceless com voz, ou pedir "motion design" de um texto.
---

# Motion narrado (receita aprovada: "2º Turno")

Exemplo pronto: `exemplo/Eleicoes2Turno.tsx` (+ `exemplo/eleicoes.words.json`). Texto de opinião cristã sobre o 2º turno, 70 s, 18 cenas, estilo **Editorial**, par **Wine Red #7F011F + Light Sand #F5EBD0** (+ quase-preto com tom vinho #170408).
A biblioteca usada está em `lib/`, os scripts em `scripts/`, o guia completo do estúdio (lições técnicas, ferramentas) em `GUIA-ESTUDIO.md` e o catálogo de técnicas em `TECNICAS.md`. Leia também a skill `efeitos-aprendidos` (DIRECAO.md + CORES-E-DESIGN.md), que decide estilo e cor.

## O que fez o vídeo ser aprovado
1. **Cada frase = uma ideia visual, não só texto.** Nunca "texto bonito na tela" o vídeo todo. Exemplos da receita:
   | Fala | Metáfora |
   |---|---|
   | "segundo turno" | número gigante "1º" rola e vira "2º" no instante da palavra |
   | "a Bíblia nos ensina" | Bíblia aberta desenhada em traço (SVG stroke-dashoffset) |
   | "cenário caótico" | palavra tremendo com cópias RGB deslocadas + traços girando (noise2D) |
   | "esquerda ou direita" | tela dividida, cada lado com o nome na vertical, selo "ou" no meio |
   | "opção ruim / ainda pior" | dois cartões com polegar para baixo entrando com mola |
   | "nenhum lado é o ideal" | cruz de luz se desenhando + "ideal" riscado |
   | "não vota" | CARIMBO batendo (escala 2,8→1 com mola, borda áspera por feDisplacementMap) + tremida + som de impacto |
   | "em 1790" | ano contando de 2026 até 1790 com blur de velocidade e riscos de "rebobinar"; o quadro antigo abre em ÍRIS |
   | "surge esquerda e direita" | assembleia em semicírculo: cadeiras da esquerda enchem de vinho, as da direita de preto + nota histórica curta |
   | "não se encaixava" | cruz cai num encaixe quadrado, bate na borda, treme e é rejeitada com ✕ |
   | "igrejas fechadas, perseguidos, exilados" | quadro escurecido + 3 carimbos em sequência |
   | "esquerda e Cristo não andam juntos" | as duas palavras se afastam e um "≠" se desenha entre elas |
   | lista de itens | tabela de jornal numerada (01, 02…) com ✕ se desenhando em cada linha |
   | "deturpações" | a palavra se deforma de verdade (feTurbulence + feDisplacementMap animado) |
   | "não quero dizer em quem votar" | cédula com os quadrados VAZIOS e a caneta flutuando ao lado (cuidado: a caneta não pode parecer marcar) |
   | frase final | cena escura, cruz acesa ao fundo, frase em serif gigante, push-in lento e fade para preto |
2. **Assinatura do vídeo:** cortes SECOS alternando o fundo entre as 3 cores (vinho / areia / quase-preto) + flash curto de 5 quadros na cor oposta + carimbos. Um efeito-assinatura por vídeo; o resto só pontua.
3. **Moldura editorial fixa:** cabeçalho de jornal ("ELEIÇÕES 2026" · "2º TURNO", régua fina) e barra de progresso embaixo em todas as cenas (componente `Chrome`). Dá identidade e cara de "série".
4. **Tipografia:** Montserrat 900 (`heavy`) para palavras de impacto + Instrument Serif itálico para a palavra emocional + Inter para o apoio (palavras de apoio com `dim`). Nunca dois tamanhos iguais para título e apoio.
5. **Fundo nunca parado:** glow radial da cor se movendo, grão de filme, `SceneShell` (entrada zoom+blur, câmera com drift/rotação leve, saída blur).
6. **Som:** narração 100% + trilha dramática da Pixabay a ~0,16 (sobe para ~0,2 no clímax histórico e ~0,32 no fim), whoosh 0,22 nas trocas de cena, whip no "rebobinar", thump 0,7 em cada carimbo.

## Passo a passo
1. **Texto:** corrija os erros de digitação só na narração (ex.: "suiciente" → "suficiente") e avise o Gabriel quais foram. Não mude o sentido nem amenize a opinião dele.
2. **Voz:**
   - teste: `node scripts/tts.mjs <nome> "<texto>" pt-BR-AntonioNeural 1.05` (Edge TTS grátis, pacote `msedge-tts`; gera `public/audio/<nome>.mp3` + `<nome>.words.json` com o tempo de cada palavra).
   - voz real: ele grava → `public/audio/<nome>.m4a` → `node scripts/transcribe.mjs public/audio/<nome>.m4a` (Whisper local; `scripts/setup-whisper.mjs` instala) → mesmo formato de words.json. Trocar o import no .tsx e ajustar `SCENE_STARTS` pelos novos índices.
   - (no outro PC há também a skill `ia-gratis` → Fish Audio para voz PT-BR melhor.)
3. **Listar as palavras com índice e tempo** (`node -e` lendo o words.json) e definir `SCENE_STARTS` = índice da 1ª palavra de cada cena (`scenesFromWords` em `lib/timing.ts`). Cena de 2–4 s; frase longa vira 2 cenas.
4. **Escolher estilo + par de cor** (CORES-E-DESIGN.md) pelo assunto: opinião/documentário → Editorial; para fé/bem-estar, Minimalismo ou Handwritten com par quente. Dizer na entrega "estilo X, par Y".
5. **Imagem histórica/real:** pintura de domínio público pelo Wikimedia: `curl -sL -A "motion-studio/1.0" -o public/<pasta>/x.jpg "https://commons.wikimedia.org/wiki/Special:FilePath/<Arquivo>.jpg?width=1600"` (confira com `file`: se vier HTML, o nome está errado). Registrar em `public/<pasta>/credits.json`. Tratamento: sépia + multiply na cor forte + gradiente escuro em cima e embaixo; versão "escura" = grayscale + brightness 0,45.
6. **Música:** Pixabay Music bloqueia curl (Cloudflare). Abra a busca no navegador do app (`pixabay.com/music/search/<termos>/`), pegue os links das faixas por JS, faça `fetch` da página da faixa e extraia `cdn.pixabay.com/download/audio/...mp3` do HTML; o download do CDN com curl + `-e https://pixabay.com/` funciona. Escolha a parte da faixa medindo a energia a cada 5 s (`ffmpeg ... astats ... RMS_level`) e use `trimBefore` para o crescendo cair no clímax. Créditos em `public/music/credits.json`.
7. **SFX de impacto sintetizado (grátis):** `ffmpeg -f lavfi -i "sine=f=52:d=0.6" -f lavfi -i "anoisesrc=d=0.12:c=brown:a=0.9" -filter_complex "[0]afade=t=out:st=0:d=0.6,volume=2[a];[1]afade=t=out:st=0:d=0.12[b];[a][b]amix=inputs=2:normalize=0,alimiter" -ar 44100 public/sfx/thump.wav`
8. **Montar** `src/videos/<Nome>.tsx` copiando o exemplo: componente `Scene` (fundo + `SceneShell` + `Chrome` + `Flash`) no TOPO do arquivo (definir componente dentro do componente remonta tudo a cada quadro). Registrar em `src/Root.tsx` com `durationInFrames = fim da última palavra + ~3 s`.
9. **Conferir antes de entregar:** render de prévia `--scale=0.4`, folha de quadros com o ÚLTIMO quadro de cada cena (`ffmpeg -vf "select='eq(n,A)+eq(n,B)...',scale=216:384,tile=9x2"`) e outra com os quadros do MEIO das animações. Problemas que apareceram e foram corrigidos:
   - texto em tamanho grande ou carimbo girado saindo pelas bordas (reduzir 170→138/140 px em palavras de 8+ letras);
   - texto encostando no cabeçalho (topo mínimo ~300 px, porque o `SceneShell` entra com escala 1,14);
   - cena começando vazia até a 1ª palavra (antecipar a entrada para a palavra anterior);
   - elemento que dá a mensagem errada (caneta que parecia marcar a cédula).
   - `freezedetect` só pode acusar o fade final.
10. **Render final:** `npx remotion render <Id> out/<nome>.mp4 --crf=18 --concurrency=6` (~3 min para 70 s) e entregar com SendUserFile + lista curta "fala → efeito". Oferecer trocar pela voz dele.

## Componentes do exemplo (reaproveitar)
`Bg` (wine/sand/ink), `Chrome`, `Flash`, `shakeAt`/`ShakeWrap`, `Stamp`, `PillWord`, `Rule`, `DrawnCross`, `Painting` (Ken Burns + grade), `Hook` (número que rola), `OpenBook`, `ChaosField`/`ChaosWord`, `SplitChoice`, `BadCards`, `StrikeLine`, `Rewind` (contador + íris), `Hemicycle`, `Sunburst` (raios girando), `MisFit`, `NotEqual`, `Ledger`, `Distorted`, `BallotCard`, `Finale`.
`lib/Kinetic.tsx` → `KineticText` com tokens `serif | accent | pop | dim | scale | heavy | weight | text` (cada token aparece no quadro em que a palavra é falada).

## Montar o estúdio num PC sem ele
Este estúdio é Remotion **4.0.536 + React 19** (o `motion-design` do outro PC usa React 18; dá para ter os dois, mas não misture as libs no mesmo projeto sem conferir).
```
npx create-video@latest motion-studio   # template em branco, TypeScript
cd motion-studio
npm i remotion@4.0.536 @remotion/cli@4.0.536 @remotion/media @remotion/noise @remotion/google-fonts @remotion/transitions @remotion/paths @remotion/shapes @remotion/media-utils msedge-tts
```
Copie `lib/` → `src/lib/`, `scripts/` → `scripts/`, o exemplo → `src/videos/` e o words.json → `public/audio/`. Fontes: `lib/fonts.ts` (Inter, Anton, Instrument Serif, Montserrat via @remotion/google-fonts). `lib/Premium.tsx` e `lib/Talking.tsx` são de talking head (pessoa recortada) e não são necessários para o motion narrado.
